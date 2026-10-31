import { AiFieldDescriptor } from '@platform/validation';
import { modelLoader } from '../loader/modelLoader';
import { buildTextInput } from '../preprocessing/textBuilder';
import { rankPredictions } from './ranking';
import { softmax } from './predict';
import { startTimer } from '../utils/timer';
import { PredictResult, ModelPrediction } from '../types';
import { MODEL_CLASSES } from '../labels';
import { predictionCache } from '../cache/predictionCache';

/**
 * Predicts classifications for a batch of form fields (1 to 50 fields).
 * Cached inputs are served from the prediction cache; only cache misses go
 * through a single padded forward pass.
 */
export async function predictFieldBatch(fields: AiFieldDescriptor[]): Promise<PredictResult[]> {
  if (fields.length === 0) {
    return [];
  }

  // 1. Build input texts and resolve cache hits per field
  const inputTexts = fields.map((f) => buildTextInput(f));
  const results: (PredictResult | null)[] = inputTexts.map((text) => {
    const hit = predictionCache.get(text);
    return hit ? { ...hit, cached: true } : null;
  });

  const missIndexes: number[] = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i] === null) missIndexes.push(i);
  }

  if (missIndexes.length === 0) {
    return results as PredictResult[];
  }

  const timer = startTimer();

  // 2. Ensure model is loaded
  const { tokenizer, model } = await modelLoader.load();

  // 3. Batched tokenization over cache misses only
  const missTexts = missIndexes.map((i) => inputTexts[i]!);
  const inputs = await tokenizer(missTexts, {
    padding: true,
    truncation: true,
    max_length: 128,
  });

  // 4. Batched inference forward pass
  const outputs = await model(inputs);

  // 5. Slice and process output logits
  const numClasses = MODEL_CLASSES.length;
  const flatLogits = outputs.logits.data as Float32Array;
  const elapsed = timer();
  const perFieldTime = parseFloat((elapsed / missIndexes.length).toFixed(2));

  // Record latency telemetry per field so avgLatencyMs stays per-prediction
  modelLoader.recordLatency(elapsed, missIndexes.length);

  for (let m = 0; m < missIndexes.length; m++) {
    const offset = m * numClasses;
    const singleLogits = Array.from(flatLogits.slice(offset, offset + numClasses));
    const probabilities = softmax(singleLogits);

    const rawPredictions: ModelPrediction[] = MODEL_CLASSES.map((label, idx) => ({
      classLabel: label,
      probability: probabilities[idx] ?? 0.0,
    }));

    const ranked = rankPredictions(rawPredictions);
    const result: PredictResult = {
      predictions: ranked,
      executionTimeMs: perFieldTime,
      cached: false,
    };

    const fieldIndex = missIndexes[m]!;
    results[fieldIndex] = result;
    predictionCache.set(inputTexts[fieldIndex]!, result);
  }

  return results as PredictResult[];
}
export default predictFieldBatch;
