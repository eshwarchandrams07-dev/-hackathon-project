import React, { useState } from 'react';
import { Course, Lesson, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { SocraticChat } from './SocraticChat';
import { ConceptGraph } from './ConceptGraph';
import { QuizWidget } from './QuizWidget';
import { 
  BookOpen, 
  Bot, 
  ChevronRight, 
  ChevronLeft,
  Layers, 
  Key, 
  CheckCircle2, 
  HelpCircle,
  Network
} from 'lucide-react';

interface SplitScreenViewProps {
  course: Course;
  activeModuleId: string;
  activeLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isThinking: boolean;
  onResetChat?: () => void;
  onExportChat?: () => void;
}

type ReaderTab = 'content' | 'concepts' | 'quiz';

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  onSelectLesson,
  chatMessages,
  onSendMessage,
  isThinking,
  onResetChat,
  onExportChat,
}) => {
  const [mobileActivePane, setMobileActivePane] = useState<'content' | 'tutor'>('content');
  const [splitRatio, setSplitRatio] = useState<'balanced' | 'focus-content' | 'focus-tutor'>('balanced');
  const [readerTab, setReaderTab] = useState<ReaderTab>('content');

  const currentModule = course.modules.find(m => m.module_id === activeModuleId) || course.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  // Flatten lessons for clean indexing and navigation
  const allLessons: Array<{ moduleId: string; moduleTitle: string; lesson: Lesson }> = [];
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      allLessons.push({ moduleId: m.module_id, moduleTitle: m.title, lesson: l });
    });
  });

  const currentIndex = allLessons.findIndex(
    item => item.moduleId === activeModuleId && item.lesson.lesson_id === activeLessonId
  );
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 flex flex-col h-[calc(100vh-4.25rem)]">
      
      {/* Top Split-Screen Navigation & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-3 border-b border-slate-800/80 shrink-0">
        
        {/* Breadcrumb & Lesson Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Layers className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-slate-300 font-medium hidden sm:inline truncate max-w-[180px]">
              {course.course_title}
            </span>
            <ChevronRight className="h-3 w-3 text-slate-600 hidden sm:inline" />
          </div>

          {/* Quick Lesson Dropdown */}
          <div className="relative">
            <select
              value={`${activeModuleId}:::${activeLessonId}`}
              onChange={(e) => {
                const [modId, lesId] = e.target.value.split(':::');
                onSelectLesson(modId, lesId);
              }}
              className="bg-[#0f1523] text-xs font-medium text-slate-200 border border-slate-800/90 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer max-w-[220px] sm:max-w-[320px] truncate"
            >
              {course.modules.map((mod) => (
                <optgroup key={mod.module_id} label={mod.title}>
                  {mod.lessons.map((les) => (
                    <option key={les.lesson_id} value={`${mod.module_id}:::${les.lesson_id}`}>
                      {les.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Prev / Next Shortcuts */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => prevLesson && onSelectLesson(prevLesson.moduleId, prevLesson.lesson.lesson_id)}
              disabled={!prevLesson}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title={prevLesson ? `Previous: ${prevLesson.lesson.title}` : 'No previous lesson'}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono text-slate-500">
              {currentIndex + 1}/{allLessons.length}
            </span>
            <button
              onClick={() => nextLesson && onSelectLesson(nextLesson.moduleId, nextLesson.lesson.lesson_id)}
              disabled={!nextLesson}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title={nextLesson ? `Next: ${nextLesson.lesson.title}` : 'No next lesson'}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode & Split Balance Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 border border-slate-800/90 rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setSplitRatio('focus-content')}
              className={`px-2 py-1 rounded-md transition ${
                splitRatio === 'focus-content' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'
              }`}
            >
              65% Lesson
            </button>
            <button
              onClick={() => setSplitRatio('balanced')}
              className={`px-2 py-1 rounded-md transition ${
                splitRatio === 'balanced' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'
              }`}
            >
              50 / 50
            </button>
            <button
              onClick={() => setSplitRatio('focus-tutor')}
              className={`px-2 py-1 rounded-md transition ${
                splitRatio === 'focus-tutor' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'
              }`}
            >
              65% Tutor
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden w-full items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setMobileActivePane('content')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
              mobileActivePane === 'content'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Lesson Reader</span>
          </button>
          <button
            onClick={() => setMobileActivePane('tutor')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition ${
              mobileActivePane === 'tutor'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Socratic Tutor</span>
          </button>
        </div>

      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Pane: Interactive Lesson Reader */}
        <div
          className={`h-full flex flex-col rounded-2xl border border-slate-800/90 bg-[#0f1523]/80 overflow-hidden shadow-sm transition-all ${
            mobileActivePane === 'content' ? 'block' : 'hidden lg:flex'
          } ${
            splitRatio === 'focus-content'
              ? 'lg:col-span-8'
              : splitRatio === 'focus-tutor'
              ? 'lg:col-span-5'
              : 'lg:col-span-6'
          }`}
        >
          {/* Reader Sub-Tabs */}
          <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800/80 text-xs">
              <button
                onClick={() => setReaderTab('content')}
                className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                  readerTab === 'content' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Lesson</span>
              </button>
              <button
                onClick={() => setReaderTab('concepts')}
                className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                  readerTab === 'concepts' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                <span>Concepts</span>
              </button>
              <button
                onClick={() => setReaderTab('quiz')}
                className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                  readerTab === 'quiz' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Quiz ({currentLesson?.quiz?.length || 0})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline truncate max-w-[200px]">
              {currentModule?.title}
            </span>
          </div>

          {/* Reader Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {currentLesson && (
              <>
                {readerTab === 'content' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-brand-400">
                        {currentModule?.title}
                      </span>
                      <h2 className="text-xl font-semibold text-white tracking-tight">
                        {currentLesson.title}
                      </h2>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs text-slate-300 leading-relaxed">
                      <span className="font-medium text-slate-200">Key Focus: </span>
                      {currentLesson.summary}
                    </div>

                    {currentLesson.key_takeaways && currentLesson.key_takeaways.length > 0 && (
                      <div className="p-3.5 rounded-xl border border-slate-800/70 bg-slate-900/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                          <Key className="h-3.5 w-3.5 text-brand-400" />
                          <span>Core Takeaways</span>
                        </div>
                        <ul className="space-y-1">
                          {currentLesson.key_takeaways.map((takeaway, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="markdown-body pt-2">
                      <ReactMarkdown>
                        {currentLesson.content_markdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {readerTab === 'concepts' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white">
                        Concept Dependency Graph
                      </h3>
                      <p className="text-xs text-slate-400">
                        Prerequisites and concept relationships derived from your course text.
                      </p>
                    </div>
                    {currentModule?.concept_nodes && currentModule.concept_nodes.length > 0 ? (
                      <ConceptGraph nodes={currentModule.concept_nodes} />
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No prerequisite graph nodes extracted for this module.
                      </p>
                    )}
                  </div>
                )}

                {readerTab === 'quiz' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-white">
                        Concept Mastery Assessment
                      </h3>
                      <p className="text-xs text-slate-400">
                        Answer these multiple-choice checks to test your understanding.
                      </p>
                    </div>
                    {currentLesson.quiz && currentLesson.quiz.length > 0 ? (
                      <QuizWidget
                        questions={currentLesson.quiz}
                        lessonTitle={currentLesson.title}
                        lessonContent={currentLesson.content_markdown}
                        onAskTutor={(prompt) => {
                          onSendMessage(prompt);
                          setMobileActivePane('tutor');
                        }}
                      />
                    ) : (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No quiz questions generated for this section.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane: Split-Screen Socratic AI Tutor */}
        <div
          className={`h-full min-h-0 flex flex-col transition-all ${
            mobileActivePane === 'tutor' ? 'block' : 'hidden lg:block'
          } ${
            splitRatio === 'focus-content'
              ? 'lg:col-span-4'
              : splitRatio === 'focus-tutor'
              ? 'lg:col-span-7'
              : 'lg:col-span-6'
          }`}
        >
          <SocraticChat
            activeLesson={currentLesson}
            messages={chatMessages}
            onSendMessage={onSendMessage}
            isThinking={isThinking}
            onResetChat={onResetChat}
            onExportChat={onExportChat}
            courseTitle={course.course_title}
          />
        </div>

      </div>
    </div>
  );
};
