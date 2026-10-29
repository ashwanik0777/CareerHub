/**
 * Prediction History Storage
 * Tracks local histories of what was predicted vs. accepted.
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
export class PredictionHistory {
    static KEY = 'careerhub_prediction_history';
    static async getHistory() {
        if (!_isCtxValid())
            return [];
        return new Promise((resolve) => {
            try {
                chrome.storage.local.get([this.KEY], (result) => {
                    resolve(result[this.KEY] || []);
                });
            }
            catch {
                resolve([]);
            }
        });
    }
    static async addRecord(record) {
        if (!_isCtxValid())
            return;
        const history = await this.getHistory();
        history.push(record);
        if (history.length > 1000)
            history.shift();
        return new Promise((resolve) => {
            try {
                chrome.storage.local.set({ [this.KEY]: history }, resolve);
            }
            catch {
                resolve();
            }
        });
    }
    static async clear() {
        if (!_isCtxValid())
            return;
        return new Promise((resolve) => {
            try {
                chrome.storage.local.remove(this.KEY, resolve);
            }
            catch {
                resolve();
            }
        });
    }
}
//# sourceMappingURL=predictionHistory.js.map