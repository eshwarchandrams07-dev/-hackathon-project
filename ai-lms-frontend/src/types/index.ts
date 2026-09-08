export interface ConceptGraphNode {
  node_id: string;
  label: string;
  dependencies: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  hint: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
}

export interface Lesson {
  lesson_id: string;
  title: string;
  summary: string;
  content_markdown: string;
  key_takeaways: string[];
  quiz: QuizQuestion[];
}

export interface Module {
  module_id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  concept_nodes: ConceptGraphNode[];
}

export interface Course {
  course_title: string;
  overview: string;
  modules: Module[];
}

export interface UploadResponse {
  task_id: string;
  message: string;
}

export interface GenerateCourseRequest {
  task_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: number[];
  lessonId?: string;
  sessionId?: string;
}

export interface ChatRequest {
  lesson_context: string;
  user_message: string;
  history: Array<{
    role: string;
    content: string;
  }>;
  session_id?: string;
  lesson_id?: string;
  user_id?: string;
}

export interface ChatResponse {
  reply: string;
  message_id?: string;
  timestamp?: number;
  citations?: number[];
}


export interface UploadHistoryItem {
  id: string;
  sessionId: string;
  courseTitle: string;
  documentName: string;
  timestamp: number;
  course: Course;
  activeModuleId?: string;
  activeLessonId?: string;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  messageCount?: number;
}

export type ViewTab = 'dashboard' | 'course' | 'split-tutor';

export type NavTab = 'dashboard' | 'courses' | 'study' | 'analytics' | 'settings';

export interface SubjectMaterial {
  id: string;
  subjectId: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: number;
  taskId?: string;
  course?: Course;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'rose' | string;
  description?: string;
  icon?: string;
  progressPercent?: number;
  openedLessonIds?: string[];
  assessmentScore?: number;
  materials: SubjectMaterial[];
  createdAt: number;
}

export interface SubjectLessonStats {
  totalLessons: number;
  openedLessonsCount: number;
  slideProgressPercent: number;
  assessmentScore: number;
  progressPercent: number;
  openedLessonIds: string[];
}

export interface QuizAttempt {
  id: string;
  subjectId?: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  questionId: string;
  questionText: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topicOrConcept?: string;
  difficulty?: string;
  timestamp: number;
}

export interface SubjectSkillAnalysis {
  subjectId: string;
  subjectName: string;
  totalAttempts: number;
  correctCount: number;
  accuracyRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SmartAssessment {
  id: string;
  title: string;
  subjectKey: string;
  subjectName: string;
  topic: string;
  dueDateLabel: string;
  dueToday?: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
}

export interface UpcomingExam {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  examDate: string; // 'YYYY-MM-DD'
  examTitle?: string; // e.g. "Midterm", "End-Sem Finals"
  createdAt: number;
}
