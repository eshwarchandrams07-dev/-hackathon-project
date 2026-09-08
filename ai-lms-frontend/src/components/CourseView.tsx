import React, { useState } from 'react';
import { Course, Module, Lesson, QuizQuestion } from '../types';
import ReactMarkdown from 'react-markdown';
import { ConceptGraph } from './ConceptGraph';
import { QuizWidget } from './QuizWidget';
import { apiService } from '../services/api';
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
  onAnswerSubmit?: (question: QuizQuestion, selectedAnswer: string, isCorrect: boolean) => void;
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
  onAnswerSubmit,
}) => {
  const [internalQuizOpen, setInternalQuizOpen] = useState(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in text-[#243B53]">
        
        {/* Course Banner */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF] text-xs font-mono font-bold">
              Curriculum Overview
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102A43]">
            {course.course_title}
          </h1>

          <p className="text-sm text-[#243B53]/90 leading-relaxed max-w-3xl">
            {course.overview}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#D9E2EC]">
            <div className="flex items-center gap-3 text-xs font-mono text-[#627D98]">
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Learning</span>
              </button>
            )}
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#627D98] uppercase tracking-wider">
            Syllabus Modules & Topics
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {course.modules.map((mod, modIdx) => (
              <div
                key={mod.module_id}
                className="rounded-xl border border-[#D9E2EC] bg-white p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-5 w-5 rounded bg-[#F0F4F8] text-[#102A43] flex items-center justify-center font-mono text-[10px] font-bold border border-[#D9E2EC]">
                        {modIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[#102A43]">
                        {mod.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#627D98] leading-relaxed pl-7">
                      {mod.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#627D98] shrink-0">
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                {/* Lessons in this module */}
                <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#D9E2EC]">
                  {mod.lessons.map((les, lesIdx) => (
                    <button
                      key={les.lesson_id}
                      onClick={() => onSelectLesson(mod.module_id, les.lesson_id)}
                      className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-white border border-[#D9E2EC] hover:border-[#00A3BF]/40 text-left transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-[10px] font-mono text-[#627D98] group-hover:text-[#00A3BF]">
                          {modIdx + 1}.{lesIdx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#102A43] truncate">
                          {les.title}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#829AB1] group-hover:text-[#00A3BF] shrink-0" />
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

  const currentLessonQuiz = (currentLesson?.quiz && currentLesson.quiz.length > 0)
    ? currentLesson.quiz
    : (currentLesson ? apiService.generateFallbackQuizQuestions(currentLesson.title) : []);

  const hasQuiz = currentLessonQuiz.length > 0;

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
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D9E2EC]">
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 text-[11px] text-[#627D98] font-mono font-medium">
                  <span className="text-[#00A3BF] font-semibold">{currentModule.title}</span>
                  <span>•</span>
                  <span>Lesson {currentIndex + 1} of {allLessonsFlat.length}</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#102A43] truncate">
                  {currentLesson.title}
                </h1>
              </div>

              {/* Quick-Access Quiz Button in Header */}
              {hasQuiz && (
                <button
                  onClick={toggleQuiz}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition shadow-xs shrink-0 cursor-pointer ${
                    isQuizOpen
                      ? 'bg-[#E6F8FB] border-[#00A3BF]/40 text-[#00A3BF]'
                      : 'bg-white border-[#D9E2EC] text-[#243B53] hover:border-[#00A3BF]/40'
                  }`}
                  title={isQuizOpen ? 'Hide Right-Side Quiz' : 'Open Right-Side Quiz'}
                >
                  <HelpCircle className="h-4 w-4 text-[#00A3BF]" />
                  <span>Quiz ({currentLessonQuiz.length} Qs)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00A3BF]/15 text-[#00A3BF] font-mono font-bold">
                    {isQuizOpen ? 'Active' : 'Show'}
                  </span>
                </button>
              )}
            </div>

            {/* Executive Summary Callout */}
            <div className="p-4 rounded-xl bg-white border border-[#D9E2EC] text-xs text-[#243B53] leading-relaxed shadow-xs">
              <span className="font-bold text-[#00A3BF]">Core Focus: </span>
              {currentLesson.summary}
            </div>

            {/* Key Takeaways */}
            {currentLesson.key_takeaways && currentLesson.key_takeaways.length > 0 && (
              <div className="p-4 rounded-xl border border-[#D9E2EC] bg-white space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                  <Key className="h-3.5 w-3.5 text-[#00A3BF]" />
                  <span>Key Learning Milestones</span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {currentLesson.key_takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#243B53] leading-relaxed">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00A3BF] shrink-0 mt-0.5" />
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
              <div className="p-4 rounded-xl border border-[#7B61FF]/30 bg-[#F3F0FF] flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-[#7B61FF] shrink-0" />
                  <p className="text-xs text-[#243B53] font-medium">
                    Ready to test your understanding? A practice quiz with {currentLessonQuiz.length} questions is ready on the side.
                  </p>
                </div>
                <button
                  onClick={toggleQuiz}
                  className="px-3.5 py-1.5 rounded-lg bg-[#7B61FF] hover:bg-[#6348EE] text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                >
                  Open Quiz Section →
                </button>
              </div>
            )}

            {/* Bottom Pagination Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-[#D9E2EC]">
              {prevLesson ? (
                <button
                  onClick={() => onSelectLesson(prevLesson.moduleId, prevLesson.lesson.lesson_id)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D9E2EC] bg-white hover:bg-[#F0F4F8] text-[#243B53] text-xs font-semibold transition cursor-pointer"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-bold transition shadow-sm cursor-pointer"
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
                <div className="rounded-2xl border border-[#D9E2EC] bg-white shadow-xl p-5 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#E6F8FB] border border-[#00A3BF]/30 flex items-center justify-center text-[#00A3BF] shrink-0">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#102A43]">Lesson Assessment</h3>
                        <p className="text-[11px] text-[#627D98]">Knowledge check & practice</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0F4F8] text-[#102A43] border border-[#D9E2EC]">
                        {currentLessonQuiz.length} Qs
                      </span>
                      <button
                        onClick={toggleQuiz}
                        className="p-1 rounded-lg text-[#829AB1] hover:text-[#102A43] hover:bg-[#F0F4F8] transition cursor-pointer"
                        title="Collapse Quiz Panel"
                      >
                        <PanelRightClose className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <QuizWidget 
                    key={`${currentLesson.lesson_id}-${currentLesson.title}`}
                    questions={currentLessonQuiz} 
                    lessonTitle={currentLesson.title}
                    lessonContent={currentLesson.content_markdown}
                    onAskTutor={onAskTutor}
                    onAnswerSubmit={onAnswerSubmit}
                  />
                </div>
              ) : (
                <button
                  onClick={toggleQuiz}
                  className="hidden lg:flex flex-col items-center gap-2 p-3 rounded-xl border border-[#D9E2EC] bg-white hover:bg-[#F8FAFC] text-[#627D98] hover:text-[#102A43] transition shadow-md group cursor-pointer"
                  title="Expand Quiz Assessment Section"
                >
                  <HelpCircle className="h-5 w-5 text-[#00A3BF] group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold [writing-mode:vertical-lr] rotate-180 tracking-wider uppercase text-[#627D98] group-hover:text-[#102A43] py-2">
                    Quiz ({currentLessonQuiz.length})
                  </span>
                  <PanelRightOpen className="h-3.5 w-3.5 text-[#829AB1] group-hover:text-[#102A43]" />
                </button>
              )}
            </aside>
          )}

        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[#D9E2EC] bg-white text-[#627D98]">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-[#00A3BF]" />
          <p className="text-xs font-medium">Select a lesson from the syllabus sidebar to begin reading.</p>
        </div>
      )}

    </div>
  );
};

