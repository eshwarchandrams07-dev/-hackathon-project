import React from 'react';
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
  Play
} from 'lucide-react';

interface CourseViewProps {
  course: Course;
  activeModuleId: string;
  activeLessonId: string;
  isOverviewActive: boolean;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  onAskTutor: (prompt: string) => void;
}

export const CourseView: React.FC<CourseViewProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  isOverviewActive,
  onSelectLesson,
  onAskTutor,
}) => {
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

  // View Mode 2: Focused Lesson Reader Canvas
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {currentLesson ? (
        <div className="space-y-6">
          
          {/* Lesson Header */}
          <div className="space-y-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="text-brand-400">{currentModule.title}</span>
              <span>•</span>
              <span>Lesson {currentIndex + 1} of {allLessonsFlat.length}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {currentLesson.title}
            </h1>
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

          {/* Interactive Quiz Assessment */}
          {currentLesson.quiz && currentLesson.quiz.length > 0 && (
            <div className="pt-2">
              <QuizWidget 
                questions={currentLesson.quiz} 
                lessonTitle={currentLesson.title}
                lessonContent={currentLesson.content_markdown}
                onAskTutor={onAskTutor}
              />
            </div>
          )}

          {/* Bottom Pagination Bar */}
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
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800/80 bg-[#0f1523]/60 text-slate-400">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40 text-brand-400" />
          <p className="text-xs">Select a lesson from the syllabus sidebar to begin reading.</p>
        </div>
      )}

    </div>
  );
};
