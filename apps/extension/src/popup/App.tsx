import * as React from 'react';
import { 
  Briefcase, Shield, RefreshCw, CheckCircle2, AlertTriangle, 
  ExternalLink, LogOut, UserCheck, Settings as SettingsIcon, Zap, ZapOff
} from 'lucide-react';
import { BRANDING } from '@platform/utils';

const BACKEND_URL = 'http://localhost:3000';

export function App() {
  const [authenticated, setAuthenticated] = React.useState<boolean>(false);
  const [profile, setProfile] = React.useState<any>(null);
  const [resumes, setResumes] = React.useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string>('');
  const [analytics, setAnalytics] = React.useState<any>(null);
  
  const [loading, setLoading] = React.useState<boolean>(true);
  const [autofilling, setAutofilling] = React.useState<boolean>(false);
  
  const [activeTabUrl, setActiveTabUrl] = React.useState<string>('');
  const [detectedSite, setDetectedSite] = React.useState<string>('');
  
  const [autofillReport, setAutofillReport] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [autoFillEnabled, setAutoFillEnabled] = React.useState<boolean>(false);

  // Calculate profile completion percentage
  const calculateCompletionScore = (p: any): number => {
    if (!p) return 0;
    let score = 0;
    if (p.headline) score += 15;
    if (p.bio) score += 15;
    if (p.location) score += 10;
    if (p.experiences?.length > 0) score += 20;
    if (p.educations?.length > 0) score += 20;
    if (p.projects?.length > 0) score += 10;
    if (p.skills?.length > 0) score += 10;
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
        const defaultResume = response.resumes?.find((r: any) => r.isDefault);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        } else if (response.resumes?.length > 0) {
          setSelectedResumeId(response.resumes[0].id);
        }
      } else {
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
        } else if (tab.url.includes('lever.co')) {
          setDetectedSite('Lever Application');
        } else if (tab.url.includes('myworkdayjobs.com')) {
          setDetectedSite('Workday Application');
        } else if (tab.url.includes('linkedin.com/jobs')) {
          setDetectedSite('LinkedIn Easy Apply');
        } else if (tab.url.includes('indeed.com')) {
          setDetectedSite('Indeed Application');
        } else {
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
      } else {
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
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[360px] w-[360px] flex-col items-center justify-center bg-zinc-950 p-6">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-500" />
        <p className="mt-4 text-xs text-zinc-500 font-medium">Synchronizing session...</p>
      </div>
    );
  }

  return (
    <div className="flex w-[360px] flex-col bg-zinc-950 px-5 py-4 min-h-[420px] select-none text-zinc-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
          <Shield className="h-4.5 w-4.5 text-white" />
          <span>{BRANDING.name}</span>
        </div>
        {authenticated && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenOptions}
              className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <SettingsIcon className="h-3 w-3" />
              <span>Options</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 py-4 flex flex-col justify-between">
        {!authenticated ? (
          /* UNAUTHENTICATED STATE */
          <div className="space-y-6 text-center my-auto">
            <div className="flex justify-center">
              <AlertTriangle className="h-10 w-10 text-zinc-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white">Authentication Required</h2>
              <p className="text-xs text-zinc-400 leading-relaxed px-4">
                Please log in to your {BRANDING.name} account on the web platform to enable browser autofill.
              </p>
            </div>
            <a 
              href={BACKEND_URL} 
              target="_blank" 
              className="inline-flex items-center justify-center gap-1.5 w-full h-9 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
            >
              <span>Go to {BRANDING.name}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          /* AUTHENTICATED ACTIVE PANEL */
          <div className="space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-3.5">
              {/* Account summary */}
              <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded p-2.5">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{profile?.user?.name || 'Active Profile'}</span>
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-zinc-400">Completion:</span>
                    <span className="text-[10px] font-bold text-white">{calculateCompletionScore(profile)}%</span>
                  </div>
                </div>
                <BadgePercentage score={calculateCompletionScore(profile)} />
              </div>

              {/* Target website detection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase">Active Context</label>
                <div className="flex items-center justify-between bg-zinc-900/20 border border-zinc-900 rounded px-2.5 py-2 text-xs">
                  <span className="font-semibold text-zinc-300">{detectedSite}</span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{new URL(activeTabUrl).hostname}</span>
                </div>
              </div>

              {/* Resume selection */}
              {/* Auto-Autofill Toggle */}
              <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded p-2.5">
                <div className="flex items-center gap-2">
                  {autoFillEnabled ? <Zap className="h-3.5 w-3.5 text-emerald-400" /> : <ZapOff className="h-3.5 w-3.5 text-zinc-500" />}
                  <div>
                    <p className="text-[11px] font-bold text-white">Auto Autofill</p>
                    <p className="text-[9px] text-zinc-500">{autoFillEnabled ? 'Forms fill automatically' : 'Click button to fill'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleAutoFill}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                    autoFillEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      autoFillEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {resumes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase">Select Resume Context</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-zinc-900 border border-zinc-800 rounded outline-none focus:border-zinc-700 text-white appearance-none cursor-pointer"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} {r.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2 rounded bg-red-950/40 border border-red-900/50 p-2.5 text-xs text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Autofill Report — Enhanced with Confidence Breakdown */}
              {autofillReport && (
                <div className="rounded border border-green-900/30 bg-green-950/20 p-3 space-y-2.5 text-xs text-green-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Intelligent Autofill Completed</span>
                  </div>
                  <p className="text-[11px] text-green-300/90 leading-relaxed">
                    Filled <strong className="text-white">{autofillReport.filledFieldsCount}</strong> of {autofillReport.totalFields} fields.
                    {autofillReport.executionTimeMs && <span className="text-zinc-500 ml-1">({autofillReport.executionTimeMs}ms)</span>}
                  </p>

                  {/* Confidence Breakdown Bars */}
                  {autofillReport.confidenceBreakdown && (
                    <div className="space-y-1.5 pt-1 border-t border-green-900/20">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 font-medium">Confidence Analysis</span>
                        <span className="text-zinc-500">Avg: <strong className="text-white">{Math.round(autofillReport.confidenceBreakdown.avgConfidence * 100)}%</strong></span>
                      </div>
                      <div className="flex gap-1 h-2">
                        {autofillReport.confidenceBreakdown.high > 0 && (
                          <div
                            className="bg-emerald-500 rounded-sm"
                            style={{ flex: autofillReport.confidenceBreakdown.high }}
                            title={`High: ${autofillReport.confidenceBreakdown.high}`}
                          />
                        )}
                        {autofillReport.confidenceBreakdown.medium > 0 && (
                          <div
                            className="bg-amber-500 rounded-sm"
                            style={{ flex: autofillReport.confidenceBreakdown.medium }}
                            title={`Medium: ${autofillReport.confidenceBreakdown.medium}`}
                          />
                        )}
                        {autofillReport.confidenceBreakdown.low > 0 && (
                          <div
                            className="bg-red-500 rounded-sm"
                            style={{ flex: autofillReport.confidenceBreakdown.low }}
                            title={`Low: ${autofillReport.confidenceBreakdown.low}`}
                          />
                        )}
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-emerald-400">● High: {autofillReport.confidenceBreakdown.high}</span>
                        <span className="text-amber-400">● Med: {autofillReport.confidenceBreakdown.medium}</span>
                        <span className="text-red-400">● Low: {autofillReport.confidenceBreakdown.low}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Analytics Summary */}
              {!autofillReport && analytics && (
                <div className="rounded border border-blue-900/30 bg-blue-950/20 p-3 space-y-2.5 text-xs text-blue-200">
                  <div className="flex items-center gap-2 font-bold">
                    <span>Lifetime Stats</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>Forms: <strong className="text-white">{analytics.formsFilled}</strong></div>
                    <div>Fields: <strong className="text-white">{analytics.fieldsFilled}</strong></div>
                    <div>Accepted: <strong className="text-white">{analytics.acceptedFields}</strong></div>
                    <div>Corrected: <strong className="text-white">{analytics.correctedFields}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Action */}
            <button
              onClick={triggerAutofill}
              disabled={autofilling}
              className="w-full h-10 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-4"
            >
              {autofilling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
              <span>{autofilling ? 'Analyzing...' : 'Intelligent Autofill'}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function BadgePercentage({ score }: { score: number }) {
  return (
    <div className="w-10 h-10 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-zinc-900">
      <span className="text-[10px] font-bold">{score}%</span>
      {/* Absolute indicator */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-white"
        style={{ transform: `rotate(${score * 3.6}deg)` }}
      />
    </div>
  );
}
