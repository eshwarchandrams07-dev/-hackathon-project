import React, { useState, useEffect, useCallback } from 'react';
import { Course, ChatMessage, UploadHistoryItem } from './types';
import { SAMPLE_COURSE, INITIAL_SOCRATIC_MESSAGES } from './services/mockData';
import { apiService } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CourseView } from './components/CourseView';
import { SocraticChat } from './components/SocraticChat';
import { UploadZone } from './components/UploadZone';
import { UploadLanding } from './components/UploadLanding';

export const App: React.FC = () => {
  // Clean initial state: defaults to null so website opens directly to File Upload, not cluttered demo!
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);
  
  // Workspace panels
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Upload History state persisted in localStorage
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>(() => {
    return apiService.loadUploadHistory();
  });

  // Stable session identifier for current course or general chat history
  const sessionId = activeCourse 
    ? `course_${activeCourse.course_title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    : 'default_session';

  // Tutor chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = apiService.loadLocalChatHistory('default_session');
    return saved.length > 0 ? saved : INITIAL_SOCRATIC_MESSAGES;
  });
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

  // Load chat history whenever course session changes
  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      const local = apiService.loadLocalChatHistory(sessionId);
      if (local && local.length > 0) {
        if (isMounted) setChatMessages(local);
      } else {
        if (isMounted) setChatMessages(INITIAL_SOCRATIC_MESSAGES);
      }

      try {
        const remote = await apiService.getChatHistory(sessionId);
        if (isMounted && remote && remote.length > 0) {
          setChatMessages(remote);
        } else if (local && local.length > 0) {
          for (const msg of local) {
            await apiService.saveChatMessage(msg, sessionId, msg.lessonId);
          }
        }
      } catch (err) {
        console.warn('Backend history sync notice:', err);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Handle course generation via PDF upload or demo load
  const handleCourseGenerated = (course: Course, fileName?: string) => {
    setActiveCourse(course);
    let firstModId = '';
    let firstLessonId = '';

    if (course.modules && course.modules.length > 0) {
      const firstMod = course.modules[0];
      firstModId = firstMod.module_id;
      setActiveModuleId(firstMod.module_id);
      if (firstMod.lessons && firstMod.lessons.length > 0) {
        firstLessonId = firstMod.lessons[0].lesson_id;
        setActiveLessonId(firstMod.lessons[0].lesson_id);
      }
    }
    setIsOverviewActive(false);
    setIsUploadModalOpen(false);

    const newSessionId = `course_${course.course_title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const welcomeMsg: ChatMessage = {
      id: `intro-${Date.now()}`,
      role: 'assistant',
      content: `Welcome to **${course.course_title}**! I have indexed the textbook content. Feel free to explore the lessons, quizzes, and ask me any questions whenever you'd like conceptual guidance!`,
      timestamp: Date.now(),
      citations: [1],
      sessionId: newSessionId
    };

    setChatMessages([welcomeMsg]);
    apiService.saveLocalChatHistory([welcomeMsg], newSessionId);
    apiService.saveChatMessage(welcomeMsg, newSessionId);

    // Compute curriculum metadata counts
    const totalModules = course.modules?.length || 0;
    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    const totalQuizzes = (course.quizzes?.length || 0) + (course.modules?.reduce((acc, m) => acc + (m.quizzes?.length || 0), 0) || 0);

    // Save to upload history so it appears in the sidebar history section
    const historyItem: UploadHistoryItem = {
      id: `upload_${Date.now()}`,
      sessionId: newSessionId,
      courseTitle: course.course_title,
      documentName: fileName || (course.overview?.slice(0, 45) ? `${course.overview.slice(0, 45)}...` : 'Uploaded Document'),
      timestamp: Date.now(),
      course: course,
      activeModuleId: firstModId,
      activeLessonId: firstLessonId,
      totalModules,
      totalLessons,
      totalQuizzes
    };

    const updatedList = apiService.addOrUpdateUploadHistory(historyItem);
    setUploadHistory(updatedList);
  };

  // Restore an uploaded course along with all associated quizzes, lessons, and AI tutor chat
  const handleSelectUploadHistory = (item: UploadHistoryItem) => {
    setActiveCourse(item.course);

    const targetModId = item.activeModuleId || item.course.modules?.[0]?.module_id || '';
    const targetMod = item.course.modules?.find(m => m.module_id === targetModId) || item.course.modules?.[0];
    const targetLessonId = item.activeLessonId || targetMod?.lessons?.[0]?.lesson_id || '';

    setActiveModuleId(targetModId);
    setActiveLessonId(targetLessonId);
    setIsOverviewActive(false);

    // Restore associated AI tutor chat activities
    const savedChat = apiService.loadLocalChatHistory(item.sessionId);
    if (savedChat && savedChat.length > 0) {
      setChatMessages(savedChat);
    } else {
      const welcomeMsg: ChatMessage = {
        id: `restore-${Date.now()}`,
        role: 'assistant',
        content: `Welcome back to **${item.courseTitle}**! All your lessons, quizzes, and tutoring notes have been restored. What would you like to explore?`,
        timestamp: Date.now(),
        sessionId: item.sessionId
      };
      setChatMessages([welcomeMsg]);
      apiService.saveLocalChatHistory([welcomeMsg], item.sessionId);
    }

    // Ensure dedicated quiz panel is visible
    setIsQuizOpen(true);
  };

  // Remove an item from the upload history
  const handleDeleteUploadHistory = (id: string) => {
    const updated = apiService.deleteUploadHistoryItem(id);
    setUploadHistory(updated);
  };

  // Only load demo course when explicitly asked by user
  const handleLoadDemoCourse = () => {
    handleCourseGenerated(SAMPLE_COURSE, 'Compiler_Design_Lecture_Notes.pdf');
  };

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setIsOverviewActive(false);
  };

  const handleOpenOverview = () => {
    setIsOverviewActive(true);
  };

  // Get active lesson & module objects
  const currentModule = activeCourse?.modules.find(m => m.module_id === activeModuleId) || activeCourse?.modules[0];
  const currentLesson = currentModule?.lessons.find(l => l.lesson_id === activeLessonId) || currentModule?.lessons[0];

  // Socratic Chat Handler with Database & LocalStorage Persistence
  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

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
      const lessonContext = activeCourse
        ? (currentLesson
            ? `Course: ${activeCourse.course_title}\nModule: ${currentModule?.title}\nLesson: ${currentLesson.title}\n\nLesson Summary:\n${currentLesson.summary}\n\nLesson Content:\n${currentLesson.content_markdown}`
            : activeCourse.overview)
        : 'General inquiry before course material is selected.';

      const historyPayload = chatMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
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
      const fallbackReplyText = apiService.generateFallbackSocraticReply(userMessage, currentLesson?.title);

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
      apiService.saveChatMessage(fallbackReply, sessionId, activeLessonId || undefined);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAskTutorPrompt = (prompt: string) => {
    setIsTutorOpen(true);
    handleSendMessage(prompt);
  };

  const handleResetChat = async () => {
    const welcomeMsg: ChatMessage = {
      id: `reset-${Date.now()}`,
      role: 'assistant',
      content: activeCourse
        ? `Conversation reset. Ask me anything about **${activeCourse.course_title}** or your current lesson to begin fresh!`
        : `Conversation reset. How can I help you with your learning today?`,
      timestamp: Date.now(),
      sessionId: sessionId
    };
    setChatMessages([welcomeMsg]);
    apiService.saveLocalChatHistory([welcomeMsg], sessionId);
    await apiService.clearChatHistory(sessionId);
    apiService.saveChatMessage(welcomeMsg, sessionId);
  };

  const handleExportChat = () => {
    apiService.exportChatHistoryAsMarkdown(chatMessages, activeCourse ? activeCourse.course_title : 'General Notes');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f17] text-slate-100">
      
      {/* 1. Left Sidebar: Upload History by default + Syllabus when course is loaded */}
      <Sidebar
        course={activeCourse}
        activeModuleId={activeModuleId}
        activeLessonId={activeLessonId}
        uploadHistory={uploadHistory}
        onSelectUploadHistory={handleSelectUploadHistory}
        onDeleteUploadHistory={handleDeleteUploadHistory}
        onSelectLesson={handleSelectLesson}
        onOpenOverview={handleOpenOverview}
        isOverviewActive={isOverviewActive}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadDemoCourse={handleLoadDemoCourse}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        isBackendOnline={isBackendOnline}
      />

      {/* 2. Main Center Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Header with Breadcrumb Navigation */}
        <Navbar
          activeCourse={activeCourse}
          activeModule={currentModule}
          activeLesson={currentLesson}
          isOverviewActive={isOverviewActive}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          isTutorOpen={isTutorOpen}
          onToggleTutor={() => setIsTutorOpen(prev => !prev)}
          isQuizOpen={isQuizOpen}
          onToggleQuiz={() => setIsQuizOpen(prev => !prev)}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onLoadDemoCourse={handleLoadDemoCourse}
          isBackendOnline={isBackendOnline}
          onCheckBackendHealth={verifyBackendHealth}
        />

        {/* Center Canvas: Upload Landing if no course yet; CourseView once course loaded */}
        <main className="flex-1 overflow-y-auto">
          {activeCourse ? (
            <CourseView
              course={activeCourse}
              activeModuleId={activeModuleId}
              activeLessonId={activeLessonId}
              isOverviewActive={isOverviewActive}
              onSelectLesson={handleSelectLesson}
              onAskTutor={handleAskTutorPrompt}
              isQuizOpen={isQuizOpen}
              onToggleQuiz={() => setIsQuizOpen(prev => !prev)}
            />
          ) : (
            <UploadLanding
              onCourseGenerated={handleCourseGenerated}
              onLoadDemoCourse={handleLoadDemoCourse}
              isBackendOnline={isBackendOnline}
            />
          )}
        </main>
      </div>

      {/* 3. On-Demand Socratic Tutor Companion Panel (Right) */}
      {isTutorOpen && (
        <aside className="w-96 lg:w-[400px] h-full shrink-0 animate-fade-in z-20">
          <SocraticChat
            activeLesson={currentLesson || null}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onResetChat={handleResetChat}
            onClose={() => setIsTutorOpen(false)}
            onExportChat={handleExportChat}
            courseTitle={activeCourse ? activeCourse.course_title : 'General Study Session'}
            isBackendOnline={isBackendOnline}
          />
        </aside>
      )}

      {/* 4. PDF Ingestion Modal Dialog (when triggered from navbar/sidebar inside a course) */}
      <UploadZone
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onCourseGenerated={handleCourseGenerated}
        isBackendOnline={isBackendOnline}
      />

    </div>
  );
};

export default App;
