/**
 * Backend URL configuration — the ONE place the extension decides where it
 * sends the user's session token and profile data.
 *
 * Stored in chrome.storage.sync under `backend_url` as a bare origin
 * (e.g. "https://app.example.com"). Only https origins are accepted, plus
 * plain-http localhost for development, so a typo or a malicious value can
 * never redirect the JWT to an arbitrary host.
 */

export const DEFAULT_BACKEND_URL = 'http://localhost:3000';
export const BACKEND_URL_KEY = 'backend_url';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Returns the normalized origin when the URL is an acceptable backend, or
 * null when it is not (bad syntax, wrong scheme, credentials in URL, …).
 */
export function normalizeBackendUrl(input: string): string | null {
  const trimmed = (input || '').trim();
  if (!trimmed || trimmed.length > 2048) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.username || url.password) return null;
  if (url.protocol === 'https:') return url.origin;
  if (url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)) return url.origin;
  return null;
}

export function isAllowedBackendUrl(input: string): boolean {
  return normalizeBackendUrl(input) !== null;
}

/** Host-permission pattern for a backend origin (used with chrome.permissions). */
export function originPattern(origin: string): string {
  return `${origin}/*`;
}

/**
 * Reads the configured backend origin. Falls back to the development default
 * when nothing valid is stored.
 */
export async function getBackendUrl(): Promise<string> {
  if (typeof chrome === 'undefined' || !chrome.storage?.sync) {
    return DEFAULT_BACKEND_URL;
  }
  return new Promise((resolve) => {
    chrome.storage.sync.get([BACKEND_URL_KEY], (result) => {
      const stored = typeof result[BACKEND_URL_KEY] === 'string' ? result[BACKEND_URL_KEY] : '';
      resolve(normalizeBackendUrl(stored) ?? DEFAULT_BACKEND_URL);
    });
  });
}

/** Persists a validated backend origin. Throws on an invalid URL. */
export async function setBackendUrl(input: string): Promise<string> {
  const origin = normalizeBackendUrl(input);
  if (!origin) {
    throw new Error('Backend URL must be an https:// origin (or http://localhost for development).');
  }
  await chrome.storage.sync.set({ [BACKEND_URL_KEY]: origin });
  return origin;
}
