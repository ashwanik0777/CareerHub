import { StorageService } from './storage';
import { ApiService, PredictRequestField, getSessionToken } from './api';
import { AnalyticsService } from './analytics';
import { BACKEND_URL_KEY, DEFAULT_BACKEND_URL, getBackendUrl, normalizeBackendUrl } from '../utils/backend-config';
import { isSupportedWebsite } from '../utils/website-rules';
import { OfflineQueue } from '../storage/offlineQueue';
import { AccuracyTracker } from '../analytics/accuracyTracker';

// ────────────────────────────────────────────────────────────────────────────
// Background Service Worker
// ────────────────────────────────────────────────────────────────────────────

/**
 * Backend origin. Resolved lazily from storage on first use (a service worker
 * can be woken by a message before any top-level async init has finished).
 */
let backendUrlPromise: Promise<string> | null = null;
function resolveBackendUrl(): Promise<string> {
  if (!backendUrlPromise) backendUrlPromise = getBackendUrl();
  return backendUrlPromise;
}

/**
 * Only accept messages from this extension's own pages/scripts. Privileged
 * actions (which fetch and push the full profile) are additionally limited to
 * extension pages (popup/options), never to a content script running in a tab.
 */
const PRIVILEGED_ACTIONS = new Set(['TRIGGER_AUTOFILL', 'GET_STATUS', 'LOGOUT', 'FORCE_SYNC']);

function isTrustedSender(sender: chrome.runtime.MessageSender, action: string): boolean {
  if (sender.id !== chrome.runtime.id) return false;
  if (PRIVILEGED_ACTIONS.has(action)) {
    // Extension pages have no `tab`; content scripts always do.
    return !sender.tab;
  }
  return true;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const action = typeof message?.action === 'string' ? message.action : '';
  if (!action || !isTrustedSender(sender, action)) {
    return false;
  }

  switch (action) {
    case 'GET_STATUS':
      handleGetStatus().then(sendResponse);
      return true;

    case 'FORCE_SYNC':
      StorageService.clearSessionData()
        .then(() => handleGetStatus())
        .then(sendResponse);
      return true;

    case 'LOGOUT':
      handleLogout().then(sendResponse);
      return true;

    case 'TRIGGER_AUTOFILL':
      handleTriggerAutofill(typeof message.resumeId === 'string' ? message.resumeId : undefined).then(sendResponse);
      return true;

    case 'PREDICT_FIELDS':
      handlePredictFields(Array.isArray(message.fields) ? message.fields : []).then(sendResponse);
      return true;

    case 'RECORD_ANALYTICS':
      handleRecordAnalytics(message.report).then(sendResponse);
      return true;

    case 'SUBMIT_FEEDBACK':
      ApiService.submitFeedback(message.feedback)
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;

    case 'QUEUE_DATASET_SAMPLE':
      handleDatasetSample(message.sample, message.queueType);
      return false;

    case 'SET_AUTO_FILL':
      // Toggle is stored by the popup; background just acknowledges.
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});

async function handleGetStatus() {
  try {
    const backendUrl = await resolveBackendUrl();
    const token = await getSessionToken(backendUrl);
    if (!token) return { authenticated: false, error: 'No active session found' };

    const cache = await StorageService.getProfileCache();
    const CACHE_TTL_MS = 5 * 60 * 1000;

    if (cache && Date.now() - cache.lastUpdated < CACHE_TTL_MS) {
      return { authenticated: true, profile: cache.profileData, resumes: cache.resumeData };
    }

    const headers = { Authorization: `Bearer ${token}` };
    const [profileRes, resumesRes] = await Promise.all([
      fetch(`${backendUrl}/api/profile`, { headers }),
      fetch(`${backendUrl}/api/resumes`, { headers }),
    ]);

    if (profileRes.status === 401 || resumesRes.status === 401) {
      await StorageService.clearSessionData();
      return { authenticated: false, error: 'Session expired. Please log in again.' };
    }
    if (!profileRes.ok) throw new Error(`Failed to fetch profile (${profileRes.status})`);

    const profileData = await profileRes.json();
    const resumes = resumesRes.ok ? (await resumesRes.json()).resumes || [] : [];

    await StorageService.setProfileCache(profileData.profile, resumes);

    return { authenticated: true, profile: profileData.profile, resumes };
  } catch (error: any) {
    return { authenticated: false, error: error?.message || 'Connection error' };
  }
}

/**
 * Sign out: removes the backend session cookie, the fallback token and all
 * cached profile data. The server-side session row is left to expire.
 */
async function handleLogout() {
  try {
    const backendUrl = await resolveBackendUrl();
    await StorageService.clearSessionData();
    if (chrome.cookies) {
      await new Promise<void>((resolve) => {
        chrome.cookies.remove({ url: backendUrl, name: 'session_token' }, () => {
          void chrome.runtime.lastError; // no permission / no cookie: nothing to do
          resolve();
        });
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Logout failed' };
  }
}

async function handlePredictFields(fields: PredictRequestField[]) {
  try {
    const response = await ApiService.predictBatch(fields);
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

/**
 * Ensure the content script is injected in the given tab. Succeeds on
 * declared hosts and, after the user clicks the action, on the active tab
 * (activeTab permission). Returns false when injection is not permitted.
 */
async function ensureContentScript(tabId: number): Promise<boolean> {
  const alive = await new Promise<boolean>((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'PING' }, () => {
      resolve(!chrome.runtime.lastError);
    });
  });
  if (alive) return true;

  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ['content.js'],
    });
    // Give the script a moment to initialise its listener
    await new Promise((r) => setTimeout(r, 200));
    return true;
  } catch (e) {
    console.warn('[Background] Cannot inject content script into this tab:', e);
    return false;
  }
}

