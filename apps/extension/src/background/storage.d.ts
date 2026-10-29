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
export declare class StorageService {
    /**
     * Get application settings from sync storage
     */
    static getSettings(): Promise<AppSettings>;
    /**
     * Get cached profile data from local storage
     */
    static getProfileCache(): Promise<ProfileCache | null>;
    /**
     * Save profile data to local storage
     */
    static setProfileCache(profileData: any, resumeData?: any): Promise<void>;
}
//# sourceMappingURL=storage.d.ts.map