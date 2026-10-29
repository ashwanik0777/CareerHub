import { ConfidenceLevel } from '@platform/types';
import { HIGH_CONFIDENCE_THRESHOLD, MEDIUM_CONFIDENCE_THRESHOLD } from '../config';
import { MISCELLANEOUS_CLASS } from '../labels';

/**
 * Resolves the ConfidenceLevel based on the probability score.
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= HIGH_CONFIDENCE_THRESHOLD) {
    return ConfidenceLevel.HIGH;
  }
  if (score >= MEDIUM_CONFIDENCE_THRESHOLD) {
    return ConfidenceLevel.MEDIUM;
  }
  return ConfidenceLevel.LOW;
}

/**
 * Determines whether a prediction requires manual human review.
 * Aggressive gating to account for low macro-F1 (0.423) of the model:
 * - Low confidence predictions (< 0.60) require review.
 * - Miscellaneous class predictions require review (or are ignored/abstained).
 * - Small margin between top-1 and top-2 predictions (< 0.15 margin) requires review.
 */
export function isReviewRequired(
  top1Score: number,
  top2Score: number,
  top1Class: string
): boolean {
  if (top1Class === MISCELLANEOUS_CLASS) {
    return true;
  }

  if (top1Score < MEDIUM_CONFIDENCE_THRESHOLD) {
    return true;
  }

  // Margin check: if top-2 is very close to top-1, there is ambiguity.
  const margin = top1Score - top2Score;
  if (margin < 0.15) {
    return true;
  }

  return false;
}
