import React from 'react';
import { Course, Module, Lesson } from '../types';
import ReactMarkdown from 'react-markdown';
import { ConceptGraph } from './ConceptGraph';
import { QuizWidget } from './QuizWidget';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Key, 
  ArrowLeft, 
  ArrowRight, 
  Columns, 
  Layers,
  GraduationCap,
  Clock
} from 'lucide-react';

interface CourseViewProps {
  course: Course;
  activeModuleId: string;
  activeLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onOpenSplitTutor: () => void;
  onAskTutor: (prompt: string) => void;
}

export const CourseView: React.FC<CourseViewProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  onSelectLesson,
  onOpenSplitTutor,
  onAskTutor,
}) => {
  const currentModule = course.modules.find(m => m.module_id === activeModuleId) || course.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  // Calculate totals
  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const totalConcepts = course.modules.reduce((acc, m) => acc + (m.concept_nodes?.length || 0), 0);

  // Find next/prev lesson for smooth forward/backward paging
  const allLessonsFlat: Array<{ moduleId: string; lesson: Lesson }> = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessonsFlat.push({ moduleId: m.module_id, lesson: l });
    });
  });

  const currentIndex = allLessonsFlat.findIndex(
    item => item.moduleId === activeModuleId && item.lesson.lesson_id === activeLessonId
  );
  const prevLesson = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Course Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute right-0 top-0 h-48 w-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Interactive Modular Course</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {course.course_title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {course.overview}
            </p>
          </div>

          {/* Quick Stats & Action */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono">
                {course.modules.length} Modules
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono">
                {totalLessons} Lessons
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-accent-cyan">
                {totalConcepts} Concepts
              </span>
            </div>

            <button
              onClick={onOpenSplitTutor}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 transition active:scale-95"
            >
              <Columns className="h-4 w-4 text-accent-cyan" />
              <span>Open Split-Screen Tutor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Lesson Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Module & Lesson Tree */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-400" />
                <span>Curriculum Modules</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {allLessonsFlat.length > 0 ? `${currentIndex + 1} of ${allLessonsFlat.length}` : ''}
              </span>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod, modIdx) => {
                const isModActive = mod.module_id === activeModuleId;

                return (
                  <div key={mod.module_id} className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-950/40">
                    <div className="px-3.5 py-2.5 bg-slate-900/80 border-b border-slate-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-5 w-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                          {modIdx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-200 truncate" title={mod.title}>
                          {mod.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>

                    <div className="p-1.5 space-y-1">
                      {mod.lessons.map((les, lesIdx) => {
                        const isLesActive = mod.module_id === activeModuleId && les.lesson_id === activeLessonId;

                        return (
                          <button
                            key={les.lesson_id}
                            onClick={() => onSelectLesson(mod.module_id, les.lesson_id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between gap-2 ${
                              isLesActive
                                ? 'bg-brand-600 text-white font-medium shadow-sm shadow-brand-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="opacity-70 font-mono text-[10px]">{modIdx + 1}.{lesIdx + 1}</span>
                              <span className="truncate">{les.title}</span>
                            </div>
                            <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${isLesActive ? 'translate-x-0.5 text-white' : 'opacity-40'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Panel: Active Lesson Content */}
        <main className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <div className="space-y-6">
              
              {/* Lesson Overview Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-400 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Module: {currentModule.title}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {currentLesson.title}
                </h2>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200">Executive Summary: </span>
                  {currentLesson.summary}
                </div>
              </div>

              {/* Key Takeaways Card */}
              {currentLesson.key_takeaways && currentLesson.key_takeaways.length > 0 && (
                <div className="rounded-2xl border border-brand-500/20 bg-brand-950/20 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-300 mb-3">
                    <Key className="h-4 w-4 text-accent-cyan" />
                    <span>Core Learning Milestones</span>
                  </div>
                  <ul className="space-y-2">
                    {currentLesson.key_takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent-cyan shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Markdown Content Reader */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md markdown-body shadow-lg">
                <ReactMarkdown>
                  {currentLesson.content_markdown}
                </ReactMarkdown>
              </div>

              {/* Concept Dependency Graph */}
              {currentModule.concept_nodes && currentModule.concept_nodes.length > 0 && (
                <ConceptGraph nodes={currentModule.concept_nodes} />
              )}

              {/* Interactive Quiz Assessment */}
              {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                <QuizWidget 
                  questions={currentLesson.quiz} 
                  lessonTitle={currentLesson.title}
                  onAskTutor={onAskTutor}
                />
              )}

              {/* Paging / Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {prevLesson ? (
                  <button
                    onClick={() => onSelectLesson(prevLesson.moduleId, prevLesson.lesson.lesson_id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="truncate max-w-[150px]">Prev: {prevLesson.lesson.title}</span>
                  </button>
                ) : (
                  <div />
                )}

                {nextLesson && (
                  <button
                    onClick={() => onSelectLesson(nextLesson.moduleId, nextLesson.lesson.lesson_id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-md shadow-brand-600/20"
                  >
                    <span className="truncate max-w-[150px]">Next: {nextLesson.lesson.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40 text-brand-400" />
              <p>Select a lesson from the curriculum sidebar to start reading.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
