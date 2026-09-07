import React, { useState } from 'react';
import { Course, Lesson, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { SocraticChat } from './SocraticChat';
import { ConceptGraph } from './ConceptGraph';
import { QuizWidget } from './QuizWidget';
import { 
  BookOpen, 
  Bot, 
  Columns, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Key, 
  CheckCircle2, 
  Maximize2,
  Minimize2
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
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  course,
  activeModuleId,
  activeLessonId,
  onSelectLesson,
  chatMessages,
  onSendMessage,
  isThinking,
  onResetChat,
}) => {
  const [mobileActivePane, setMobileActivePane] = useState<'content' | 'tutor'>('content');
  const [splitRatio, setSplitRatio] = useState<'balanced' | 'focus-content' | 'focus-tutor'>('balanced');

  const currentModule = course.modules.find(m => m.module_id === activeModuleId) || course.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 flex flex-col h-[calc(100vh-4.5rem)]">
      
      {/* Top Split-Screen Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 shrink-0">
        
        {/* Active Lesson / Module Breadcrumb & Picker */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 shrink-0">
            <Layers className="h-3.5 w-3.5 text-brand-400" />
            <span className="font-semibold text-white">{course.course_title}</span>
          </div>

          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          {/* Quick Lesson Selector dropdown or buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {course.modules.flatMap(mod => 
              mod.lessons.map(les => {
                const isActive = mod.module_id === activeModuleId && les.lesson_id === activeLessonId;
                return (
                  <button
                    key={les.lesson_id}
                    onClick={() => {
                      onSelectLesson(mod.module_id, les.lesson_id);
                      setMobileActivePane('content');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-brand-600 text-white font-medium shadow-sm shadow-brand-500/20'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>{les.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* View Mode & Split Balance Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Ratio:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
            <button
              onClick={() => setSplitRatio('focus-content')}
              className={`px-2 py-1 rounded transition ${splitRatio === 'focus-content' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'}`}
              title="Expand Lesson Pane"
            >
              65% Lesson
            </button>
            <button
              onClick={() => setSplitRatio('balanced')}
              className={`px-2 py-1 rounded transition ${splitRatio === 'balanced' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'}`}
              title="Balanced 50/50 Split"
            >
              50 / 50
            </button>
            <button
              onClick={() => setSplitRatio('focus-tutor')}
              className={`px-2 py-1 rounded transition ${splitRatio === 'focus-tutor' ? 'bg-slate-800 text-white font-medium' : 'hover:text-slate-200'}`}
              title="Expand Socratic Tutor Pane"
            >
              65% Tutor
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden w-full items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMobileActivePane('content')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileActivePane === 'content'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Lesson Reader</span>
          </button>
          <button
            onClick={() => setMobileActivePane('tutor')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileActivePane === 'tutor'
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Socratic Tutor</span>
          </button>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left Pane: Interactive Lesson Reader */}
        <div
          className={`h-full overflow-y-auto pr-1 sm:pr-2 space-y-5 transition-all ${
            mobileActivePane === 'content' ? 'block' : 'hidden lg:block'
          } ${
            splitRatio === 'focus-content'
              ? 'lg:col-span-8'
              : splitRatio === 'focus-tutor'
              ? 'lg:col-span-5'
              : 'lg:col-span-6'
          }`}
        >
          {currentLesson && (
            <>
              {/* Header Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-medium text-brand-400 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Module: {currentModule?.title}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{currentLesson.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  {currentLesson.summary}
                </p>
              </div>

              {/* Core Learning Milestones */}
              {currentLesson.key_takeaways && currentLesson.key_takeaways.length > 0 && (
                <div className="rounded-2xl border border-brand-500/20 bg-brand-950/20 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 mb-2">
                    <Key className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentLesson.key_takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-cyan shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Markdown Reader */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md markdown-body shadow-lg">
                <ReactMarkdown>
                  {currentLesson.content_markdown}
                </ReactMarkdown>
              </div>

              {/* Concept Dependency Graph */}
              {currentModule?.concept_nodes && currentModule.concept_nodes.length > 0 && (
                <ConceptGraph nodes={currentModule.concept_nodes} />
              )}

              {/* Self Assessment Quiz */}
              {currentLesson.quiz && currentLesson.quiz.length > 0 && (
                <QuizWidget
                  questions={currentLesson.quiz}
                  lessonTitle={currentLesson.title}
                  onAskTutor={(prompt) => {
                    onSendMessage(prompt);
                    setMobileActivePane('tutor');
                  }}
                />
              )}
            </>
          )}
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
          />
        </div>

      </div>
    </div>
  );
};
