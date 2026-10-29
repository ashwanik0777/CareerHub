import { StorageService } from './storage';
import { ApiService, PredictRequestField } from './api';
import { AnalyticsService } from './analytics';
import { getBackendUrl } from '../utils/website-rules';
import { OfflineQueue } from '../storage/offlineQueue';
import { AccuracyTracker } from '../analytics/accuracyTracker';

// ────────────────────────────────────────────────────────────────────────────
// Background Service Worker
// ────────────────────────────────────────────────────────────────────────────

let resolvedBackendUrl: string = 'http://localhost:3000';

(async () => {
  resolvedBackendUrl = await getBackendUrl();
})();

async function getSessionToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.cookies) {
      resolve(null);
      return;
    }

    chrome.cookies.get({
      url: resolvedBackendUrl,
      name: 'session_token',
    }, (cookie) => {
      if (cookie && cookie.value) resolve(cookie.value);
      else {
        chrome.storage.local.get(['session_token'], (result) => {
          resolve(result.session_token || null);
        });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'GET_STATUS') {
    handleGetStatus().then(sendResponse);
    return true;
  }

  if (message.action === 'TRIGGER_AUTOFILL') {
    handleTriggerAutofill(message.resumeId).then(sendResponse);
    return true;
  }

  if (message.action === 'PREDICT_FIELDS') {
    handlePredictFields(message.fields).then(sendResponse);
    return true;
  }

  if (message.action === 'RECORD_ANALYTICS') {
    handleRecordAnalytics(message.report).then(sendResponse);
    return true;
  }

  if (message.action === 'SUBMIT_FEEDBACK') {
    ApiService.submitFeedback(message.feedback).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.action === 'LOG_PREDICTION') {
    // Basic fallback log handling if content script sends it directly
    return false;
  }

  if (message.action === 'QUEUE_DATASET_SAMPLE') {
    handleDatasetSample(message.sample, message.queueType);
    return false;
  }

  if (message.action === 'SET_AUTO_FILL') {
    // Toggle stored by popup, background just acknowledges
    sendResponse({ success: true });
    return false;
  }

  return false;
});

