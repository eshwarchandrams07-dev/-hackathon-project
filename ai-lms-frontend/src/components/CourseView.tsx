import React, { useState } from 'react';
import { Course, Module, Lesson } from '../types';
import ReactMarkdown from 'react-markdown';
import { ConceptGraph } from './ConceptGraph';
import { QuizWidget } from './QuizWidget';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Key, 
  ArrowLeft, 
  ArrowRight, 
  Layers,
  Sparkles,
  Compass,
  Play,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

interface CourseViewProps {
  course: Course;
  activeModuleId: string;
  activeLessonId: string;
  isOverviewActive: boolean;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onAskTutor: (prompt: string) => void;
  isQuizOpen?: boolean;
  onToggleQuiz?: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  isOverviewActive,
  onSelectLesson,
  onAskTutor,
  isQuizOpen: controlledQuizOpen,
  onToggleQuiz: controlledToggleQuiz,
}) => {
  const [internalQuizOpen, setInternalQuizOpen] = useState(true);
  const isQuizOpen = controlledQuizOpen !== undefined ? controlledQuizOpen : internalQuizOpen;
  const toggleQuiz = controlledToggleQuiz || (() => setInternalQuizOpen(prev => !prev));

  const currentModule = course.modules.find(m => m.module_id === activeModuleId) || course.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const totalConcepts = course.modules.reduce((acc, m) => acc + (m.concept_nodes?.length || 0), 0);
  const totalQuizzes = course.modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (l.quiz?.length || 0), 0), 0);

  // Flatten lessons for previous / next pagination
  const allLessonsFlat: Array<{ moduleId: string; moduleTitle: string; lesson: Lesson }> = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessonsFlat.push({ moduleId: m.module_id, moduleTitle: m.title, lesson: l });
    });
  });

  const currentIndex = allLessonsFlat.findIndex(
    item => item.moduleId === activeModuleId && item.lesson.lesson_id === activeLessonId
  );
  const prevLesson = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentIndex + 1] : null;

  // View Mode 1: Course Syllabus Overview
  if (isOverviewActive) {
    const firstLesson = allLessonsFlat[0];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Course Banner */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#0f1523]/90 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
              Curriculum Overview
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {course.course_title}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {course.overview}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>{course.modules.length} Modules</span>
              <span>•</span>
              <span>{totalLessons} Lessons</span>
              <span>•</span>
              <span>{totalConcepts} Concepts</span>
              <span>•</span>
              <span>{totalQuizzes} Practice Questions</span>
            </div>

            {firstLesson && (
              <button
                onClick={() => onSelectLesson(firstLesson.moduleId, firstLesson.lesson.lesson_id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Learning</span>
              </button>
            )}
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Syllabus Modules & Topics
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {course.modules.map((mod, modIdx) => (
              <div
                key={mod.module_id}
                className="rounded-xl border border-slate-800/80 bg-[#0f1523]/60 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-5 w-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                        {modIdx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {mod.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-7">
                      {mod.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                {/* Lessons in this module */}
                <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                  {mod.lessons.map((les, lesIdx) => (
                    <button
                      key={les.lesson_id}
                      onClick={() => onSelectLesson(mod.module_id, les.lesson_id)}
                      className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-slate-700 text-left transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-brand-300">
                          {modIdx + 1}.{lesIdx + 1}
                        </span>
                        <span className="text-xs text-slate-300 group-hover:text-white truncate">
                          {les.title}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  const hasQuiz = Boolean(currentLesson?.quiz && currentLesson.quiz.length > 0);

  // View Mode 2: Focused Lesson Reader Canvas with Dedicated Side Quiz Section
  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all ${
      hasQuiz && isQuizOpen ? 'max-w-[1400px]' : 'max-w-4xl'
    }`}>
      
      {currentLesson ? (
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Main Reading Column (Left / Center) */}
          <div className="flex-1 min-w-0 max-w-3xl space-y-6">
            
            {/* Lesson Header with Quick Quiz Access Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="text-brand-400">{currentModule.title}</span>
                  <span>•</span>
                  <span>Lesson {currentIndex + 1} of {allLessonsFlat.length}</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white truncate">
                  {currentLesson.title}
                </h1>
              </div>

              {/* Quick-Access Quiz Button in Header */}
              {hasQuiz && (
                <button
                  onClick={toggleQuiz}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition shadow-sm shrink-0 ${
                    isQuizOpen
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                  title={isQuizOpen ? 'Hide Right-Side Quiz' : 'Open Right-Side Quiz'}
                >
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  <span>Quiz ({currentLesson.quiz.length} Qs)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {isQuizOpen ? 'Active' : 'Show'}
                  </span>
                </button>
              )}
            </div>

            {/* Executive Summary Callout */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200">Core Focus: </span>
              {currentLesson.summary}
            </div>

            {/* Key Takeaways */}
            {currentLesson.key_takeaways && currentLesson.key_takeaways.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-800/70 bg-[#0f1523]/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Key className="h-3.5 w-3.5 text-brand-400" />
                  <span>Key Learning Milestones</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {currentLesson.key_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Core Markdown Content */}
            <div className="markdown-body pt-2 leading-relaxed">
              <ReactMarkdown>
                {currentLesson.content_markdown}
              </ReactMarkdown>
            </div>

            {/* Prerequisite Knowledge Graph */}
            {currentModule.concept_nodes && currentModule.concept_nodes.length > 0 && (
              <div className="pt-4">
                <ConceptGraph nodes={currentModule.concept_nodes} />
              </div>
            )}

            {/* Prompt to take quiz if closed */}
            {hasQuiz && !isQuizOpen && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    Ready to test your understanding? A practice quiz with {currentLesson.quiz.length} questions is ready on the side.
                  </p>
                </div>
                <button
                  onClick={toggleQuiz}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition shrink-0"
                >
                  Open Quiz Section →
                </button>
              </div>
            )}

            {/* Bottom Pagination Bar (Quiz has been removed from bottom!) */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
              {prevLesson ? (
                <button
                  onClick={() => onSelectLesson(prevLesson.moduleId, prevLesson.lesson.lesson_id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[180px]">Prev: {prevLesson.lesson.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextLesson && (
                <button
                  onClick={() => onSelectLesson(nextLesson.moduleId, nextLesson.lesson.lesson_id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm"
                >
                  <span className="truncate max-w-[180px]">Next: {nextLesson.lesson.title}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Dedicated Interactive Quiz Assessment (Right-Side Panel) */}
          {hasQuiz && (
            <aside className={`shrink-0 transition-all duration-300 ${
              isQuizOpen 
                ? 'w-full lg:w-[420px] xl:w-[460px] sticky top-4 self-start' 
                : 'hidden lg:block w-auto sticky top-4 self-start'
            }`}>
              {isQuizOpen ? (
                <div className="rounded-2xl border border-slate-800/90 bg-[#0d121f]/95 shadow-2xl p-5 backdrop-blur-md space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Lesson Assessment</h3>
                        <p className="text-[11px] text-slate-400">Knowledge check & practice</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                        {currentLesson.quiz.length} Qs
                      </span>
                      <button
                        onClick={toggleQuiz}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Collapse Quiz Panel"
                      >
                        <PanelRightClose className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <QuizWidget 
                    questions={currentLesson.quiz} 
                    lessonTitle={currentLesson.title}
                    lessonContent={currentLesson.content_markdown}
                    onAskTutor={onAskTutor}
                  />
                </div>
              ) : (
                <button
                  onClick={toggleQuiz}
                  className="hidden lg:flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-lg group"
                  title="Expand Quiz Assessment Section"
                >
                  <HelpCircle className="h-5 w-5 text-amber-400 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-medium [writing-mode:vertical-lr] rotate-180 tracking-wider uppercase text-slate-400 group-hover:text-white py-2">
                    Quiz ({currentLesson.quiz.length})
                  </span>
                  <PanelRightOpen className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
                </button>
              )}
            </aside>
          )}

        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800/80 bg-[#0f1523]/60 text-slate-400">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-brand-400" />
          <p className="text-xs">Select a lesson from the syllabus sidebar to begin reading.</p>
        </div>
      )}

    </div>
  );
};

