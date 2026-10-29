/**
 * Analytics Service
 * Tracks usage metrics in local storage.
 */
export class AnalyticsService {
    static KEY = 'analyticsData';
    static getDefaultData() {
        return {
            formsFilled: 0,
            fieldsFilled: 0,
            totalLatencyMs: 0,
            totalConfidence: 0,
            acceptedFields: 0,
            correctedFields: 0,
        };
    }
    static async getAnalytics() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.KEY], (result) => {
                resolve(result[this.KEY] || this.getDefaultData());
            });
        });
    }
    static async recordFormFill(fieldsFilledCount, averageConfidence, latencyMs) {
        const data = await this.getAnalytics();
        data.formsFilled += 1;
        data.fieldsFilled += fieldsFilledCount;
        data.totalLatencyMs += latencyMs;
        // We accumulate confidence to calculate global average later: (totalConfidence / fieldsFilled)
        data.totalConfidence += (averageConfidence * fieldsFilledCount);
        // Optimistically assume all filled fields are accepted until corrected
        data.acceptedFields += fieldsFilledCount;
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.KEY]: data }, resolve);
        });
    }
    static async recordCorrection() {
        const data = await this.getAnalytics();
        if (data.acceptedFields > 0) {
            data.acceptedFields -= 1;
            data.correctedFields += 1;
        }
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.KEY]: data }, resolve);
        });
    }
}
//# sourceMappingURL=analytics.js.map