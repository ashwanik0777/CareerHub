/**
 * Prediction History Storage
 * Tracks local histories of what was predicted vs. accepted.
 */

// Inline context guard to avoid shared module extraction by Vite
function _isCtxValid(): boolean {
  try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch { return false; }
}

export interface PredictionRecord {
  id: string;
  url: string;
  timestamp: number;
  fieldId: string;
  predictedLabel: string;
  confidence: number;
  finalValue: string;
  action: 'ACCEPTED' | 'REJECTED' | 'EDITED' | 'SKIPPED';
}

export class PredictionHistory {
  private static KEY = 'careerhub_prediction_history';

  static async getHistory(): Promise<PredictionRecord[]> {
    if (!_isCtxValid()) return [];
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([this.KEY], (result) => {
          resolve(result[this.KEY] || []);
        });
      } catch { resolve([]); }
    });
  }

  static async addRecord(record: PredictionRecord): Promise<void> {
    if (!_isCtxValid()) return;
    const history = await this.getHistory();
    history.push(record);
    if (history.length > 1000) history.shift();
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ [this.KEY]: history }, resolve);
      } catch { resolve(); }
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
