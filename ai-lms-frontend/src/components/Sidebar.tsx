import React, { useState } from 'react';
import { Course, UploadHistoryItem } from '../types';
import { 
  GraduationCap, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  UploadCloud, 
  PanelLeftClose, 
  PanelLeftOpen, 
  History,
  Sparkles,
  Compass,
  Search,
  FileText,
  Trash2,
  HelpCircle,
  Clock,
  Layers,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  course: Course | null;
  activeModuleId: string;
  activeLessonId: string;
  uploadHistory: UploadHistoryItem[];
  onSelectUploadHistory: (item: UploadHistoryItem) => void;
  onDeleteUploadHistory?: (id: string) => void;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onOpenOverview: () => void;
  isOverviewActive: boolean;
  onOpenUpload: () => void;
  onLoadDemoCourse: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isBackendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  uploadHistory = [],
  onSelectUploadHistory,
  onDeleteUploadHistory,
  onSelectLesson,
  onOpenOverview,
  isOverviewActive,
  onOpenUpload,
  onLoadDemoCourse,
  isOpen,
  onToggle,
  isBackendOnline,
}) => {
  // Defaults to upload history if no course active; user can toggle between 'history' and 'syllabus'
  const [activeTab, setActiveTab] = useState<'history' | 'syllabus'>('history');
  const [searchQuery, setSearchQuery] = useState('');

  // Track open state of module accordions when syllabus is active
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (course) {
      course.modules.forEach(m => {
        initial[m.module_id] = true;
      });
    }
    return initial;
  });

  const toggleModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;

  // Filter upload history list by search query
  const filteredUploadHistory = (uploadHistory || []).filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.courseTitle.toLowerCase().includes(q) ||
      item.documentName.toLowerCase().includes(q)
    );
  });

  if (!isOpen) {
    return (
      <aside className="fixed left-3 top-3.5 z-40">
        <button
          onClick={onToggle}
          className="h-9 w-9 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition"
          title="Open Navigation"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 shrink-0 h-screen sticky top-0 flex flex-col border-r border-slate-800/80 bg-[#090d15] z-30 select-none">
      
      {/* 1. App Header & Brand */}
      <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div 
          onClick={() => {
            if (course) onOpenOverview();
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/20 transition">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight text-white block">
              MindForge
            </span>
            <span className="text-[10px] text-slate-500 font-mono block leading-none">
              AI LMS Workspace
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Top View Switcher (Upload History vs Syllabus) */}
      <div className="p-3 border-b border-slate-800/60 space-y-2 shrink-0">
        <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition font-medium ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5 text-brand-400" />
            <span>Upload History</span>
            {uploadHistory.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 font-mono">
                {uploadHistory.length}
              </span>
            )}
          </button>

          {course && (
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition font-medium ${
                activeTab === 'syllabus'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>Syllabus</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                {totalLessons}
              </span>
            </button>
          )}
        </div>

        {/* Quick Action: Upload New Material */}
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:text-white transition group"
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="h-3.5 w-3.5 text-brand-400 group-hover:scale-110 transition" />
            <span>+ Upload PDF Material</span>
          </div>
          <span className="text-[10px] font-mono text-brand-400/80">Ingest</span>
        </button>
      </div>

      {/* 3. Panel Content: Upload History Mode (DEFAULT) */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* History Search & Tools Header */}
          <div className="px-3 pt-2.5 pb-2 border-b border-slate-800/60 space-y-2 shrink-0">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search uploaded materials..."
                className="w-full bg-slate-900/90 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-800 focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>Saved Courses ({filteredUploadHistory.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Click to Restore</span>
            </div>
          </div>

          {/* Chronological Upload History List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {filteredUploadHistory.length === 0 ? (
              <div className="py-12 text-center space-y-3 px-4">
                <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <UploadCloud className="h-5 w-5 text-brand-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 font-medium">No Upload History Yet</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload a lecture PDF or slides. Each session will appear here with all its quizzes and AI tutor activities saved.
                  </p>
                </div>
                <button
                  onClick={onOpenUpload}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>
            ) : (
              filteredUploadHistory.map((item) => {
                const isCurrent = course && (course.course_title === item.courseTitle || course.course_title === item.course.course_title);

                return (
                  <div
                    key={item.id || item.sessionId}
                    onClick={() => {
                      onSelectUploadHistory(item);
                      setActiveTab('syllabus');
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer group space-y-2 relative ${
                      isCurrent
                        ? 'border-brand-500/60 bg-brand-500/10 shadow-sm'
                        : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    {/* Header: Title & Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        <h4 className={`text-xs font-semibold leading-snug truncate ${
                          isCurrent ? 'text-white' : 'text-slate-200 group-hover:text-white'
                        }`} title={item.courseTitle}>
                          {item.courseTitle}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 truncate">
                          <FileText className="h-3 w-3 text-brand-400 shrink-0" />
                          <span className="truncate">{item.documentName}</span>
                        </div>
                      </div>

                      {onDeleteUploadHistory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUploadHistory(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
                          title="Remove from history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Metadata Badges: Modules, Lessons, Quizzes */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-300">
                        {item.totalModules} Modules
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-300">
                        {item.totalLessons} Lessons
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {item.totalQuizzes} Quizzes
                      </span>
                    </div>

                    {/* Footer: Timestamp & Active status */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/60">
                      <span>
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-brand-400 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                          Resume →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. Panel Content: Course Syllabus Mode */}
      {activeTab === 'syllabus' && course && (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Syllabus Header */}
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between shrink-0">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Current Course
              </span>
              <h4 className="text-xs font-medium text-slate-200 truncate" title={course.course_title}>
                {course.course_title}
              </h4>
            </div>
            <button
              onClick={onOpenOverview}
              className={`p-1 rounded-md transition text-slate-400 hover:text-white ${isOverviewActive ? 'bg-slate-800 text-white' : ''}`}
              title="View full syllabus overview"
            >
              <Compass className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scrollable Curriculum Tree */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {course.modules.map((mod, modIdx) => {
              const isExpanded = !!expandedModules[mod.module_id];
              const isModActive = mod.module_id === activeModuleId && !isOverviewActive;

              return (
                <div key={mod.module_id} className="rounded-xl overflow-hidden">
                  <button
                    onClick={(e) => toggleModule(mod.module_id, e)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition text-left group ${
                      isModActive
                        ? 'text-slate-200 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                      <span className="text-slate-500 group-hover:text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        M{modIdx + 1}
                      </span>
                      <span className="truncate text-xs" title={mod.title}>
                        {mod.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 shrink-0">
                      {mod.lessons.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-4 pr-1 pt-0.5 space-y-0.5 border-l border-slate-800/80 ml-3.5 mt-0.5">
                      {mod.lessons.map((les, lesIdx) => {
                        const isLessonActive = !isOverviewActive && mod.module_id === activeModuleId && les.lesson_id === activeLessonId;

                        return (
                          <button
                            key={les.lesson_id}
                            onClick={() => onSelectLesson(mod.module_id, les.lesson_id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between gap-1.5 ${
                              isLessonActive
                                ? 'bg-brand-600 text-white font-medium shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`font-mono text-[10px] ${isLessonActive ? 'text-brand-200' : 'text-slate-600'}`}>
                                {modIdx + 1}.{lesIdx + 1}
                              </span>
                              <span className="truncate">{les.title}</span>
                            </div>
                            {les.quiz && les.quiz.length > 0 && (
                              <span 
                                className={`text-[9px] font-mono px-1 rounded shrink-0 ${
                                  isLessonActive 
                                    ? 'bg-brand-700 text-brand-200' 
                                    : 'text-slate-500 bg-slate-900 border border-slate-800/60'
                                }`}
                                title={`${les.quiz.length} quiz questions`}
                              >
                                Q{les.quiz.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Bottom Action: On-Demand Demo Course Option */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0 space-y-2">
        <button
          onClick={onLoadDemoCourse}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition"
        >
          <Sparkles className="h-3 w-3 text-brand-400" />
          <span>{course ? "Switch to Demo Course" : "Explore Demo Course"}</span>
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1 border-t border-slate-900">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="font-mono">
              {isBackendOnline ? 'Database Online' : 'Local Storage'}
            </span>
          </div>
          <span className="font-mono text-slate-600">v1.3</span>
        </div>
      </div>

    </aside>
  );
};
