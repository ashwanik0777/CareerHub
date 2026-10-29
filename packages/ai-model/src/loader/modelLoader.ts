import { env, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';
import { resolveModelDir } from '../config';
import { ModelHealth } from '../types';
import { startTimer } from '../utils/timer';
import { modelRegistry } from './registry';

// Restrict to local models only
env.allowRemoteModels = false;

interface LoadedModel {
  tokenizer: any;
  model: any;
}

export class ModelLoader {
  private loadPromise: Promise<LoadedModel> | null = null;
  private loadedModel: LoadedModel | null = null;
  private status: 'healthy' | 'unhealthy' | 'uninitialized' | 'error' = 'uninitialized';
  private lastError: string | undefined = undefined;
  private warmedUp = false;
  private totalLoadTimeMs = 0;
  private totalWarmupTimeMs = 0;
  private requestCount = 0;
  private totalLatencyMs = 0;

  /**
   * Lazily loads the tokenizer and ONNX sequence classification model.
   * Utilises promise deduplication to prevent concurrent double-loading.
   */
  async load(): Promise<LoadedModel> {
    // Check for hot reload
    if (modelRegistry.checkForUpdates()) {
      console.log('[ModelLoader] Hot reload triggered, evicting old model...');
      // Release the old ONNX session's native memory before dropping the reference
      try {
        await this.loadedModel?.model?.dispose?.();
      } catch (disposeError) {
        console.warn('[ModelLoader] Failed to dispose previous model session:', disposeError);
      }
      this.loadedModel = null;
      this.loadPromise = null;
      this.warmedUp = false;
      // Mark the new on-disk version as active so the reload happens exactly once
      modelRegistry.acknowledgeUpdate();
    }

    if (this.loadedModel) {
      return this.loadedModel;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    const timer = startTimer();

    this.loadPromise = (async () => {
      try {
        const modelDir = resolveModelDir();
        console.log(`[ModelLoader] Initialising load from directory: ${modelDir}`);
        
        // Pass the absolute folder path as the model ID.
        // It bypasses remote repository searches because it is an absolute path.
        const [tokenizer, model] = await Promise.all([
          AutoTokenizer.from_pretrained(modelDir),
          AutoModelForSequenceClassification.from_pretrained(modelDir, {
            dtype: 'q8',
          }),
        ]);

        this.loadedModel = { tokenizer, model };
        this.totalLoadTimeMs = timer();
        this.status = 'healthy';
        
        console.log(`[ModelLoader] Model successfully loaded in ${this.totalLoadTimeMs}ms.`);

        // Warm up ONNX Runtime execution session (prevents slow first inference)
        await this.warmup();

        return this.loadedModel;
      } catch (error: any) {
        console.error('[ModelLoader] Critical model load error:', error);
        this.status = 'error';
        this.lastError = error.message || String(error);
        // Clean out failed promise to allow subsequent retries
        this.loadPromise = null;
        throw error;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Executes a mock prediction to warm up the internal execution context.
   */
  private async warmup(): Promise<void> {
    if (!this.loadedModel) return;
    
    console.log('[ModelLoader] Initiating model session warmup...');
    const timer = startTimer();

    try {
      const { tokenizer, model } = this.loadedModel;
      const inputs = await tokenizer('warmup', {
        padding: true,
        truncation: true,
        max_length: 128,
      });

      // Run forward pass
      await model(inputs);

      this.warmedUp = true;
      this.totalWarmupTimeMs = timer();
      console.log(`[ModelLoader] Session warmed up successfully in ${this.totalWarmupTimeMs}ms.`);
    } catch (error) {
      console.error('[ModelLoader] Warmup run failed:', error);
    }
  }

  /**
   * Internal telemetric monitoring helper.
   */
  recordLatency(ms: number): void {
    this.requestCount++;
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
