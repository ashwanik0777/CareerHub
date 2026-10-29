/**
 * Offline Queue
 * Queues feedback events when offline and syncs them once online.
 */

// Inline context guard to avoid shared module extraction by Vite
function _isCtxValid(): boolean {
  try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
}

export interface OfflineEvent {
  id: string;
  type: 'DATASET_SAMPLE' | 'ANALYTICS_EVENT';
  payload: any;
  timestamp: number;
}

export class OfflineQueue {
  private static KEY = 'careerhub_offline_queue';

  static async getQueue(): Promise<OfflineEvent[]> {
    if (!_isCtxValid()) return [];
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([this.KEY], (result) => {
          resolve(result[this.KEY] || []);
        });
      } catch { resolve([]); }
    });
  }

  static async enqueue(event: Omit<OfflineEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!_isCtxValid()) return;
    const queue = await this.getQueue();
    queue.push({ ...event, id: crypto.randomUUID(), timestamp: Date.now() });
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [this.KEY]: queue }, resolve);
      } catch { resolve(); }
    });
  }

  static async dequeueBatch(limit: number = 50): Promise<OfflineEvent[]> {
    if (!_isCtxValid()) return [];
    const queue = await this.getQueue();
    const batch = queue.splice(0, limit);
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [this.KEY]: queue }, () => resolve(batch));
      } catch { resolve(batch); }
    });
  }

  static async clear(): Promise<void> {
    if (!_isCtxValid()) return;
    return new Promise((resolve) => {
      try {
        chrome.storage.local.remove(this.KEY, resolve);
      } catch { resolve(); }
    });
  }
}
