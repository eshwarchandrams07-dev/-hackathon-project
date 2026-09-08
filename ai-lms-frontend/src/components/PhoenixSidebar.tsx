import React, { useState } from 'react';
import { NavTab, Course, Subject } from '../types';
import { subjectService } from '../services/subjectService';
import { 
  Home, 
  BookOpen, 
  BarChart2, 
  Settings, 
  Sparkles,
  Layers,
  ChevronRight,
  ChevronDown,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface PhoenixSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  subjectsCount?: number;
  quizzesDueCount?: number;
  activeCourse?: Course | null;
  activeSubject?: Subject | null;
  activeModuleId?: string;
  activeLessonId?: string;
  onSelectLesson?: (moduleId: string, lessonId: string) => void;
}

export const PhoenixSidebar: React.FC<PhoenixSidebarProps> = ({
  currentTab,
  onSelectTab,
  subjectsCount = 3,
  quizzesDueCount = 2,
  activeCourse,
  activeSubject,
  activeModuleId,
  activeLessonId,
  onSelectLesson
}) => {
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (modId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: BookOpen,
      badge: subjectsCount,
      badgeColor: 'bg-[#6B7C98]/20 text-[#E9E6E7] border-[#6B7C98]/40'
    },
    {
      id: 'analytics',
      label: 'Skill Analytics',
      icon: BarChart2,
      badge: 'Live',
      badgeColor: 'bg-[#AB978C]/20 text-[#AB978C] border-[#AB978C]/40'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 h-full border-r border-[#102A43]/40 bg-[#102A43] text-white flex flex-col justify-between shrink-0 select-none z-20 shadow-xl overflow-hidden">
      
      {/* Scrollable Center: Main Menu + Current Course Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Navigation Links */}
        <div className="p-3 space-y-1.5 pt-4 shrink-0">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#829AB1] uppercase tracking-wider">
            Main Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id && (!activeCourse || currentTab !== 'study');

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00A3BF] text-white shadow-md shadow-[#00A3BF]/30 font-semibold'
                    : 'text-[#BCCCDC] hover:text-white hover:bg-[#1B3A57] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#829AB1]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                    isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : item.badgeColor || 'bg-[#1B3A57] text-[#BCCCDC] border-[#243B53]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Course Tree Hierarchy: Only display when inside a subject or PDF material */}
        {currentTab === 'study' && activeCourse && (
          <div className="p-3 pt-3 border-t border-[#1B3A57] mt-1 space-y-3">
            {/* Header: CURRENT COURSE + Compass Icon */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#829AB1] uppercase tracking-wider">
                CURRENT COURSE
              </span>
              <Compass className="h-4 w-4 text-[#829AB1]" />
            </div>

            {/* Main Name as Subject / Course Title */}
            <div 
              className="text-xs font-bold text-white px-1 leading-snug break-words"
              title={activeSubject?.name || activeCourse.course_title}
            >
              {activeSubject?.name || activeCourse.course_title}
            </div>

            {/* Slide Progress Counter Pill */}
            {activeSubject && (() => {
              const stats = subjectService.getSubjectLessonStats(activeSubject);
              return (
                <div className="mx-1 px-2.5 py-2 rounded-xl bg-[#0D2235] border border-[#1B3A57] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#829AB1]">Blended Progress</span>
                    <span className="font-bold font-mono text-white">
                      {stats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1B3A57] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${stats.progressPercent === 100 ? 'bg-emerald-400' : 'bg-[#00A3BF]'}`}
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#829AB1]">
                    <span>Slides (70%): {stats.openedLessonsCount}/{stats.totalLessons}</span>
                    <span>Quiz (30%): {stats.assessmentScore}%</span>
                  </div>
                </div>
              );
            })()}

            {/* Modules and Sub-branch Lessons */}
            <div className="space-y-3.5 pt-0.5">
              {activeCourse.modules.map((mod, modIdx) => {
                const isCollapsed = collapsedModules[mod.module_id] === true;
                const totalLessons = mod.lessons?.length || 0;

                return (
                  <div key={mod.module_id} className="space-y-1.5">
                    {/* Module Title with Chevron & Count (e.g. v M1 FCFS Scheduling Implementation  1) */}
                    <button
                      onClick={() => toggleModule(mod.module_id)}
                      className="w-full flex items-center justify-between text-left group cursor-pointer px-1 py-0.5"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <ChevronDown className={`h-3.5 w-3.5 text-[#829AB1] transition-transform duration-200 shrink-0 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`} />
                        <span className="text-xs font-semibold text-[#829AB1] shrink-0 font-mono">
                          M{modIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-white/95 group-hover:text-white truncate">
                          {mod.title.replace(/^M\d+[\s:]*/i, '')}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#829AB1] group-hover:text-white shrink-0">
                        {totalLessons}
                      </span>
                    </button>

                    {/* Sub-branch Lessons (e.g. 1.1 FCFS Logic and Calculation  Q2) */}
                    {!isCollapsed && (
                      <div className="space-y-1 pl-4">
                        {mod.lessons.map((les, lesIdx) => {
                          const isActive = les.lesson_id === activeLessonId;
                          const isOpened = activeSubject?.openedLessonIds?.includes(les.lesson_id);
                          const qCount = les.quiz?.length || 2;

                          return (
                            <button
                              key={les.lesson_id}
                              onClick={() => onSelectLesson?.(mod.module_id, les.lesson_id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/25 font-semibold'
                                  : isOpened
                                  ? 'text-emerald-300 hover:text-white hover:bg-[#1B3A57]/60 font-medium'
                                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1B3A57]/60 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                {isOpened && !isActive ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <span className={`text-[11px] font-mono shrink-0 ${
                                    isActive ? 'text-blue-100 font-bold' : 'text-[#64748B]'
                                  }`}>
                                    {modIdx + 1}.{lesIdx + 1}
                                  </span>
                                )}
                                <span className="truncate text-xs">
                                  {les.title.replace(/^\d+\.\d+[\s:]*/, '')}
                                </span>
                              </div>

                              {/* Question Count Pill (e.g. Q2) */}
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isActive
                                  ? 'bg-black/20 text-white'
                                  : 'bg-[#0D2235] text-[#829AB1] border border-[#243B53]'
                              }`}>
                                Q{qCount}
                              </span>
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

      </div>

      {/* Bottom Info Card: Socratic AI Notice */}
      <div className="p-3 shrink-0">
        <div className="rounded-xl border border-[#243B53] bg-[#0D2235] p-3 space-y-1.5 shadow-inner">
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#7B61FF]" />
            <span className="text-[#F0F4F8]">Socratic AI Ready</span>
          </div>
          <p className="text-[10px] text-[#9FB3C8] leading-relaxed">
            Lesson-grounded guidance & real-time concept reinforcement.
          </p>
        </div>
      </div>

    </aside>
  );
};