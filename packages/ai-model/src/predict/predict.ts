import { AiFieldDescriptor } from '@platform/validation';
import { modelLoader } from '../loader/modelLoader';
import { buildTextInput } from '../preprocessing/textBuilder';
import { rankPredictions } from './ranking';
import { startTimer } from '../utils/timer';
import { PredictResult, ModelPrediction } from '../types';
import { MODEL_CLASSES } from '../labels';
import { predictionCache } from '../cache/predictionCache';

/**
 * Standard softmax function with max subtraction to prevent numerical overflow.
 */
export function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((val) => Math.exp(val - maxLogit));
  const sumExps = exps.reduce((sum, val) => sum + val, 0);
  return exps.map((val) => (sumExps > 0 ? val / sumExps : 0));
}

/**
 * Runs a single forward pass over an already-built input text.
 */
async function runInference(inputText: string): Promise<PredictResult> {
  const timer = startTimer();

  // 1. Ensure model is loaded
  const { tokenizer, model } = await modelLoader.load();

  // 2. Tokenize with strict sequence constraints
  const inputs = await tokenizer(inputText, {
    padding: true,
    truncation: true,
    max_length: 128,
  });

  // 3. Run model inference forward pass
  const outputs = await model(inputs);

  // 4. Extract raw logits and compute probabilities
  const rawLogits = Array.from(outputs.logits.data as Float32Array);
  const probabilities = softmax(rawLogits);

  // 5. Map probabilities to output classes
  const rawPredictions: ModelPrediction[] = MODEL_CLASSES.map((label, idx) => ({
    classLabel: label,
    probability: probabilities[idx] ?? 0.0,
  }));

  // 6. Collapse duplicates, filter abstained predictions, and rank top 5
  const ranked = rankPredictions(rawPredictions);
  const elapsed = timer();

  // Record latency telemetry
  modelLoader.recordLatency(elapsed);

  return {
    predictions: ranked,
    executionTimeMs: elapsed,
    cached: false,
  };
}

/**
 * Classifies a single form field using the fine-tuned local MiniLM model.
 * Results are cached (TTL + LRU) keyed on the built input text, and concurrent
 * requests for the same input are deduplicated onto one in-flight forward pass.
 */
export async function predictField(field: AiFieldDescriptor): Promise<PredictResult> {
  const inputText = buildTextInput(field);
  return predictionCache.getOrExecute(
    inputText,
    () => runInference(inputText),
    (hit) => ({ ...hit, cached: true })
  );
}
export default predictField;