function sendAutofillToTab(tabId: number, profile: unknown, resume: unknown): Promise<any> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: 'EXECUTE_AUTOFILL', profile, resume }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ success: false, error: 'Content script is not reachable. Please refresh the page and try again.' });
        return;
      }
      resolve(response || { success: false, error: 'Content script did not respond' });
    });
  });
}

async function handleTriggerAutofill(resumeId?: string) {
  try {
    const status = await handleGetStatus();
    if (!status.authenticated) return { success: false, error: status.error || 'Authentication failed' };

    const resumes = status.resumes || [];
    const selectedResume = resumeId
      ? resumes.find((r: any) => r.id === resumeId)
      : resumes.find((r: any) => r.isDefault);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return { success: false, error: 'No active tab found' };

    const injected = await ensureContentScript(tab.id);
    if (!injected) {
      return { success: false, error: 'This page cannot be auto-filled (restricted URL).' };
    }

    return await sendAutofillToTab(tab.id, status.profile, selectedResume ?? null);
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

async function handleRecordAnalytics(report: any) {
  try {
    await AnalyticsService.recordFormFill(
      Number(report?.filledFieldsCount) || 0,
      Number(report?.confidenceBreakdown?.avgConfidence) || 0,
      Number(report?.executionTimeMs) || 0
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

    if (!navigator.onLine) {
      await OfflineQueue.enqueue({
        type: 'DATASET_SAMPLE',
        payload: { sample, queueType },
      });
    }
    // Online samples are kept locally only (AccuracyTracker); server-side
    // dataset upload is intentionally not wired up pending a privacy review.
  } catch (error) {
    console.error('Failed to queue dataset sample', error);
  }
}

// Offline queue drain: items are kept until a server sync exists.
setInterval(async () => {
  if (navigator.onLine) {
    const pending = await OfflineQueue.getQueue();
    if (pending.length > 0) {
      console.log(`[OfflineSync] ${pending.length} items pending (no server sync configured)`);
    }
  }
}, 5 * 60_000);

// Invalidate the profile cache whenever the backend session cookie changes
// (login as another user, logout, expiry) — matched on the backend's host.
if (typeof chrome !== 'undefined' && chrome.cookies) {
  chrome.cookies.onChanged.addListener(async (changeInfo) => {
    if (changeInfo.cookie.name !== 'session_token') return;
    const backendHost = new URL(await resolveBackendUrl()).hostname;
    const cookieDomain = changeInfo.cookie.domain.replace(/^\./, '');
    if (backendHost === cookieDomain || backendHost.endsWith(`.${cookieDomain}`)) {
      chrome.storage.local.remove('profileCache');
    }
  });
}

// React to backend URL changes from the Options page.
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes[BACKEND_URL_KEY]) {
      const next = normalizeBackendUrl(String(changes[BACKEND_URL_KEY].newValue ?? '')) ?? DEFAULT_BACKEND_URL;
      backendUrlPromise = Promise.resolve(next);
      StorageService.clearSessionData();
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Auto-Autofill on Page Navigation
// When the user enables "Auto Autofill", forms on SUPPORTED job boards are
// filled automatically on page load. Other sites still work via the popup
// button (activeTab), but are never touched without an explicit click.
// ────────────────────────────────────────────────────────────────────────────

const autoFillInFlight = new Set<number>();
const AUTOFILL_DEDUPE_MS = 3000;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || !/^https?:/i.test(tab.url)) return;
  if (!isSupportedWebsite(tab.url)) return;

  const result = await chrome.storage.local.get(['autoFillEnabled']);
  if (!result.autoFillEnabled) return;

  if (autoFillInFlight.has(tabId)) return;
  autoFillInFlight.add(tabId);
  const release = setTimeout(() => autoFillInFlight.delete(tabId), AUTOFILL_DEDUPE_MS);

  try {
    const status = await handleGetStatus();
    if (!status.authenticated || !status.profile) return;

    const injected = await ensureContentScript(tabId);
    if (!injected) return;

    // Small delay to let dynamic forms render (React, Angular, etc.)
    await new Promise((r) => setTimeout(r, 800));

    const response = await sendAutofillToTab(tabId, status.profile, null);
    if (response?.success && response?.report?.filledFieldsCount > 0) {
      console.log(`[AutoFill] Auto-filled ${response.report.filledFieldsCount} fields on ${tab.url}`);
    }
  } catch (e) {
    console.warn('[AutoFill] Auto-fill failed:', e);
  } finally {
    clearTimeout(release);
    autoFillInFlight.delete(tabId);
  }
});
