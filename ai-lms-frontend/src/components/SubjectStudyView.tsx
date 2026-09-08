import React, { useState, useEffect } from 'react';
import { Course, Subject, SubjectMaterial, QuizQuestion, QuizAttempt, ChatMessage } from '../types';
import { CourseView } from './CourseView';
import { SocraticChat } from './SocraticChat';
import { apiService } from '../services/api';
import { subjectService } from '../services/subjectService';
import { 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface SubjectStudyViewProps {
  subject: Subject;
  material: SubjectMaterial;
  course: Course;
  onBackToSubject: () => void;
  onRecordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  onUpdateProgress?: (subjectId: string, percent: number) => void;
  isBackendOnline: boolean;
  activeModuleId?: string;
  activeLessonId?: string;
  onSelectLesson?: (moduleId: string, lessonId: string) => void;
  onLessonOpened?: (subjectId: string, lessonId: string) => void;
}

export const SubjectStudyView: React.FC<SubjectStudyViewProps> = ({
  subject,
  material,
  course,
  onBackToSubject,
  onRecordQuizAttempt,
  onUpdateProgress,
  isBackendOnline,
  activeModuleId: propModuleId,
  activeLessonId: propLessonId,
  onSelectLesson: propOnSelectLesson,
  onLessonOpened
}) => {
  const [internalModuleId, setInternalModuleId] = useState<string>(
    propModuleId || course.modules?.[0]?.module_id || ''
  );
  const [internalLessonId, setInternalLessonId] = useState<string>(
    propLessonId || course.modules?.[0]?.lessons?.[0]?.lesson_id || ''
  );

  useEffect(() => {
    if (propModuleId) setInternalModuleId(propModuleId);
    if (propLessonId) setInternalLessonId(propLessonId);
  }, [propModuleId, propLessonId]);

  const activeModuleId = propModuleId || internalModuleId;
  const activeLessonId = propLessonId || internalLessonId;

  // Track lesson slide opening automatically
  useEffect(() => {
    if (activeLessonId && subject?.id) {
      onLessonOpened?.(subject.id, activeLessonId);
    }
  }, [activeLessonId, subject?.id, onLessonOpened]);
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(true); // Open by default for in-subject AI tutoring!
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false); // Quiz will NOT pop up unless pressed by user!
  const [studyMode, setStudyMode] = useState<'deep' | 'quick' | 'prompt'>('prompt');

  const sessionId = `course_${course.course_title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const getInitialWelcome = (subName: string, fName: string): ChatMessage => ({
    id: `intro-${Date.now()}`,
    role: 'assistant',
    content: `Hello! I am your AI Socratic Tutor for **${subName}** (*${fName}*). All concepts from your uploaded slides have been indexed.\n\n**Please choose your study mode to begin:**\n\n1️⃣ **Option 1: Deep Study** — Thorough step-by-step guidance to deeply understand the concept, underlying mechanics, real-world analogies, and answer probing Socratic questions.\n\n2️⃣ **Option 2: Quick Run** — Fast-paced high-yield review focusing on core exam topics, structured **Mind Maps**, cheat-sheet summaries, and key definitions.\n\n*Click an option button below or type \`1\` or \`2\` to get started!*`,
    timestamp: Date.now(),
    citations: [1]
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = apiService.loadLocalChatHistory(sessionId);
    if (saved && saved.length > 0) return saved;
    return [getInitialWelcome(subject.name, material.fileName)];
  });
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const saved = apiService.loadLocalChatHistory(sessionId);
    if (saved && saved.length > 0) {
      setChatMessages(saved);
    } else {
      setChatMessages([getInitialWelcome(subject.name, material.fileName)]);
    }
  }, [sessionId, subject.name, material.fileName]);

  const currentModule = course.modules.find(m => m.module_id === activeModuleId) || course.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setInternalModuleId(moduleId);
    setInternalLessonId(lessonId);
    if (propOnSelectLesson) {
      propOnSelectLesson(moduleId, lessonId);
    }
    setIsOverviewActive(false);
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Detect if student selected option 1 (Deep study) or option 2 (Quick run)
    const trimmed = userMessage.trim().toLowerCase();
    let currentActiveMode = studyMode;
    if (trimmed === '1' || trimmed === '1.' || trimmed === 'option 1' || trimmed.includes('deep study')) {
      currentActiveMode = 'deep';
      setStudyMode('deep');
    } else if (trimmed === '2' || trimmed === '2.' || trimmed === 'option 2' || trimmed.includes('quick run') || trimmed.includes('mind map')) {
      currentActiveMode = 'quick';
      setStudyMode('quick');
    }

    const userMsgObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      lessonId: activeLessonId || undefined,
      sessionId: sessionId
    };

    const updatedWithUser = [...chatMessages, userMsgObj];
    setChatMessages(updatedWithUser);
    apiService.saveLocalChatHistory(updatedWithUser, sessionId);
    setIsThinking(true);

    try {
      const modeDirective = currentActiveMode === 'quick'
        ? `\nActive Study Mode: QUICK RUN (Focus on main exam topics, structured visual Mind Maps with ASCII tree branches, cheat-sheet definitions, and high-yield takeaways).`
        : currentActiveMode === 'deep'
        ? `\nActive Study Mode: DEEP STUDY (Help the student thoroughly understand every concept from first principles, step-by-step mechanics, real-world analogies, and Socratic reflection).`
        : `\nActive Study Mode: Ask student to choose Option 1: Deep Study or Option 2: Quick Run if not yet selected.`;

      const lessonContext = currentLesson
        ? `Subject: ${subject.name}\nPDF: ${material.fileName}\nCourse: ${course.course_title}\nModule: ${currentModule?.title}\nLesson: ${currentLesson.title}\n${modeDirective}\n\nSummary:\n${currentLesson.summary}\n\nContent:\n${currentLesson.content_markdown}`
        : `${course.overview}\n${modeDirective}`;

      const historyPayload = chatMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await apiService.sendChat({
        lesson_context: lessonContext,
        user_message: userMessage,
        history: historyPayload,
        session_id: sessionId,
        lesson_id: activeLessonId || undefined
      });

      const tutorReply: ChatMessage = {
        id: response.message_id || `tutor-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: response.timestamp || Date.now(),
        citations: response.citations,
        lessonId: activeLessonId || undefined,
        sessionId: sessionId
      };

      const finalMessages = [...updatedWithUser, tutorReply];
      setChatMessages(finalMessages);
      apiService.saveLocalChatHistory(finalMessages, sessionId);
    } catch (err) {
      console.warn('Backend chat failed, using local Socratic fallback:', err);
      const fallbackReplyText = apiService.generateFallbackSocraticReply(userMessage, currentLesson?.title, currentActiveMode);
      const fallbackReply: ChatMessage = {
        id: `tutor-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackReplyText,
        timestamp: Date.now(),
        lessonId: activeLessonId || undefined,
        sessionId: sessionId
      };
      const finalMessages = [...updatedWithUser, fallbackReply];
      setChatMessages(finalMessages);
      apiService.saveLocalChatHistory(finalMessages, sessionId);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAskTutorPrompt = (prompt: string) => {
    setIsTutorOpen(true);
    handleSendMessage(prompt);
  };

  // When student answers a quiz question inside this subject, record attempt for Skill Analytics
  const handleQuizAnswerSubmit = (q: QuizQuestion, selectedAnswer: string, isCorrect: boolean) => {
    onRecordQuizAttempt({
      subjectId: subject.id,
      courseTitle: course.course_title,
      lessonId: currentLesson?.lesson_id || 'general',
      lessonTitle: currentLesson?.title || 'Lesson Assessment',
      questionId: q.id,
      questionText: q.question,
      selectedAnswer,
      correctAnswer: q.correct_answer,
      isCorrect,
      topicOrConcept: currentLesson?.title || subject.name,
      difficulty: q.difficulty || 'Medium'
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F4F8] text-[#243B53] overflow-hidden">
      
      {/* 1. Sub-Header with Navigation Breadcrumbs & Controls */}
      <div className="h-14 border-b border-[#D9E2EC] bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-10 shadow-xs">
        
        {/* Back button & Subject Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToSubject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#243B53] text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Subjects</span>
          </button>

          <span className="text-[#D9E2EC] hidden sm:inline">|</span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-[#00A3BF] shrink-0">
              {subject.name}
            </span>
            <span className="text-[#829AB1]">/</span>
            <span className="text-xs font-bold text-[#102A43] truncate max-w-xs sm:max-w-md">
              {material.fileName}
            </span>
          </div>
        </div>

        {/* Right Toggle Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Real-time Blended Progress Display */}
          {(() => {
            const stats = subjectService.getSubjectLessonStats(subject);
            return (
              <div 
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F0F4F8] border border-[#D9E2EC]"
                title={`Blended Progress: Slides (70% weight) = ${stats.openedLessonsCount}/${stats.totalLessons} (${stats.slideProgressPercent}%) + Smart Assessment (30% weight) = ${stats.assessmentScore}%`}
              >
                <div className="w-16 h-1.5 rounded-full bg-[#D9E2EC] overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${stats.progressPercent === 100 ? 'bg-emerald-500' : 'bg-[#00A3BF]'}`}
                    style={{ width: `${stats.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#102A43]">{stats.progressPercent}%</span>
                <span className="text-[10px] font-mono text-[#627D98]">
                  ({stats.openedLessonsCount}/{stats.totalLessons} slides • quiz: {stats.assessmentScore}%)
                </span>
              </div>
            );
          })()}

          {onUpdateProgress && (
            <button
              onClick={() => onUpdateProgress(subject.id, (subject.progressPercent || 0) === 100 ? 0 : 100)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                (subject.progressPercent || 0) === 100 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs' 
                  : 'bg-[#00A3BF] hover:bg-[#008CA4] text-white border-[#00A3BF]'
              }`}
              title="Toggle 100% completion for this subject"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{(subject.progressPercent || 0) === 100 ? '100% Done' : 'Mark 100%'}</span>
            </button>
          )}

          <button
            onClick={() => setIsQuizOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isQuizOpen 
                ? 'bg-[#E6F8FB] border-[#00A3BF]/40 text-[#00A3BF]' 
                : 'bg-white border-[#D9E2EC] text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quiz Column</span>
          </button>

          <button
            onClick={() => setIsTutorOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              isTutorOpen 
                ? 'bg-[#F3F0FF] border-[#7B61FF]/40 text-[#7B61FF] shadow-xs' 
                : 'bg-white border-[#D9E2EC] text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#7B61FF]" />
            <span>Socratic AI Tutor</span>
          </button>
        </div>

      </div>

      {/* 2. Main Workspace: Lesson Reader + In-Context Quiz + In-Context Socratic Tutor */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        
        {/* Center / Main Lesson Content & Embedded Quiz */}
        <main className="flex-1 overflow-y-auto">
          <CourseView
            course={course}
            activeModuleId={activeModuleId}
            activeLessonId={activeLessonId}
            isOverviewActive={isOverviewActive}
            onSelectLesson={handleSelectLesson}
            onAskTutor={handleAskTutorPrompt}
            isQuizOpen={isQuizOpen}
            onToggleQuiz={() => setIsQuizOpen(prev => !prev)}
            onAnswerSubmit={handleQuizAnswerSubmit}
          />
        </main>

        {/* Right In-Context Socratic Tutor (Directly grounded in this subject's PDF) */}
        {isTutorOpen && (
          <aside className="w-96 lg:w-[420px] h-full shrink-0 border-l border-[#D9E2EC] bg-white flex flex-col z-20 animate-fade-in shadow-xl">
            <SocraticChat
              activeLesson={currentLesson || null}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isThinking={isThinking}
              studyMode={studyMode}
              onSelectStudyMode={(mode) => setStudyMode(mode)}
              onResetChat={async () => {
                const welcomeMsg = getInitialWelcome(subject.name, material.fileName);
                setChatMessages([welcomeMsg]);
                setStudyMode('prompt');
                apiService.saveLocalChatHistory([welcomeMsg], sessionId);
              }}
              onClose={() => setIsTutorOpen(false)}
              courseTitle={`${subject.name}: ${course.course_title}`}
              isBackendOnline={isBackendOnline}
            />
          </aside>
        )}

      </div>

    </div>
  );
};
