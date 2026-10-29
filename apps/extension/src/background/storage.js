/**
 * Chrome Storage Wrapper
 * Handles getting and setting Profile Cache, Settings, and Analytics data.
 */
const DEFAULT_SETTINGS = {
    theme: 'system',
    apiEndpoint: 'http://localhost:3000/api/ai', // Default local development endpoint
};
export class StorageService {
    /**
     * Get application settings from sync storage
     */
    static async getSettings() {
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
    static async getProfileCache() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['profileCache'], (result) => {
                resolve(result.profileCache || null);
            });
        });
    }
    /**
     * Save profile data to local storage
     */
    static async setProfileCache(profileData, resumeData) {
        return new Promise((resolve) => {
            const cache = {
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
//# sourceMappingURL=storage.js.map