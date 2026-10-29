// ────────────────────────────────────────────────────────────────────────────
// Benchmarking Metrics — Standard IR Evaluation Functions
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute accuracy: the fraction of predictions that exactly match the expected label.
 * accuracy = correct / total
 *
 * @param correct - Number of correct predictions
 * @param total - Total number of predictions
 * @returns Accuracy in [0, 1]
 */
export function accuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return correct / total;
}

/**
 * Compute precision: the fraction of positive predictions that are correct.
 * precision = truePositives / (truePositives + falsePositives)
 *
 * @param truePositives - Correctly predicted positive cases
 * @param falsePositives - Incorrectly predicted positive cases
 * @returns Precision in [0, 1]
 */
export function precision(truePositives: number, falsePositives: number): number {
  const denominator = truePositives + falsePositives;
  if (denominator === 0) return 0;
  return truePositives / denominator;
}

/**
 * Compute recall: the fraction of actual positives that were correctly predicted.
 * recall = truePositives / (truePositives + falseNegatives)
 *
 * @param truePositives - Correctly predicted positive cases
 * @param falseNegatives - Missed positive cases
 * @returns Recall in [0, 1]
 */
export function recall(truePositives: number, falseNegatives: number): number {
  const denominator = truePositives + falseNegatives;
  if (denominator === 0) return 0;
  return truePositives / denominator;
}

/**
 * Compute F1 Score: the harmonic mean of precision and recall.
 * f1 = 2 × (precision × recall) / (precision + recall)
 *
 * @param precisionValue - Precision score
 * @param recallValue - Recall score
 * @returns F1 score in [0, 1]
 */
export function f1Score(precisionValue: number, recallValue: number): number {
  const sum = precisionValue + recallValue;
  if (sum === 0) return 0;
  return (2 * precisionValue * recallValue) / sum;
}
