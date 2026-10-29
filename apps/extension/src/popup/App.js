import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Briefcase, Shield, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, LogOut, UserCheck, Settings as SettingsIcon, Zap, ZapOff } from 'lucide-react';
import { BRANDING } from '@platform/utils';
const BACKEND_URL = 'http://localhost:3000';
export function App() {
    const [authenticated, setAuthenticated] = React.useState(false);
    const [profile, setProfile] = React.useState(null);
    const [resumes, setResumes] = React.useState([]);
    const [selectedResumeId, setSelectedResumeId] = React.useState('');
    const [analytics, setAnalytics] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [autofilling, setAutofilling] = React.useState(false);
    const [activeTabUrl, setActiveTabUrl] = React.useState('');
    const [detectedSite, setDetectedSite] = React.useState('');
    const [autofillReport, setAutofillReport] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [autoFillEnabled, setAutoFillEnabled] = React.useState(false);
    // Calculate profile completion percentage
    const calculateCompletionScore = (p) => {
        if (!p)
            return 0;
        let score = 0;
        if (p.headline)
            score += 15;
        if (p.bio)
            score += 15;
        if (p.location)
            score += 10;
        if (p.experiences?.length > 0)
            score += 20;
        if (p.educations?.length > 0)
            score += 20;
        if (p.projects?.length > 0)
            score += 10;
        if (p.skills?.length > 0)
            score += 10;
        return score;
    };
    const getStatus = () => {
        setLoading(true);
        setError(null);
        chrome.runtime.sendMessage({ action: 'GET_STATUS' }, (response) => {
            if (chrome.runtime.lastError) {
                setError('Could not establish connection with background service.');
                setLoading(false);
                return;
            }
            if (response && response.authenticated) {
                setAuthenticated(true);
                setProfile(response.profile);
                setResumes(response.resumes || []);
                // Select default resume initially
                const defaultResume = response.resumes?.find((r) => r.isDefault);
                if (defaultResume) {
                    setSelectedResumeId(defaultResume.id);
                }
                else if (response.resumes?.length > 0) {
                    setSelectedResumeId(response.resumes[0].id);
                }
            }
            else {
                setAuthenticated(false);
                setError(response?.error || `Please log in to the ${BRANDING.name} web application.`);
            }
            setLoading(false);
        });
    };
    React.useEffect(() => {
        getStatus();
        // Query active tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (tab && tab.url) {
                setActiveTabUrl(tab.url);
                // Enhanced site detection for display
                if (tab.url.includes('greenhouse.io')) {
                    setDetectedSite('Greenhouse Application');
                }
                else if (tab.url.includes('lever.co')) {
                    setDetectedSite('Lever Application');
                }
                else if (tab.url.includes('myworkdayjobs.com')) {
                    setDetectedSite('Workday Application');
                }
                else if (tab.url.includes('linkedin.com/jobs')) {
                    setDetectedSite('LinkedIn Easy Apply');
                }
                else if (tab.url.includes('indeed.com')) {
                    setDetectedSite('Indeed Application');
                }
                else {
                    setDetectedSite('Standard Web Form');
                }
            }
        });
        // Fetch analytics and auto-fill setting
        chrome.storage.local.get(['analyticsData', 'autoFillEnabled'], (result) => {
            if (result.analyticsData) {
                setAnalytics(result.analyticsData);
            }
            if (result.autoFillEnabled !== undefined) {
                setAutoFillEnabled(result.autoFillEnabled);
            }
        });
    }, []);
    const toggleAutoFill = () => {
        const newValue = !autoFillEnabled;
        setAutoFillEnabled(newValue);
        chrome.storage.local.set({ autoFillEnabled: newValue });
        // Notify background script about the change
        chrome.runtime.sendMessage({ action: 'SET_AUTO_FILL', enabled: newValue });
    };
    const triggerAutofill = () => {
        setAutofilling(true);
        setError(null);
        setAutofillReport(null);
        chrome.runtime.sendMessage({
            action: 'TRIGGER_AUTOFILL',
            resumeId: selectedResumeId || undefined
        }, (response) => {
            setAutofilling(false);
            if (chrome.runtime.lastError) {
                setError('Autofill request timed out.');
                return;
            }
            if (response && response.success) {
                setAutofillReport(response.report);
            }
            else {
                setError(response?.error || 'No compatible form found on active tab.');
            }
        });
    };
    const handleLogout = () => {
        window.open(`${BACKEND_URL}/dashboard/settings`, '_blank');
    };
    const handleOpenOptions = () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        }
        else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex h-[360px] w-[360px] flex-col items-center justify-center bg-zinc-950 p-6", children: [_jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-zinc-500" }), _jsx("p", { className: "mt-4 text-xs text-zinc-500 font-medium", children: "Synchronizing session..." })] }));
    }
    return (_jsxs("div", { className: "flex w-[360px] flex-col bg-zinc-950 px-5 py-4 min-h-[420px] select-none text-zinc-50 font-sans", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-zinc-900 pb-3", children: [_jsxs("div", { className: "flex items-center gap-1.5 font-bold text-sm tracking-wide", children: [_jsx(Shield, { className: "h-4.5 w-4.5 text-white" }), _jsx("span", { children: BRANDING.name })] }), authenticated && (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: handleOpenOptions, className: "flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer", children: [_jsx(SettingsIcon, { className: "h-3 w-3" }), _jsx("span", { children: "Options" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer", children: [_jsx(LogOut, { className: "h-3 w-3" }), _jsx("span", { children: "Sign out" })] })] }))] }), _jsx("main", { className: "flex-1 py-4 flex flex-col justify-between", children: !authenticated ? (
                /* UNAUTHENTICATED STATE */
                _jsxs("div", { className: "space-y-6 text-center my-auto", children: [_jsx("div", { className: "flex justify-center", children: _jsx(AlertTriangle, { className: "h-10 w-10 text-zinc-500" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "text-sm font-bold text-white", children: "Authentication Required" }), _jsxs("p", { className: "text-xs text-zinc-400 leading-relaxed px-4", children: ["Please log in to your ", BRANDING.name, " account on the web platform to enable browser autofill."] })] }), _jsxs("a", { href: BACKEND_URL, target: "_blank", className: "inline-flex items-center justify-center gap-1.5 w-full h-9 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer", children: [_jsxs("span", { children: ["Go to ", BRANDING.name] }), _jsx(ExternalLink, { className: "h-3.5 w-3.5" })] })] })) : (
                /* AUTHENTICATED ACTIVE PANEL */
                _jsxs("div", { className: "space-y-4 flex flex-col justify-between h-full", children: [_jsxs("div", { className: "space-y-3.5", children: [_jsxs("div", { className: "flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded p-2.5", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsxs("p", { className: "text-xs font-bold text-white flex items-center gap-1.5", children: [_jsx(UserCheck, { className: "h-3.5 w-3.5 text-zinc-400" }), _jsx("span", { children: profile?.user?.name || 'Active Profile' })] }), _jsxs("div", { className: "flex items-center gap-1.5 pt-1", children: [_jsx("span", { className: "text-[10px] font-semibold text-zinc-400", children: "Completion:" }), _jsxs("span", { className: "text-[10px] font-bold text-white", children: [calculateCompletionScore(profile), "%"] })] })] }), _jsx(BadgePercentage, { score: calculateCompletionScore(profile) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[9px] font-semibold tracking-wider text-zinc-500 uppercase", children: "Active Context" }), _jsxs("div", { className: "flex items-center justify-between bg-zinc-900/20 border border-zinc-900 rounded px-2.5 py-2 text-xs", children: [_jsx("span", { className: "font-semibold text-zinc-300", children: detectedSite }), _jsx("span", { className: "text-[10px] text-zinc-500 truncate max-w-[120px]", children: new URL(activeTabUrl).hostname })] })] }), _jsxs("div", { className: "flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded p-2.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [autoFillEnabled ? _jsx(Zap, { className: "h-3.5 w-3.5 text-emerald-400" }) : _jsx(ZapOff, { className: "h-3.5 w-3.5 text-zinc-500" }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-bold text-white", children: "Auto Autofill" }), _jsx("p", { className: "text-[9px] text-zinc-500", children: autoFillEnabled ? 'Forms fill automatically' : 'Click button to fill' })] })] }), _jsx("button", { onClick: toggleAutoFill, className: `relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${autoFillEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`, children: _jsx("span", { className: `absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${autoFillEnabled ? 'translate-x-4' : 'translate-x-0'}` }) })] }), resumes.length > 0 && (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-[9px] font-semibold tracking-wider text-zinc-500 uppercase", children: "Select Resume Context" }), _jsx("select", { value: selectedResumeId, onChange: (e) => setSelectedResumeId(e.target.value), className: "w-full h-8 px-2 text-xs bg-zinc-900 border border-zinc-800 rounded outline-none focus:border-zinc-700 text-white appearance-none cursor-pointer", children: resumes.map((r) => (_jsxs("option", { value: r.id, children: [r.title, " ", r.isDefault ? '(Default)' : ''] }, r.id))) })] })), error && (_jsxs("div", { className: "flex items-start gap-2 rounded bg-red-950/40 border border-red-900/50 p-2.5 text-xs text-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), autofillReport && (_jsxs("div", { className: "rounded border border-green-900/30 bg-green-950/20 p-3 space-y-2.5 text-xs text-green-200", children: [_jsxs("div", { className: "flex items-center gap-1.5 font-bold", children: [_jsx(CheckCircle2, { className: "h-4 w-4 text-green-400" }), _jsx("span", { children: "Intelligent Autofill Completed" })] }), _jsxs("p", { className: "text-[11px] text-green-300/90 leading-relaxed", children: ["Filled ", _jsx("strong", { className: "text-white", children: autofillReport.filledFieldsCount }), " of ", autofillReport.totalFields, " fields.", autofillReport.executionTimeMs && _jsxs("span", { className: "text-zinc-500 ml-1", children: ["(", autofillReport.executionTimeMs, "ms)"] })] }), autofillReport.confidenceBreakdown && (_jsxs("div", { className: "space-y-1.5 pt-1 border-t border-green-900/20", children: [_jsxs("div", { className: "flex items-center justify-between text-[10px]", children: [_jsx("span", { className: "text-zinc-400 font-medium", children: "Confidence Analysis" }), _jsxs("span", { className: "text-zinc-500", children: ["Avg: ", _jsxs("strong", { className: "text-white", children: [Math.round(autofillReport.confidenceBreakdown.avgConfidence * 100), "%"] })] })] }), _jsxs("div", { className: "flex gap-1 h-2", children: [autofillReport.confidenceBreakdown.high > 0 && (_jsx("div", { className: "bg-emerald-500 rounded-sm", style: { flex: autofillReport.confidenceBreakdown.high }, title: `High: ${autofillReport.confidenceBreakdown.high}` })), autofillReport.confidenceBreakdown.medium > 0 && (_jsx("div", { className: "bg-amber-500 rounded-sm", style: { flex: autofillReport.confidenceBreakdown.medium }, title: `Medium: ${autofillReport.confidenceBreakdown.medium}` })), autofillReport.confidenceBreakdown.low > 0 && (_jsx("div", { className: "bg-red-500 rounded-sm", style: { flex: autofillReport.confidenceBreakdown.low }, title: `Low: ${autofillReport.confidenceBreakdown.low}` }))] }), _jsxs("div", { className: "flex justify-between text-[9px]", children: [_jsxs("span", { className: "text-emerald-400", children: ["\u25CF High: ", autofillReport.confidenceBreakdown.high] }), _jsxs("span", { className: "text-amber-400", children: ["\u25CF Med: ", autofillReport.confidenceBreakdown.medium] }), _jsxs("span", { className: "text-red-400", children: ["\u25CF Low: ", autofillReport.confidenceBreakdown.low] })] })] }))] })), !autofillReport && analytics && (_jsxs("div", { className: "rounded border border-blue-900/30 bg-blue-950/20 p-3 space-y-2.5 text-xs text-blue-200", children: [_jsx("div", { className: "flex items-center gap-2 font-bold", children: _jsx("span", { children: "Lifetime Stats" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-[10px]", children: [_jsxs("div", { children: ["Forms: ", _jsx("strong", { className: "text-white", children: analytics.formsFilled })] }), _jsxs("div", { children: ["Fields: ", _jsx("strong", { className: "text-white", children: analytics.fieldsFilled })] }), _jsxs("div", { children: ["Accepted: ", _jsx("strong", { className: "text-white", children: analytics.acceptedFields })] }), _jsxs("div", { children: ["Corrected: ", _jsx("strong", { className: "text-white", children: analytics.correctedFields })] })] })] }))] }), _jsxs("button", { onClick: triggerAutofill, disabled: autofilling, className: "w-full h-10 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-4", children: [autofilling ? _jsx(RefreshCw, { className: "h-4 w-4 animate-spin" }) : _jsx(Briefcase, { className: "h-4 w-4" }), _jsx("span", { children: autofilling ? 'Analyzing...' : 'Intelligent Autofill' })] })] })) })] }));
}
function BadgePercentage({ score }) {
    return (_jsxs("div", { className: "w-10 h-10 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-zinc-900", children: [_jsxs("span", { className: "text-[10px] font-bold", children: [score, "%"] }), _jsx("div", { className: "absolute inset-0 rounded-full border-2 border-transparent border-t-white", style: { transform: `rotate(${score * 3.6}deg)` } })] }));
}
//# sourceMappingURL=App.js.map