import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
const Options = () => {
    const [profileSyncStatus, setProfileSyncStatus] = useState('Unknown');
    const [theme, setTheme] = useState('system');
    const [apiEndpoint, setApiEndpoint] = useState('http://localhost:3000/api/ai');
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        chrome.storage.sync.get(['theme', 'apiEndpoint'], (result) => {
            if (result.theme)
                setTheme(result.theme);
            if (result.apiEndpoint)
                setApiEndpoint(result.apiEndpoint);
        });
        // Check local storage for profile cache
        chrome.storage.local.get(['profileCache'], (result) => {
            if (result.profileCache) {
                setProfileSyncStatus(`Synced (${new Date(result.profileCache.lastUpdated).toLocaleString()})`);
            }
            else {
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
    return (_jsx("div", { className: "min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8", children: _jsxs("div", { className: "max-w-2xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-6", children: [_jsx("div", { className: "p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl", children: _jsx(Settings, { className: "w-8 h-8 text-blue-600 dark:text-blue-400" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "CareerHub Extension" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400 mt-1", children: "Manage your intelligent autofill preferences" })] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6", children: [_jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold border-b border-slate-100 dark:border-slate-700 pb-2", children: "Profile Sync" }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Local Cache Status" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: profileSyncStatus })] }), _jsxs("button", { className: "flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Force Sync"] })] })] }), _jsxs("section", { className: "space-y-4", children: [_jsx("h2", { className: "text-lg font-semibold border-b border-slate-100 dark:border-slate-700 pb-2", children: "Preferences" }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium", children: "Theme" }), _jsxs("select", { value: theme, onChange: (e) => setTheme(e.target.value), className: "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none", children: [_jsx("option", { value: "system", children: "System Default" }), _jsx("option", { value: "light", children: "Light" }), _jsx("option", { value: "dark", children: "Dark" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium", children: "API Endpoint (Advanced)" }), _jsx("input", { type: "text", value: apiEndpoint, onChange: (e) => setApiEndpoint(e.target.value), className: "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: handleSave, disabled: saving, className: "flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-75", children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), saving ? 'Saving...' : 'Save Settings'] }) })] }) }));
};
export default Options;
//# sourceMappingURL=Options.js.map