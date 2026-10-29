/**
 * Dataset Queues
 * Manages the routing of samples into training, hard examples, and review queues.
 */
// Inline context guard to avoid shared module extraction by Vite
function _isCtxValid() {
    try {
        return !!(chrome && chrome.runtime && chrome.runtime.id);
    }
    catch {
        return false;
    }
}
function _safeSend(msg) {
    if (!_isCtxValid())
        return;
    try {
        chrome.runtime.sendMessage(msg, () => {
            if (chrome.runtime.lastError) { /* swallow */ }
        });
    }
    catch { /* swallow */ }
}
export class DatasetQueues {
    static async pushToTrainingQueue(sample) {
        if (sample.qualityScore === 'NOISE')
            return;
        _safeSend({
            action: 'QUEUE_DATASET_SAMPLE',
            queueType: sample.qualityScore === 'GOLD' ? 'APPROVED' : 'REVIEW',
            sample
        });
    }
    static async pushToHardSamples(sample) {
        _safeSend({
            action: 'QUEUE_DATASET_SAMPLE',
            queueType: 'HARD',
            sample
        });
    }
}
//# sourceMappingURL=datasetQueues.js.map