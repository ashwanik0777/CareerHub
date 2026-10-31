/**
 * Chrome Storage Wrapper
 * Handles getting and setting Profile Cache, Settings, and Analytics data.
 */

import { getBackendUrl } from '../utils/backend-config';

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  /** Backend origin, e.g. "https://app.example.com" (validated, no path). */
  backendUrl: string;
}

export interface ProfileCache {
  profileData: any;
  resumeData?: any;
  lastUpdated: number;
}

export class StorageService {
  /**
   * Get application settings (theme from sync storage, backend from the
   * validated backend-config module).
   */
  static async getSettings(): Promise<AppSettings> {
    const backendUrl = await getBackendUrl();
    return new Promise((resolve) => {
      chrome.storage.sync.get(['theme'], (result) => {
        const theme = result.theme === 'light' || result.theme === 'dark' ? result.theme : 'system';
        resolve({ theme, backendUrl });
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

  /**
   * Drop every piece of cached account data (profile, resumes, fallback token).
   */
  static async clearSessionData(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['profileCache', 'session_token'], () => resolve());
    });
  }
}
