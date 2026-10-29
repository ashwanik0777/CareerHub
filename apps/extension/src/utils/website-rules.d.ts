export interface WebsiteRule {
    name: string;
    urlPattern: RegExp;
    selectors: {
        form?: string;
        inputs?: string;
        fileUpload?: string;
    };
    fieldOverrides?: Record<string, string>;
}
export declare const SUPPORTED_WEBSITES: WebsiteRule[];
/**
 * Detect which website rule matches the given URL.
 * Returns a matching rule or a generic fallback.
 */
export declare function detectWebsite(url: string): WebsiteRule | null;
/**
 * Get the backend URL, checking chrome.storage for a configured override.
 * Falls back to localhost:3000 for development.
 */
export declare function getBackendUrl(): Promise<string>;
//# sourceMappingURL=website-rules.d.ts.map