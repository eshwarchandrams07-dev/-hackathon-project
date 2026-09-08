import React, { useState, useEffect, useCallback } from 'react';
import { 
  Course, 
  Subject, 
  SubjectMaterial, 
  NavTab, 
  QuizAttempt,
  SmartAssessment,
  UpcomingExam
} from './types';
import { SAMPLE_COURSE } from './services/mockData';
import { apiService } from './services/api';
import { subjectService, INITIAL_SUBJECTS } from './services/subjectService';

import { PhoenixNavbar } from './components/PhoenixNavbar';
import { PhoenixSidebar } from './components/PhoenixSidebar';
import { PhoenixDashboard } from './components/PhoenixDashboard';
import { SubjectsView } from './components/SubjectsView';
import { SubjectStudyView } from './components/SubjectStudyView';
import { SkillAnalyticsView } from './components/SkillAnalyticsView';
import { SettingsView } from './components/SettingsView';
import { UploadZone } from './components/UploadZone';
import { SmartAssessmentModal } from './components/SmartAssessmentModal';

export const App: React.FC = () => {
  // 1. Navigation and Student Profile
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('phoenix_student_name') || 'Eshwar';
  });

  // 2. Subjects and Materials
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    return subjectService.getSubjects();
  });
  const [activeSubject, setActiveSubject] = useState<Subject | null>(() => {
    const subs = subjectService.getSubjects();
    return subs[0] || null;
  });
  const [activeMaterial, setActiveMaterial] = useState<SubjectMaterial | null>(() => {
    const subs = subjectService.getSubjects();
    return subs[0]?.materials?.[0] || null;
  });
  const [activeCourse, setActiveCourse] = useState<Course | null>(() => {
    const subs = subjectService.getSubjects();
    return subs[0]?.materials?.[0]?.course || null;
  });
  const [activeModuleId, setActiveModuleId] = useState<string>(() => {
    const subs = subjectService.getSubjects();
    const crs = subs[0]?.materials?.[0]?.course;
    return crs?.modules?.[0]?.module_id || '';
  });
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    const subs = subjectService.getSubjects();
    const crs = subs[0]?.materials?.[0]?.course;
    return crs?.modules?.[0]?.lessons?.[0]?.lesson_id || '';
  });

  // 3. Quiz Attempts & Skill Analytics Memory
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    return subjectService.getQuizAttempts();
  });

  // 4. Smart Assessments
  const [activeAssessment, setActiveAssessment] = useState<SmartAssessment | null>(null);
  const [completedAssessmentIds, setCompletedAssessmentIds] = useState<string[]>(() => {
    return subjectService.getCompletedAssessmentIds();
  });

  // 5. Upcoming Exams Schedule
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>(() => {
    return subjectService.getUpcomingExams();
  });

  // 6. Modal and Backend status
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [targetSubjectForUpload, setTargetSubjectForUpload] = useState<Subject | null>(null);
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

  const handleUpdateStudentName = (name: string) => {
    setStudentName(name);
    localStorage.setItem('phoenix_student_name', name);
  };

  // Subject Actions
  const handleAddSubject = (name: string, code?: string, description?: string, color: string = 'purple') => {
    const newSub = subjectService.addSubject(name, code, description, color);
    setSubjects([...subjectService.getSubjects()]);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Are you sure you want to delete this subject and its organized materials?')) {
      subjectService.deleteSubject(id);
      setSubjects([...subjectService.getSubjects()]);
      if (activeSubject?.id === id) {
        setActiveSubject(null);
        setActiveCourse(null);
        setCurrentTab('courses');
      }
    }
  };

  // Handle lesson slide opened (strictly tracks unique opened lesson slides / total lessons)
  const handleLessonOpened = (subjectId: string, lessonId: string) => {
    const updatedSub = subjectService.markLessonOpened(subjectId, lessonId);
    if (updatedSub) {
      const refreshedList = subjectService.getSubjects();
      setSubjects([...refreshedList]);
      if (activeSubject && (activeSubject.id === subjectId || activeSubject.name.toLowerCase() === subjectId.toLowerCase())) {
        const found = refreshedList.find(s => s.id === subjectId || s.name.toLowerCase() === subjectId.toLowerCase());
        if (found) setActiveSubject(found);
      }
    }
  };

  // Launch study session for a specific PDF material
  const handleSelectMaterial = (subject: Subject, material: SubjectMaterial) => {
    setActiveSubject(subject);
    setActiveMaterial(material);

    // If material already has an attached Course, use it
    if (material.course) {
      setActiveCourse(material.course);
      const mId = material.course.modules?.[0]?.module_id || '';
      const lId = material.course.modules?.[0]?.lessons?.[0]?.lesson_id || '';
      setActiveModuleId(mId);
      setActiveLessonId(lId);
      if (lId) {
        handleLessonOpened(subject.id, lId);
      }
      setCurrentTab('study');
      return;
    }

    // Check if there is a cached course from upload history matching this material
    const history = apiService.loadUploadHistory();
    const matchedHistory = history.find(h => 
      h.documentName.toLowerCase().includes(material.fileName.toLowerCase()) ||
      material.fileName.toLowerCase().includes(h.documentName.toLowerCase())
    );

    if (matchedHistory) {
      setActiveCourse(matchedHistory.course);
      const mId = matchedHistory.course.modules?.[0]?.module_id || '';
      const lId = matchedHistory.course.modules?.[0]?.lessons?.[0]?.lesson_id || '';
      setActiveModuleId(mId);
      setActiveLessonId(lId);
      if (lId) {
        handleLessonOpened(subject.id, lId);
      }
      setCurrentTab('study');
    } else {
      // If not yet generated, open the upload modal targeted to this subject
      setTargetSubjectForUpload(subject);
      setIsUploadModalOpen(true);
    }
  };

  // Handle newly generated course from PDF ingestion
  const handleCourseGenerated = (course: Course, fileName?: string) => {
    const actualFileName = fileName || `${course.course_title}.pdf`;
    
    // Determine which subject this belongs to
    let targetSub = targetSubjectForUpload;
    if (!targetSub) {
      // Find matching subject by name keywords or fallback to first subject
      const titleLower = course.course_title.toLowerCase();
      targetSub = subjects.find(s => 
        titleLower.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(titleLower)
      ) || subjects[0];
    }

    if (targetSub) {
      const newMat = subjectService.addMaterialToSubject(targetSub.id, {
        fileName: actualFileName,
        fileSize: 95000,
        course: course
      });
      setSubjects([...subjectService.getSubjects()]);
      setActiveSubject(targetSub);
      setActiveMaterial(newMat);

      const firstLId = course.modules?.[0]?.lessons?.[0]?.lesson_id || '';
      if (firstLId) {
        handleLessonOpened(targetSub.id, firstLId);
      }
    }

    setActiveCourse(course);
    setActiveModuleId(course.modules?.[0]?.module_id || '');
    setActiveLessonId(course.modules?.[0]?.lessons?.[0]?.lesson_id || '');
    setIsUploadModalOpen(false);
    setTargetSubjectForUpload(null);
    setCurrentTab('study');
  };

  // Open upload targeted to a subject
  const handleOpenUploadForSubject = (subject: Subject) => {
    setTargetSubjectForUpload(subject);
    setIsUploadModalOpen(true);
  };

  // Handle quiz question answer submission (Records to Skill Analytics Memory & Streak!)
  const handleRecordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => {
    const recorded = subjectService.recordQuizAttempt(attempt);
    setQuizAttempts([...subjectService.getQuizAttempts()]);

    // Automatically mark today as active streak day
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const raw = localStorage.getItem('phoenix_streak_days_v1');
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list) && !list.includes(todayStr)) {
        list.push(todayStr);
        localStorage.setItem('phoenix_streak_days_v1', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to update streak day:', e);
    }
  };

  // Update subject progress handler (allows user to mark 100% or adjust progress)
  const handleUpdateSubjectProgress = (subjectId: string, percent: number) => {
    subjectService.updateSubjectProgress(subjectId, percent);
    const updated = subjectService.getSubjects();
    setSubjects([...updated]);
    if (activeSubject && (activeSubject.id === subjectId || activeSubject.name.toLowerCase() === subjectId.toLowerCase())) {
      const refreshed = updated.find(s => s.id === subjectId || s.name.toLowerCase() === subjectId.toLowerCase());
      if (refreshed) setActiveSubject(refreshed);
    }
  };

  // Start refresher action (from Dashboard or Skill Analytics recommendation or Smart Assessment)
  const handleStartRefresher = (topicOrId: string) => {
    const assessment = subjectService.findAssessmentByTopicOrId(topicOrId);
    if (assessment) {
      setActiveAssessment(assessment);
    }
  };

  // Handle completed assessment
  const handleCompleteAssessment = (assessmentId: string, scorePct: number, subjectKey: string) => {
    subjectService.markAssessmentCompleted(assessmentId);
    setCompletedAssessmentIds([...subjectService.getCompletedAssessmentIds()]);

    // Record assessment score in subject (30% weight in blended progress)
    const updatedSub = subjectService.recordAssessmentScore(subjectKey, scorePct);
    const refreshed = subjectService.getSubjects();
    setSubjects([...refreshed]);
    if (activeSubject && updatedSub && (activeSubject.id === updatedSub.id || activeSubject.name.toLowerCase() === updatedSub.name.toLowerCase())) {
      setActiveSubject(updatedSub);
    }
  };

  // Upcoming Exams handlers
  const handleAddExam = (subjectId: string, subjectName: string, examDate: string, examTitle?: string) => {
    subjectService.addUpcomingExam(subjectId, subjectName, examDate, examTitle);
    setUpcomingExams([...subjectService.getUpcomingExams()]);
  };

  const handleDeleteExam = (examId: string) => {
    subjectService.deleteUpcomingExam(examId);
    setUpcomingExams([...subjectService.getUpcomingExams()]);
  };

  // Reset all data handler
  const handleResetAllData = () => {
    localStorage.removeItem('phoenix_subjects_v1');
    localStorage.removeItem('phoenix_quiz_attempts_v1');
    localStorage.removeItem('phoenix_completed_assessments_v1');
    localStorage.removeItem('phoenix_streak_days_v1');
    localStorage.removeItem('phoenix_upcoming_exams_v1');
    localStorage.removeItem('mindforge_upload_history');
    setSubjects([...subjectService.getSubjects()]);
    setQuizAttempts([...subjectService.getQuizAttempts()]);
    setUpcomingExams([...subjectService.getUpcomingExams()]);
    setCompletedAssessmentIds([]);
    setActiveCourse(null);
    setActiveSubject(null);
    setActiveMaterial(null);
    setCurrentTab('dashboard');
  };

  const skillAnalysis = subjectService.computeSkillAnalysis();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F4F8] text-[#243B53] font-sans">
      
      {/* 1. Left Sidebar Navigation (Matching reference image, without AI tutor chat) */}
      <PhoenixSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'study' && !activeCourse) {
            setCurrentTab('courses');
          } else {
            setCurrentTab(tab);
          }
        }}
        subjectsCount={subjects.length}
        activeCourse={activeCourse}
        activeSubject={activeSubject}
        activeModuleId={activeModuleId}
        activeLessonId={activeLessonId}
        onSelectLesson={(mId, lId) => {
          setActiveModuleId(mId);
          setActiveLessonId(lId);
          if (activeSubject) {
            handleLessonOpened(activeSubject.id, lId);
          }
          setCurrentTab('study');
        }}
      />

      {/* 2. Main Center Body */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Navbar with Functional Subject Search */}
        <PhoenixNavbar
          studentName={studentName}
          isBackendOnline={isBackendOnline}
          subjects={subjects}
          onSelectSubject={(subject) => {
            if (subject.materials.length > 0) {
              handleSelectMaterial(subject, subject.materials[0]);
            } else {
              handleOpenUploadForSubject(subject);
            }
          }}
          onOpenUpload={() => {
            setTargetSubjectForUpload(null);
            setIsUploadModalOpen(true);
          }}
        />

        {/* Dynamic Content View Based on Active Tab */}
        <main className="flex-1 overflow-y-auto">
          
          {/* View 1: Dashboard (Matches user reference screenshot) */}
          {currentTab === 'dashboard' && (
            <PhoenixDashboard
              studentName={studentName}
              subjects={subjects}
              upcomingExams={upcomingExams}
              onAddExam={handleAddExam}
              onDeleteExam={handleDeleteExam}
              onSelectSubject={(subject) => {
                if (subject.materials.length > 0) {
                  handleSelectMaterial(subject, subject.materials[0]);
                } else {
                  setCurrentTab('courses');
                }
              }}
              onViewAllCourses={() => setCurrentTab('courses')}
              onStartRefresher={handleStartRefresher}
              onUpdateProgress={handleUpdateSubjectProgress}
              completedAssessmentIds={completedAssessmentIds}
            />
          )}

          {/* View 2: My Courses / Subjects */}
          {currentTab === 'courses' && (
            <SubjectsView
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onSelectSubject={(subject) => {
                if (subject.materials.length > 0) {
                  handleSelectMaterial(subject, subject.materials[0]);
                } else {
                  handleOpenUploadForSubject(subject);
                }
              }}
              onSelectMaterial={handleSelectMaterial}
              onUploadPdfToSubject={handleOpenUploadForSubject}
              onUpdateProgress={handleUpdateSubjectProgress}
            />
          )}

          {/* View 3: Subject Study View (PDF Reader + Embedded Quiz + Embedded Socratic Tutor) */}
          {currentTab === 'study' && activeCourse && activeSubject && activeMaterial && (
            <SubjectStudyView
              subject={activeSubject}
              material={activeMaterial}
              course={activeCourse}
              activeModuleId={activeModuleId}
              activeLessonId={activeLessonId}
              onSelectLesson={(mId, lId) => {
                setActiveModuleId(mId);
                setActiveLessonId(lId);
                handleLessonOpened(activeSubject.id, lId);
              }}
              onLessonOpened={handleLessonOpened}
              onBackToSubject={() => setCurrentTab('courses')}
              onRecordQuizAttempt={handleRecordQuizAttempt}
              onUpdateProgress={handleUpdateSubjectProgress}
              isBackendOnline={isBackendOnline}
            />
          )}

          {/* View 4: Skill Analytics (Strengths, Weaknesses, User Answer Memory) */}
          {currentTab === 'analytics' && (
            <SkillAnalyticsView
              analysis={skillAnalysis}
              attempts={quizAttempts}
              onPracticeTopic={handleStartRefresher}
            />
          )}

          {/* View 5: Platform Settings */}
          {currentTab === 'settings' && (
            <SettingsView
              studentName={studentName}
              onUpdateStudentName={handleUpdateStudentName}
              isBackendOnline={isBackendOnline}
              onResetAllData={handleResetAllData}
              upcomingExams={upcomingExams}
              subjects={subjects}
              onAddExam={handleAddExam}
              onDeleteExam={handleDeleteExam}
            />
          )}

        </main>
      </div>

      {/* Upload Zone Modal Dialog */}
      <UploadZone
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setTargetSubjectForUpload(null);
        }}
        onCourseGenerated={handleCourseGenerated}
        isBackendOnline={isBackendOnline}
      />

      {/* Interactive Smart Assessment Modal */}
      {activeAssessment && (
        <SmartAssessmentModal
          assessment={activeAssessment}
          isOpen={!!activeAssessment}
          onClose={() => setActiveAssessment(null)}
          onRecordAttempt={handleRecordQuizAttempt}
          onComplete={handleCompleteAssessment}
        />
      )}

    </div>
  );
};

export default App;
