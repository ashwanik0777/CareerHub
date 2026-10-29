/**
 * Chrome Storage Wrapper
 * Handles getting and setting Profile Cache, Settings, and Analytics data.
 */

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  apiEndpoint: string;
}

export interface ProfileCache {
  profileData: any;
  resumeData?: any;
  lastUpdated: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  apiEndpoint: 'http://localhost:3000/api/ai', // Default local development endpoint
};

export class StorageService {
  /**
   * Get application settings from sync storage
   */
  static async getSettings(): Promise<AppSettings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['theme', 'apiEndpoint'], (result) => {
        resolve({
          theme: result.theme || DEFAULT_SETTINGS.theme,
          apiEndpoint: result.apiEndpoint || DEFAULT_SETTINGS.apiEndpoint,
        });
      });
    });
  }

  /**
   * Get cached profile data from local storage
   */
  static async getProfileCache(): Promise<ProfileCache | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['profileCache'], (result) => {
        resolve(result.profileCache || null);
      });
    });
  }

  /**
   * Save profile data to local storage
   */
  static async setProfileCache(profileData: any, resumeData?: any): Promise<void> {
    return new Promise((resolve) => {
      const cache: ProfileCache = {
        profileData,
        resumeData,
        lastUpdated: Date.now(),
      };
      chrome.storage.local.set({ profileCache: cache }, () => {
        resolve();
      });
    });
  }
}
