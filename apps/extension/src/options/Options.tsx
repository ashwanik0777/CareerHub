import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { DEFAULT_BACKEND_URL, getBackendUrl, normalizeBackendUrl, originPattern, setBackendUrl } from '../utils/backend-config';

const Options = () => {
  const [profileSyncStatus, setProfileSyncStatus] = useState<string>('Unknown');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [backendUrl, setBackendUrlInput] = useState<string>(DEFAULT_BACKEND_URL);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const refreshSyncStatus = () => {
    chrome.storage.local.get(['profileCache'], (result) => {
      if (result.profileCache) {
        setProfileSyncStatus(`Synced (${new Date(result.profileCache.lastUpdated).toLocaleString()})`);
      } else {
        setProfileSyncStatus('Not Synced');
      }
    });
  };

  useEffect(() => {
    chrome.storage.sync.get(['theme'], (result) => {
      if (result.theme === 'light' || result.theme === 'dark' || result.theme === 'system') setTheme(result.theme);
    });
    getBackendUrl().then(setBackendUrlInput);
    refreshSyncStatus();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const origin = normalizeBackendUrl(backendUrl);
      if (!origin) {
        throw new Error('Backend URL must be an https:// origin (http://localhost is allowed for development).');
      }

      // The extension needs host access to read the session cookie for this
      // origin. Ask only for that one origin, never for every site.
      const granted = await chrome.permissions.request({ origins: [originPattern(origin)] });
      if (!granted) {
        throw new Error('Permission for that origin was not granted; the backend URL was not changed.');
      }

      await setBackendUrl(origin);
      await chrome.storage.sync.set({ theme });
      setBackendUrlInput(origin);
      setMessage({ type: 'ok', text: 'Settings saved.' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleForceSync = () => {
    setSyncing(true);
    setMessage(null);
    chrome.runtime.sendMessage({ action: 'FORCE_SYNC' }, (response) => {
      setSyncing(false);
      if (chrome.runtime.lastError || !response) {
        setMessage({ type: 'error', text: 'Could not reach the background service.' });
      } else if (!response.authenticated) {
        setMessage({ type: 'error', text: response.error || 'Not logged in.' });
      } else {
        setMessage({ type: 'ok', text: 'Profile re-synced from the backend.' });
      }
      refreshSyncStatus();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CareerHub Extension</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your intelligent autofill preferences</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-700 pb-2">Profile Sync</h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="font-medium">Local Cache Status</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profileSyncStatus}</p>
              </div>
              <button
                onClick={handleForceSync}
                disabled={syncing}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Force Sync'}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-700 pb-2">Preferences</h2>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium" htmlFor="theme">Theme</label>
              <select 
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium" htmlFor="backendUrl">Backend URL (Advanced)</label>
              <input 
                id="backendUrl"
                type="url" 
                value={backendUrl}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                placeholder="https://app.example.com"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Origin of the CareerHub web app your session cookie belongs to. Only https:// origins are accepted
                (http://localhost for local development). Saving asks Chrome for access to that one site.
              </p>
            </div>
          </section>

          {message && (
            <p className={`text-sm ${message.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {message.text}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-75"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Options;
