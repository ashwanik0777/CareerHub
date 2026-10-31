import { env, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';
import { resolveModelDir } from '../config';
import { ModelHealth } from '../types';
import { startTimer } from '../utils/timer';
import { modelRegistry } from './registry';
import { predictionCache } from '../cache/predictionCache';

// Restrict to local models only
env.allowRemoteModels = false;

interface LoadedModel {
  tokenizer: any;
  model: any;
}

/**
 * Grace period before an evicted ONNX session is disposed. Requests that
 * obtained the old session before the swap finish well within this window;
 * disposing immediately would crash them (use-after-dispose).
 */
const DISPOSE_GRACE_MS = 30_000;

export class ModelLoader {
  private loadPromise: Promise<LoadedModel> | null = null;
  private loadedModel: LoadedModel | null = null;
  private reloadPromise: Promise<void> | null = null;
  private status: 'healthy' | 'unhealthy' | 'uninitialized' | 'error' = 'uninitialized';
  private lastError: string | undefined = undefined;
  private warmedUp = false;
  private totalLoadTimeMs = 0;
  private totalWarmupTimeMs = 0;
  private requestCount = 0;
  private totalLatencyMs = 0;

  /**
   * Returns the active tokenizer + model, loading them on first use.
   * Concurrent callers share one load promise. When the on-disk model changes,
   * the new version is loaded in the background while the current one keeps
   * serving; it is swapped in atomically only once it has loaded and warmed up.
   */
  async load(): Promise<LoadedModel> {
    if (this.loadedModel) {
      if (modelRegistry.checkForUpdates()) {
        this.scheduleHotReload();
      }
      return this.loadedModel;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadFromDisk()
      .then((loaded) => {
        this.loadedModel = loaded;
        return loaded;
      })
      .catch((error) => {
        // Clear the failed promise so the next request retries the load.
        this.loadPromise = null;
        throw error;
      });

    return this.loadPromise;
  }

  /** Loads + warms up a model from disk. Never touches the active model. */
  private async loadFromDisk(): Promise<LoadedModel> {
    const timer = startTimer();
    try {
      const modelDir = resolveModelDir();
      console.log(`[ModelLoader] Initialising load from directory: ${modelDir}`);

      // Absolute folder path as model ID bypasses any remote repository lookup.
      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained(modelDir),
        AutoModelForSequenceClassification.from_pretrained(modelDir, { dtype: 'q8' }),
      ]);

      const loaded: LoadedModel = { tokenizer, model };
      this.totalLoadTimeMs = timer();
      console.log(`[ModelLoader] Model successfully loaded in ${this.totalLoadTimeMs}ms.`);

      // Warm up the ONNX Runtime session (prevents a slow first inference).
      await this.warmup(loaded);

      this.status = 'healthy';
      this.lastError = undefined;
      return loaded;
    } catch (error: any) {
      console.error('[ModelLoader] Critical model load error:', error);
      this.status = 'error';
      this.lastError = error.message || String(error);
      throw error;
    }
  }

  /**
   * Background hot reload. The registry is acknowledged up front so the
   * (throttled) update check does not keep re-triggering; if the new load
   * fails, the previous model keeps serving and the error is reported via
   * getHealth(). The next on-disk change triggers another attempt.
   */
  private scheduleHotReload(): void {
    if (this.reloadPromise) return;
    modelRegistry.acknowledgeUpdate();
    console.log('[ModelLoader] On-disk model changed; loading new version in the background...');

    this.reloadPromise = this.loadFromDisk()
      .then((fresh) => {
        const previous = this.loadedModel;
        this.loadedModel = fresh;
        this.loadPromise = Promise.resolve(fresh);
        // Predictions from the old weights must not be served for the new model.
        predictionCache.clear();
        this.disposeLater(previous);
        console.log('[ModelLoader] Hot reload complete; new model active.');
      })
      .catch(() => {
        // loadFromDisk already logged and recorded the error; keep serving the old model.
        if (this.loadedModel) this.status = 'healthy';
      })
      .finally(() => {
        this.reloadPromise = null;
      });
  }

  private disposeLater(previous: LoadedModel | null): void {
    if (!previous) return;
    const timer = setTimeout(async () => {
      try {
        await previous.model?.dispose?.();
      } catch (disposeError) {
        console.warn('[ModelLoader] Failed to dispose previous model session:', disposeError);
      }
    }, DISPOSE_GRACE_MS);
    // Never keep the process alive just for this cleanup.
    timer.unref?.();
  }

  /**
   * Executes a mock prediction to warm up the internal execution context.
   */
  private async warmup(loaded: LoadedModel): Promise<void> {
    console.log('[ModelLoader] Initiating model session warmup...');
    const timer = startTimer();

    try {
      const { tokenizer, model } = loaded;
      const inputs = await tokenizer('warmup', {
        padding: true,
        truncation: true,
        max_length: 128,
      });

      await model(inputs);

      this.warmedUp = true;
      this.totalWarmupTimeMs = timer();
      console.log(`[ModelLoader] Session warmed up successfully in ${this.totalWarmupTimeMs}ms.`);
    } catch (error) {
      this.warmedUp = false;
      console.error('[ModelLoader] Warmup run failed:', error);
    }
  }

  /**
   * Internal telemetric monitoring helper.
   * @param ms   wall time of the forward pass
   * @param count number of fields served by that pass (batches count each field)
   */
  recordLatency(ms: number, count = 1): void {
    this.requestCount += count;
    this.totalLatencyMs += ms;
  }

  /**
   * Runtime inference statistics for the metrics endpoint.
   */
  getStats(): { totalPredictions: number; avgLatencyMs: number; loadTimeMs: number; warmupTimeMs: number } {
    const avgLatency = this.requestCount > 0 ? this.totalLatencyMs / this.requestCount : 0;
    return {
      totalPredictions: this.requestCount,
      avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
      loadTimeMs: this.totalLoadTimeMs,
      warmupTimeMs: this.totalWarmupTimeMs,
    };
  }

  /**
   * Compiles the dynamic health diagnostics parameters.
   */
  getHealth(): ModelHealth {
    const memory = process.memoryUsage();
    const rssMb = parseFloat((memory.rss / 1024 / 1024).toFixed(2));
    const avgLatency = this.requestCount > 0 ? this.totalLatencyMs / this.requestCount : 0;

    let modelPath = 'unresolved';
    try {
      modelPath = resolveModelDir();
    } catch {
      // Missing model dir is already reflected in status/error after a load attempt
    }

    return {
      status: this.status,
      modelPath,
      warmedUp: this.warmedUp,
      memoryUsageRssMb: rssMb,
      avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
      error: this.lastError,
      activeVersion: modelRegistry.getActiveVersion()?.version || 'unknown'
    };
  }
}

export const modelLoader = new ModelLoader();
export default modelLoader;
