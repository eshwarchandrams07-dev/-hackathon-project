import React, { useState, useEffect } from 'react';
import { ViewTab, Course } from '../types';
import { apiService } from '../services/api';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Columns, 
  UploadCloud, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  activeCourse: Course | null;
  onNewUploadClick: () => void;
  isBackendOnline: boolean;
  onCheckBackendHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeCourse,
  onNewUploadClick,
  isBackendOnline,
  onCheckBackendHealth,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(apiService.getBaseUrl());
  const [isChecking, setIsChecking] = useState(false);

  const handleHealthCheck = async () => {
    setIsChecking(true);
    await onCheckBackendHealth();
    setIsChecking(false);
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    apiService.setBaseUrl(customApiUrl);
    setShowConfigModal(false);
    handleHealthCheck();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-background rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  MindForge
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono font-medium">
                  AI LMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Adaptive Curriculum & Socratic Tutor
              </p>
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('course')}
              disabled={!activeCourse}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                !activeCourse
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : currentTab === 'course'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Course Explorer</span>
            </button>

            <button
              onClick={() => onSelectTab('split-tutor')}
              disabled={!activeCourse}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                !activeCourse
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : currentTab === 'split-tutor'
                  ? 'bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Columns className="h-4 w-4" />
              <span className="flex items-center gap-1">
                Split Socratic
                <Sparkles className="h-3 w-3 text-accent-cyan animate-pulse" />
              </span>
            </button>
          </nav>

          {/* Right Actions: Backend Status & Upload CTA */}
          <div className="flex items-center gap-3">
            {/* Backend Connectivity Status */}
            <div 
              onClick={() => setShowConfigModal(true)}
              title="Click to check or configure FastAPI Backend URL"
              className="group cursor-pointer flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition"
            >
              <span className="relative flex h-2 w-2">
                {isBackendOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                )}
              </span>
              <span className="text-xs font-mono text-slate-300 hidden md:inline">
                {isBackendOnline ? 'FastAPI :8000' : 'Demo Mode'}
              </span>
              <Server className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-400 transition" />
            </div>

            {/* Quick Upload CTA */}
            <button
              onClick={onNewUploadClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs sm:text-sm font-medium shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 transition active:scale-95"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backend API Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isBackendOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {isBackendOnline ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Backend Connection</h3>
                  <p className="text-xs text-slate-400">
                    {isBackendOnline ? 'Connected to FastAPI server' : 'Backend is currently offline (Demo mode active)'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              The frontend communicates with your FastAPI backend at <code className="text-brand-300 bg-slate-800 px-1 py-0.5 rounded">http://127.0.0.1:8000</code> for <span className="text-slate-100 font-medium">/api/upload</span>, <span className="text-slate-100 font-medium">/api/generate-course</span>, and <span className="text-slate-100 font-medium">/api/chat</span>.
            </p>

            <form onSubmit={handleSaveApiUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  FastAPI Server URL
                </label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Target Host:</span>
                  <span className="font-mono text-slate-200">{apiService.getBaseUrl()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isBackendOnline ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                    {isBackendOnline ? 'Operational' : 'Unreachable (Using mock fallback)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleHealthCheck}
                  disabled={isChecking}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Retest Server'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-md shadow-brand-600/30"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
