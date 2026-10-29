import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

const Options = () => {
  const [profileSyncStatus, setProfileSyncStatus] = useState<string>('Unknown');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [apiEndpoint, setApiEndpoint] = useState<string>('http://localhost:3000/api/ai');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['theme', 'apiEndpoint'], (result) => {
      if (result.theme) setTheme(result.theme);
      if (result.apiEndpoint) setApiEndpoint(result.apiEndpoint);
    });
    
    // Check local storage for profile cache
    chrome.storage.local.get(['profileCache'], (result) => {
      if (result.profileCache) {
        setProfileSyncStatus(`Synced (${new Date(result.profileCache.lastUpdated).toLocaleString()})`);
      } else {
        setProfileSyncStatus('Not Synced');
      }
    });
  }, []);

  const handleSave = () => {
    setSaving(true);
    chrome.storage.sync.set({ theme, apiEndpoint }, () => {
      setTimeout(() => setSaving(false), 800);
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
              <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Sync
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b border-slate-100 dark:border-slate-700 pb-2">Preferences</h2>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium">Theme</label>
              <select 
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
              <label className="block text-sm font-medium">API Endpoint (Advanced)</label>
              <input 
                type="text" 
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              />
            </div>
          </section>
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
