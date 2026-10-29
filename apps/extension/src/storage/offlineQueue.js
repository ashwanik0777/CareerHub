/**
 * Offline Queue
 * Queues feedback events when offline and syncs them once online.
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
export class OfflineQueue {
    static KEY = 'careerhub_offline_queue';
    static async getQueue() {
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
    static async enqueue(event) {
        if (!_isCtxValid())
            return;
        const queue = await this.getQueue();
        queue.push({ ...event, id: crypto.randomUUID(), timestamp: Date.now() });
        return new Promise((resolve) => {
            try {
                chrome.storage.local.set({ [this.KEY]: queue }, resolve);
            }
            catch {
                resolve();
            }
        });
    }
    static async dequeueBatch(limit = 50) {
        if (!_isCtxValid())
            return [];
        const queue = await this.getQueue();
        const batch = queue.splice(0, limit);
        return new Promise((resolve) => {
            try {
                chrome.storage.local.set({ [this.KEY]: queue }, () => resolve(batch));
            }
            catch {
                resolve(batch);
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
//# sourceMappingURL=offlineQueue.js.map