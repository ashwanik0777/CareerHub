/**
 * Accuracy Tracker & Portal Analytics
 * Analyzes the ratio of Gold/Silver samples to Bronze/Noise samples to calculate accuracy.
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
export class AccuracyTracker {
    static KEY = 'careerhub_accuracy_stats';
    static async recordSample(sample) {
        if (!_isCtxValid())
            return;
        const stats = await this.getStats();
        stats.total++;
        if (sample.qualityScore === 'GOLD' || sample.qualityScore === 'SILVER') {
            stats.correct++;
        }
        if (!stats.portals)
            stats.portals = {};
        if (!stats.portals[sample.portal]) {
            stats.portals[sample.portal] = { total: 0, correct: 0 };
        }
        stats.portals[sample.portal].total++;
        if (sample.qualityScore === 'GOLD' || sample.qualityScore === 'SILVER') {
            stats.portals[sample.portal].correct++;
        }
        return new Promise((resolve) => {
            try {
                chrome.storage.local.set({ [this.KEY]: stats }, resolve);
            }
            catch {
                resolve();
            }
        });
    }
    static async getStats() {
        if (!_isCtxValid())
            return { total: 0, correct: 0, portals: {} };
        return new Promise((resolve) => {
            try {
                chrome.storage.local.get([this.KEY], (result) => {
                    resolve(result[this.KEY] || { total: 0, correct: 0, portals: {} });
                });
            }
            catch {
                resolve({ total: 0, correct: 0, portals: {} });
            }
        });
    }
}
//# sourceMappingURL=accuracyTracker.js.map