/**
 * Safe Chrome Runtime Utilities (Content Script Side)
 *
 * Guards all chrome.runtime calls against "Extension context invalidated" errors.
 * This happens when the extension is reloaded/updated but old content scripts
 * are still running on previously loaded pages.
 *
 * NOTE: This file lives under content/ so it gets bundled into content.js only,
 * preventing Vite from extracting a shared chunk that content scripts can't import.
 */
/**
 * Check if the chrome runtime context is still valid.
 */
export declare function isContextValid(): boolean;
/**
 * Safely send a message to the background service worker.
 * Returns null if the extension context is invalid instead of throwing.
 */
export declare function safeSendMessage<T = any>(message: any, callback?: (response: T) => void): void;
/**
 * Safely add a message listener. Returns a cleanup function.
 */
export declare function safeAddMessageListener(handler: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => boolean | void): () => void;
//# sourceMappingURL=safe-chrome.d.ts.map