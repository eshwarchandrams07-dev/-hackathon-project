import { Course, UploadResponse, ChatRequest, ChatResponse } from '../types';
import { SAMPLE_COURSE } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiService {
  private baseUrl: string = BASE_URL;

  getBaseUrl(): string {
    return this.baseUrl || 'http://127.0.0.1:8000 (proxied via Vite)';
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  private getEndpoint(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (!this.baseUrl) return cleanPath;
    return `${this.baseUrl}${cleanPath}`;
  }

  /**
   * Check if the backend is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(this.getEndpoint('/docs'), {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.status < 500;
    } catch {
      return false;
    }
  }

  /**
   * Upload PDF file to FastAPI backend
   * Endpoint: POST /api/upload (multipart/form-data: file)
   */
  async uploadPdf(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(this.getEndpoint('/api/upload'), {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errMsg = `Upload failed (${res.status} ${res.statusText})`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errMsg = errorJson.detail;
      } catch {
        // use default error message
      }
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Generate modular course from uploaded PDF task_id
   * Endpoint: POST /api/generate-course { task_id }
   */
  async generateCourse(taskId: string): Promise<Course> {
    const res = await fetch(this.getEndpoint('/api/generate-course'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId }),
    });

    if (!res.ok) {
      let errMsg = `Course generation failed (${res.status} ${res.statusText})`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) errMsg = errorJson.detail;
      } catch {
        // use default error message
      }
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Fetch dummy mock course from FastAPI backend
   * Endpoint: POST /api/generate-course/mock
   */
  async generateCourseMock(): Promise<Course> {
    try {
      const res = await fetch(this.getEndpoint('/api/generate-course/mock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const course = await res.json();
        // If the backend dummy is minimal, ensure it has rich fallback structure
        if (course.modules && course.modules.length > 0 && course.modules[0].lessons?.length > 0) {
          return course;
        }
      }
    } catch (e) {
      console.warn('Backend mock endpoint unreachable, using local sample course.', e);
    }
    return SAMPLE_COURSE;
  }

  /**
   * Socratic AI Tutor Chat
   * Endpoint: POST /api/chat { lesson_context, user_message, history }
   */
  async sendChat(payload: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(this.getEndpoint('/api/chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errMsg = `Chat request failed (${res.status} ${res.statusText})`;
      try {
        const errJson = await res.json();
        if (errJson.detail) errMsg = errJson.detail;
      } catch {
        // use default error message
      }
      throw new Error(errMsg);
    }

    return await res.json();
  }

  /**
   * Local Socratic fallback response in case the backend is offline
   */
  generateFallbackSocraticReply(userMessage: string, lessonTitle?: string): string {
    const normalized = userMessage.toLowerCase();
    if (normalized.includes('bias')) {
      return "Notice what happens when you substitute x = 0 into z = w · x + b. If b was not present, the line would be constrained to cross the origin (0,0). How would that restrict a model trying to separate points that lie entirely above the origin?";
    }
    if (normalized.includes('xor') || normalized.includes('linear')) {
      return "Imagine placing four pins on a board at (0,0), (0,1), (1,0), and (1,1). The diagonal pairs have the same label. Can you place a single rigid ruler anywhere on the board that keeps identical pairs on one side and different pairs on the other? Why does this require an additional dimension or hidden layer?";
    }
    if (normalized.includes('relu') || normalized.includes('activation')) {
      return "Consider the derivative of ReLU for positive numbers compared to the derivative of Sigmoid. Why would gradients vanish when multiplying many numbers smaller than 0.25 in deep Sigmoid networks, whereas ReLU maintains a gradient of 1?";
    }
    if (normalized.includes('hint') || normalized.includes('quiz')) {
      return `Think carefully about the foundational assumption of ${lessonTitle || 'this concept'}. What is the single constraint that changes when we introduce non-linearities or additional parameters?`;
    }
    return `That's a thoughtful question regarding ${lessonTitle || 'this topic'}. Rather than giving the conclusion directly: which specific part of the mathematical formula or biological analogy feels most counter-intuitive to you right now?`;
  }
}

export const apiService = new ApiService();
