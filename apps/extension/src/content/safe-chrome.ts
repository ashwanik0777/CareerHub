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
export function isContextValid(): boolean {
  try {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

/**
 * Safely send a message to the background service worker.
 * Returns null if the extension context is invalid instead of throwing.
 */
export function safeSendMessage<T = any>(
  message: any,
  callback?: (response: T) => void
): void {
  if (!isContextValid()) {
    console.warn('[CareerHub] Extension context invalidated. Please refresh the page.');
    if (callback) callback(null as any);
    return;
  }

  try {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[CareerHub] sendMessage error:', chrome.runtime.lastError.message);
        if (callback) callback(null as any);
        return;
      }
      if (callback) callback(response);
    });
  } catch (e) {
    console.warn('[CareerHub] Extension context invalidated during sendMessage:', e);
    if (callback) callback(null as any);
  }
}

/**
 * Safely add a message listener. Returns a cleanup function.
 */
export function safeAddMessageListener(
  handler: (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => boolean | void
): () => void {
  if (!isContextValid()) {
    console.warn('[CareerHub] Cannot add listener — context invalidated.');
    return () => {};
  }

  try {
    chrome.runtime.onMessage.addListener(handler);
    return () => {
      try {
        chrome.runtime.onMessage.removeListener(handler);
      } catch {
        // Context already invalidated, nothing to clean up
      }
    };
  } catch (e) {
    console.warn('[CareerHub] Failed to add message listener:', e);
    return () => {};
  }
}
