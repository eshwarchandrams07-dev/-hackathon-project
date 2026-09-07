import React, { useState, useEffect, useCallback } from 'react';
import { Course, ViewTab, ChatMessage } from './types';
import { SAMPLE_COURSE, INITIAL_SOCRATIC_MESSAGES } from './services/mockData';
import { apiService } from './services/api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CourseView } from './components/CourseView';
import { SplitScreenView } from './components/SplitScreenView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [activeCourse, setActiveCourse] = useState<Course>(SAMPLE_COURSE);
  const [activeModuleId, setActiveModuleId] = useState<string>(SAMPLE_COURSE.modules[0]?.module_id || '');
  const [activeLessonId, setActiveLessonId] = useState<string>(SAMPLE_COURSE.modules[0]?.lessons[0]?.lesson_id || '');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_SOCRATIC_MESSAGES);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);

  // Check FastAPI backend health on initial mount
  const verifyBackendHealth = useCallback(async () => {
    const online = await apiService.checkHealth();
    setIsBackendOnline(online);
  }, []);

  useEffect(() => {
    verifyBackendHealth();
    const interval = setInterval(verifyBackendHealth, 15000);
    return () => clearInterval(interval);
  }, [verifyBackendHealth]);

  // When a new course is synthesized via upload
  const handleCourseGenerated = (course: Course) => {
    setActiveCourse(course);
    if (course.modules && course.modules.length > 0) {
      const firstMod = course.modules[0];
      setActiveModuleId(firstMod.module_id);
      if (firstMod.lessons && firstMod.lessons.length > 0) {
        setActiveLessonId(firstMod.lessons[0].lesson_id);
      }
    }
    // Automatically transition to split tutor to experience the synthesized curriculum
    setCurrentTab('split-tutor');

    // Add introductory message from Socratic tutor for the newly generated course
    setChatMessages([
      {
        id: `intro-${Date.now()}`,
        role: 'assistant',
        content: `Welcome to **${course.course_title}**! I have ingested the textbook content into our vector database and analyzed the core principles. Feel free to explore the lessons on the left, and ask me any questions whenever you'd like conceptual guidance!`,
        timestamp: Date.now(),
        citations: [1]
      }
    ]);
  };

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
  };

  // Get active lesson
  const currentModule = activeCourse?.modules.find(m => m.module_id === activeModuleId) || activeCourse?.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  // Send message to Socratic Tutor
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsgObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMsgObj]);
    setIsThinking(true);

    try {
      // Build context from active lesson
      const lessonContext = currentLesson
        ? `Course: ${activeCourse.course_title}\nModule: ${currentModule?.title}\nLesson: ${currentLesson.title}\n\nLesson Summary:\n${currentLesson.summary}\n\nLesson Content:\n${currentLesson.content_markdown}`
        : activeCourse.overview;

      // History formatted as required by backend schema
      const historyPayload = chatMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call FastAPI /api/chat
      const response = await apiService.sendChat({
        lesson_context: lessonContext,
        user_message: userMessage,
        history: historyPayload,
      });

      const tutorReply: ChatMessage = {
        id: `tutor-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
      };

      setChatMessages(prev => [...prev, tutorReply]);
    } catch (err) {
      console.warn('Backend chat failed, using local Socratic fallback:', err);
      // Socratic fallback so the student is never blocked
      const fallbackReplyText = apiService.generateFallbackSocraticReply(userMessage, currentLesson?.title);

      const fallbackReply: ChatMessage = {
        id: `tutor-fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackReplyText,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAskTutorPrompt = (prompt: string) => {
    setCurrentTab('split-tutor');
    handleSendMessage(prompt);
  };

  const handleResetChat = () => {
    setChatMessages(INITIAL_SOCRATIC_MESSAGES);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeCourse={activeCourse}
        onNewUploadClick={() => setCurrentTab('dashboard')}
        isBackendOnline={isBackendOnline}
        onCheckBackendHealth={verifyBackendHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {currentTab === 'dashboard' && (
          <Dashboard
            activeCourse={activeCourse}
            onCourseGenerated={handleCourseGenerated}
            onNavigateToCourse={() => setCurrentTab('course')}
            onNavigateToSplitTutor={() => setCurrentTab('split-tutor')}
            isBackendOnline={isBackendOnline}
          />
        )}

        {currentTab === 'course' && activeCourse && (
          <CourseView
            course={activeCourse}
            activeModuleId={activeModuleId}
            activeLessonId={activeLessonId}
            onSelectLesson={handleSelectLesson}
            onOpenSplitTutor={() => setCurrentTab('split-tutor')}
            onAskTutor={handleAskTutorPrompt}
          />
        )}

        {currentTab === 'split-tutor' && activeCourse && (
          <SplitScreenView
            course={activeCourse}
            activeModuleId={activeModuleId}
            activeLessonId={activeLessonId}
            onSelectLesson={handleSelectLesson}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onResetChat={handleResetChat}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span>MindForge AI LMS</span>
          <span>•</span>
          <span className="font-mono text-slate-400">FastAPI + React Vite + ChromaDB</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isBackendOnline ? 'Backend 127.0.0.1:8000 Connected' : 'Demo Mode Active'}</span>
          </span>
        </div>
      </footer>

    </div>
  );
};

export default App;