async function handleGetStatus() {
  try {
    const token = await getSessionToken();
    if (!token) return { authenticated: false, error: 'No active session found' };

    const cache = await StorageService.getProfileCache();
    const CACHE_TTL_MS = 5 * 60 * 1000;
    
    if (cache && (Date.now() - cache.lastUpdated < CACHE_TTL_MS)) {
      return { authenticated: true, profile: cache.profileData, resumes: cache.resumeData };
    }

    // Fetch fresh
    const [profileRes, resumesRes] = await Promise.all([
      fetch(`${resolvedBackendUrl}/api/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${resolvedBackendUrl}/api/resumes`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (!profileRes.ok) throw new Error('Failed to fetch profile');

    const profileData = await profileRes.json();
    const resumesData = await resumesRes.json();

    await StorageService.setProfileCache(profileData.profile, resumesData.resumes || []);

    return {
      authenticated: true,
      profile: profileData.profile,
      resumes: resumesData.resumes || [],
    };
  } catch (error: any) {
    return { authenticated: false, error: error.message || 'Connection error' };
  }
}

async function handlePredictFields(fields: PredictRequestField[]) {
  try {
    const response = await ApiService.predictBatch(fields);
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Ensure the content script is injected in the given tab.
 * If it's already running, the re-injection is harmless (the listener is
 * guarded by the `chrome.runtime.onMessage` pattern).
 */
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    // Ping the content script first to see if it's alive
    const alive = await new Promise<boolean>((resolve) => {
      chrome.tabs.sendMessage(tabId, { action: 'PING' }, () => {
        if (chrome.runtime.lastError) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (!alive) {
      // Content script is not loaded — inject it programmatically
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        files: ['content.js'],
      });
      // Give the script a moment to initialise its listener
      await new Promise((r) => setTimeout(r, 200));
    }
  } catch (e) {
    console.warn('[Background] Failed to inject content script:', e);
  }
}

async function handleTriggerAutofill(resumeId?: string) {
  try {
    const status = await handleGetStatus();
    if (!status.authenticated) return { success: false, error: 'Authentication failed' };

    const resumes = status.resumes || [];
    const selectedResume = resumeId 
      ? resumes.find((r: any) => r.id === resumeId) 
      : resumes.find((r: any) => r.isDefault);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false, error: 'No active tab found' };

    // Ensure content script is alive before messaging
    await ensureContentScript(tab.id);

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id!, {
        action: 'EXECUTE_AUTOFILL',
        profile: status.profile,
        resume: selectedResume,
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Background] sendMessage error:', chrome.runtime.lastError.message);
          resolve({ success: false, error: 'Content script is not reachable. Please refresh the page and try again.' });
          return;
        }
        resolve(response || { success: false, error: 'Content script did not respond' });
      });
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function handleRecordAnalytics(report: any) {
  try {
    await AnalyticsService.recordFormFill(
      report.filledFieldsCount,
      report.confidenceBreakdown?.avgConfidence || 0,
      report.executionTimeMs
    );
    return { success: true };
  } catch (error) {
    console.error('Failed to record analytics:', error);
    return { success: false };
  }
}

async function handleDatasetSample(sample: any, queueType: string) {
  try {
    await AccuracyTracker.recordSample(sample);

    if (navigator.onLine) {
      // In production, this would send to an API endpoint
      // await fetch(`${resolvedBackendUrl}/api/dataset`, { method: 'POST', body: JSON.stringify({ sample, queueType }) });
      console.log(`[DatasetBuilder] Logged ${queueType} sample from ${sample.portal}`);
    } else {
      await OfflineQueue.enqueue({
        type: 'DATASET_SAMPLE',
        payload: { sample, queueType }
      });
    }
  } catch (error) {
    console.error('Failed to queue dataset sample', error);
  }
}

// Background sync for offline queue
setInterval(async () => {
  if (navigator.onLine) {
    const batch = await OfflineQueue.dequeueBatch(50);
    if (batch.length > 0) {
      console.log(`[OfflineSync] Syncing ${batch.length} items`);
      // Simulating API sync...
    }
  }
}, 60000);

// Watch for cookie changes to invalidate cache
if (typeof chrome !== 'undefined' && chrome.cookies) {
  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === 'session_token' && changeInfo.cookie.domain.includes('localhost')) {
      chrome.storage.local.remove('profileCache');
    }
  });
}

// Watch for backend URL configuration changes
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.backend_url) {
      resolvedBackendUrl = changes.backend_url.newValue || 'http://localhost:3000';
      chrome.storage.local.remove('profileCache');
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Auto-Autofill on Page Navigation
// When the user enables "Auto Autofill", automatically fill forms on every
// page load without requiring a button click.
// ────────────────────────────────────────────────────────────────────────────

// Track tabs we've already auto-filled to avoid double-filling on hash changes
const autoFilledTabs = new Set<number>();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger on full page load completion
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  // Check if auto-fill is enabled
  const result = await chrome.storage.local.get(['autoFillEnabled']);
  if (!result.autoFillEnabled) return;

  // Don't re-fill if we already auto-filled this exact tab load
  if (autoFilledTabs.has(tabId)) return;
  autoFilledTabs.add(tabId);

  // Clear the flag after 3 seconds (allows re-fill on actual new navigation)
  setTimeout(() => autoFilledTabs.delete(tabId), 3000);

  try {
    const status = await handleGetStatus();
    if (!status.authenticated || !status.profile) return;

    // Ensure content script is injected
    await ensureContentScript(tabId);

    // Small delay to let dynamic forms render (React, Angular, etc.)
    await new Promise((r) => setTimeout(r, 800));

    // Send autofill command
    chrome.tabs.sendMessage(tabId, {
      action: 'EXECUTE_AUTOFILL',
      profile: status.profile,
      resume: null,
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not available, silently ignore
        return;
      }
      if (response?.success && response?.report?.filledFieldsCount > 0) {
        console.log(`[AutoFill] Auto-filled ${response.report.filledFieldsCount} fields on ${tab.url}`);
      }
    });
  } catch (e) {
    // Silently ignore auto-fill errors — this is a background convenience feature
    console.warn('[AutoFill] Auto-fill failed:', e);
  }
});

// Clear auto-fill tracking when a tab navigates to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    autoFilledTabs.delete(tabId);
  }
});
