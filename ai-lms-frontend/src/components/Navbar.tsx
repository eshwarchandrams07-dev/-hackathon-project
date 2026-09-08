import React, { useState } from 'react';
import { Course, Module, Lesson } from '../types';
import { apiService } from '../services/api';
import { 
  PanelLeft, 
  ChevronRight, 
  Bot, 
  UploadCloud, 
  Server, 
  RefreshCw, 
  X,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeCourse: Course | null;
  activeModule: Module | undefined;
  activeLesson: Lesson | undefined;
  isOverviewActive: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isTutorOpen: boolean;
  onToggleTutor: () => void;
  onOpenUpload: () => void;
  onLoadDemoCourse?: () => void;
  isBackendOnline: boolean;
  onCheckBackendHealth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCourse,
  activeModule,
  activeLesson,
  isOverviewActive,
  isSidebarOpen,
  onToggleSidebar,
  isTutorOpen,
  onToggleTutor,
  onOpenUpload,
  onLoadDemoCourse,
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
      <header className="h-13 border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
        
        {/* Left: Sidebar Toggle & Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 pr-4">
          {!isSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800 transition shrink-0"
              title="Open Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate min-w-0">
            {activeCourse ? (
              <>
                <span className="font-medium text-slate-300 truncate max-w-[140px] sm:max-w-[200px]" title={activeCourse.course_title}>
                  {activeCourse.course_title}
                </span>
                <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />

                {isOverviewActive ? (
                  <span className="text-white font-medium truncate">
                    Syllabus Overview
                  </span>
                ) : (
                  <>
                    {activeModule && (
                      <>
                        <span className="text-slate-400 truncate hidden md:inline max-w-[160px]" title={activeModule.title}>
                          {activeModule.title}
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-600 shrink-0 hidden md:inline" />
                      </>
                    )}
                    {activeLesson && (
                      <span className="text-white font-medium truncate max-w-[180px] sm:max-w-[260px]" title={activeLesson.title}>
                        {activeLesson.title}
                      </span>
                    )}
                  </>
                )}
              </>
            ) : (
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-brand-400" />
                <span>Upload Course Material</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Quick Demo Button if no course active */}
          {!activeCourse && onLoadDemoCourse && (
            <button
              onClick={onLoadDemoCourse}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>Load Demo</span>
            </button>
          )}

          {/* Quick Ingest Button */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm"
          >
            <UploadCloud className="h-3.5 w-3.5 text-white" />
            <span>Upload PDF</span>
          </button>

          {/* Backend Status Dot */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 text-slate-400 text-xs transition"
            title="FastAPI Server Status"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
              {isBackendOnline ? 'API :8000' : 'Demo'}
            </span>
          </button>

          {/* Toggle Socratic Tutor Companion */}
          <button
            onClick={onToggleTutor}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
              isTutorOpen
                ? 'bg-brand-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title={isTutorOpen ? 'Close Socratic Tutor Panel' : 'Open Socratic Tutor Panel'}
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {isTutorOpen ? 'Hide Tutor' : 'Ask Tutor'}
            </span>
          </button>

        </div>
      </header>

      {/* Backend API Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white">Backend Server</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 mb-4 text-xs">
              <div className={`h-2 w-2 rounded-full shrink-0 ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="text-slate-300">
                {isBackendOnline 
                  ? 'Connected to FastAPI (:8000)'
                  : 'FastAPI unreachable (local demo mode active)'}
              </div>
            </div>

            <form onSubmit={handleSaveApiUrl} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  API Target Host
                </label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleHealthCheck}
                  disabled={isChecking}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Retest'}</span>
                </button>

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition"
                >
                  Save URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
