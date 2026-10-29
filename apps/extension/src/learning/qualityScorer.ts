/**
 * Quality Scorer
 * Classifies the interaction into Gold, Silver, Bronze, or Noise.
 */

import { DatasetSample } from '../dataset/datasetQueues';

export class QualityScorer {
  static score(
    action: DatasetSample['userAction']['action'], 
    confidence: number, 
    edited: boolean
  ): DatasetSample['qualityScore'] {
    if (action === 'ACCEPTED' && !edited && confidence >= 0.98) {
      // Auto-filled and accepted
      return 'GOLD';
    }
    
    if (action === 'ACCEPTED' && !edited && confidence >= 0.92) {
      // Approved via popup without edits
      return 'SILVER';
    }

    if (action === 'EDITED' || (action === 'ACCEPTED' && edited)) {
      // User manually edited the value or corrected the AI
      return 'BRONZE';
    }

    if (action === 'REJECTED' || action === 'SKIPPED') {
      // Might be a bad prediction, goes to hard samples
      return 'BRONZE';
    }

    return 'NOISE';
  }
}
