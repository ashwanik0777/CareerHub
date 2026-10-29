/**
 * Dataset Queues
 * Manages the routing of samples into training, hard examples, and review queues.
 */

// Inline context guard to avoid shared module extraction by Vite
function _isCtxValid(): boolean {
  try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
}
function _safeSend(msg: any): void {
  if (!_isCtxValid()) return;
  try {
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) { /* swallow */ }
    });
  } catch { /* swallow */ }
}

export interface DatasetSample {
  id: string;
  timestamp: number;
  portal: string;
  metadata: {
    tagName: string;
    inputType: string;
    visibleLabel: string;
    placeholder: string;
    fieldName: string;
    nearbyText: string;
    sectionHeading: string;
    ariaLabel: string;
    xpath: string;
    cssSelector: string;
  };
  aiPrediction: {
    label: string;
    confidence: number;
  };
  userAction: {
    action: 'ACCEPTED' | 'REJECTED' | 'EDITED' | 'SKIPPED';
    correctedLabel?: string;
    correctedValueMasked?: string;
  };
  qualityScore: 'GOLD' | 'SILVER' | 'BRONZE' | 'NOISE';
}

export class DatasetQueues {
  static async pushToTrainingQueue(sample: DatasetSample) {
    if (sample.qualityScore === 'NOISE') return;
    _safeSend({
      action: 'QUEUE_DATASET_SAMPLE',
      queueType: sample.qualityScore === 'GOLD' ? 'APPROVED' : 'REVIEW',
      sample
    });
  }

  static async pushToHardSamples(sample: DatasetSample) {
    _safeSend({
      action: 'QUEUE_DATASET_SAMPLE',
      queueType: 'HARD',
      sample
    });
  }
}
