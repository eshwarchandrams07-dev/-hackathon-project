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


export type ViewTab = 'dashboard' | 'course' | 'split-tutor';
