/**
 * Confidence Manager
 * Evaluates AI confidence and determines the required user interaction model.
 */

export enum InteractionMode {
  AUTO_FILL = 'AUTO_FILL',     // >= 98%
  APPROVAL = 'APPROVAL',       // 92% - 97.9%
  MANUAL = 'MANUAL'            // < 92%
}

export class ConfidenceManager {
  static evaluate(confidence: number): InteractionMode {
    if (confidence >= 0.98) return InteractionMode.AUTO_FILL;
    if (confidence >= 0.92) return InteractionMode.APPROVAL;
    return InteractionMode.MANUAL;
  }
}
