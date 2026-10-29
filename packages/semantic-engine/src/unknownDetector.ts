export class UnknownDetector {
  private static CONFIDENCE_THRESHOLD = 0.65;
  private static ENTROPY_THRESHOLD = 0.8; // High entropy means model is confused

  /**
   * Detects if a prediction should be considered UNKNOWN.
   */
  static isUnknown(
    predictions: Array<{ label: string; confidence: number }>
  ): boolean {
    if (!predictions || predictions.length === 0) return true;

    const topConfidence = predictions[0].confidence;
    
    // 1. Direct Confidence Thresholding
    if (topConfidence < this.CONFIDENCE_THRESHOLD) {
      return true;
    }

    // 2. Entropy / Flat Distribution Check
    // If the difference between Top 1 and Top 2 is very small, the model is guessing.
    if (predictions.length > 1) {
      const margin = topConfidence - predictions[1].confidence;
      if (margin < 0.1 && topConfidence < 0.85) {
        return true;
      }
    }

    return false;
  }
}
