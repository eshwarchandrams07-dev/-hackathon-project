import { Course, UploadResponse, ChatRequest, ChatResponse, QuizQuestion, ChatMessage, UploadHistoryItem } from '../types';
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
   * Endpoint: POST /api/chat { lesson_context, user_message, history, session_id, lesson_id }
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
   * Fetch chat history from FastAPI backend with localStorage fallback
   */
  async getChatHistory(sessionId: string = 'default_session', lessonId?: string): Promise<ChatMessage[]> {
    try {
      let path = `/api/chat/history?session_id=${encodeURIComponent(sessionId)}`;
      if (lessonId) {
        path += `&lesson_id=${encodeURIComponent(lessonId)}`;
      }

      const res = await fetch(this.getEndpoint(path), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.messages)) {
          const remoteMsgs: ChatMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            timestamp: m.timestamp,
            citations: m.citations,
            lessonId: m.lesson_id,
            sessionId: m.session_id,
          }));

          // Cache remotely fetched messages locally as well
          if (remoteMsgs.length > 0) {
            this.saveLocalChatHistory(remoteMsgs, sessionId);
          }
          return remoteMsgs;
        }
      }
    } catch (e) {
      console.warn('Could not load chat history from backend, falling back to localStorage:', e);
    }

    // Fallback to local storage
    return this.loadLocalChatHistory(sessionId);
  }

  /**
   * Explicitly save a single chat message to the backend
   */
  async saveChatMessage(message: ChatMessage, sessionId: string = 'default_session', lessonId?: string): Promise<void> {
    try {
      await fetch(this.getEndpoint('/api/chat/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: message.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          citations: message.citations,
          session_id: sessionId,
          lesson_id: lessonId || message.lessonId,
        }),
      });
    } catch (e) {
      console.warn('Failed to save message to backend:', e);
    }
  }

  /**
   * Clear chat history from both backend and local storage
   */
  async clearChatHistory(sessionId: string = 'default_session', lessonId?: string): Promise<void> {
    this.clearLocalChatHistory(sessionId);
    try {
      let path = `/api/chat/history?session_id=${encodeURIComponent(sessionId)}`;
      if (lessonId) {
        path += `&lesson_id=${encodeURIComponent(lessonId)}`;
      }
      await fetch(this.getEndpoint(path), { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete chat history on backend:', e);
    }
  }

  /**
   * LocalStorage Helpers for instant offline persistence
   */
  loadLocalChatHistory(sessionId: string = 'default_session'): ChatMessage[] {
    try {
      const raw = localStorage.getItem(`mindforge_chat_${sessionId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local chat history:', e);
    }
    return [];
  }

  saveLocalChatHistory(messages: ChatMessage[], sessionId: string = 'default_session'): void {
    try {
      localStorage.setItem(`mindforge_chat_${sessionId}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat history to localStorage:', e);
    }
  }

  clearLocalChatHistory(sessionId: string = 'default_session'): void {
    try {
      localStorage.removeItem(`mindforge_chat_${sessionId}`);
    } catch (e) {
      console.warn('Failed to clear local chat history:', e);
    }
  }

  /**
   * Upload History Management (persisted in localStorage)
   */
  loadUploadHistory(): UploadHistoryItem[] {
    try {
      const raw = localStorage.getItem('mindforge_upload_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local upload history:', e);
    }
    return [];
  }

  saveUploadHistory(history: UploadHistoryItem[]): void {
    try {
      localStorage.setItem('mindforge_upload_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist upload history:', e);
    }
  }

  addOrUpdateUploadHistory(item: UploadHistoryItem): UploadHistoryItem[] {
    const current = this.loadUploadHistory();
    const existingIdx = current.findIndex(h => h.id === item.id || h.sessionId === item.sessionId);
    let updated: UploadHistoryItem[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...current[existingIdx], ...item, timestamp: Date.now() };
    } else {
      updated = [item, ...current];
    }
    this.saveUploadHistory(updated);
    return updated;
  }

  deleteUploadHistoryItem(id: string): UploadHistoryItem[] {
    const current = this.loadUploadHistory();
    const filtered = current.filter(h => h.id !== id && h.sessionId !== id);
    this.saveUploadHistory(filtered);
    return filtered;
  }

  /**
   * Export chat history as Markdown study notes
   */
  exportChatHistoryAsMarkdown(messages: ChatMessage[], courseTitle: string = 'Course Notes'): void {
    const header = `# Socratic Tutoring Notes: ${courseTitle}\n\n*Generated by MindForge AI LMS on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}*\n\n---\n\n`;
    
    const body = messages.map(msg => {
      const roleLabel = msg.role === 'user' ? '🧑 **Student Question**' : '🤖 **Socratic AI Tutor**';
      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const citations = msg.citations && msg.citations.length > 0 ? `\n\n*Citations: Pages ${msg.citations.join(', ')}*` : '';
      return `### ${roleLabel} (${timeStr})\n\n${msg.content}${citations}\n\n---\n`;
    }).join('\n');

    const markdown = header + body;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = courseTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    link.download = `socratic-chat-notes-${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  /**
   * Local Socratic fallback response in case the backend is offline
   */
  generateFallbackSocraticReply(userMessage: string, lessonTitle?: string): string {
    const q = userMessage.toLowerCase();

    // 1. Code & Line-by-Line Breakdown Request
    if (q.includes('code') || q.includes('line') || q.includes('program') || q.includes('printf') || q.includes('scanf')) {
      if (q.includes('fcfs') || (lessonTitle && lessonTitle.toLowerCase().includes('fcfs'))) {
        return `### [Code Breakdown] FCFS Algorithm Line-by-Line\n\n` +
          `Here is how the First-Come, First-Served C program works step-by-step:\n\n` +
          `1. **Burst Time Input Loop**:\n` +
          `   \`for (i = 0; i < n; i++) scanf("%d", &bt[i]);\`\n` +
          `   Collects the CPU execution duration required by each process in arrival order.\n\n` +
          `2. **Waiting Time Initialization**:\n` +
          `   \`wt[0] = 0;\`\n` +
          `   The first process to arrive executes immediately without waiting.\n\n` +
          `3. **Cumulative Waiting Time Calculation**:\n` +
          `   \`wt[i] = wt[i-1] + bt[i-1];\`\n` +
          `   Each subsequent process must wait for the previous process's wait time plus its execution burst.\n\n` +
          `4. **Turnaround Time**:\n` +
          `   \`tat[i] = bt[i] + wt[i];\`\n` +
          `   Total time from arrival to completion.\n\n` +
          `---\n\n` +
          `**[Socratic Question]**: What happens if the first process has an enormous burst time (e.g. 100ms) while all subsequent processes need only 1ms? How does this "Convoy Effect" impact overall throughput?`;
      }
      return `### [Code Breakdown] Program Logic Walkthrough\n\n` +
        `Let's trace how this algorithm executes:\n\n` +
        `1. **Initialization**: Variables and state buffers are configured.\n` +
        `2. **Sequential Traversal**: The loop processes each item according to its priority or arrival order.\n` +
        `3. **State Accumulation**: Output metrics are computed based on cumulative dependencies.\n\n` +
        `**[Socratic Question]**: Which specific line of code represents the main state invariant or computational bottleneck?`;
    }

    // 2. Analogy Request
    if (q.includes('analogy') || q.includes('metaphor') || q.includes('real life') || q.includes('real world')) {
      return `### [Analogy] The Single-Lane Checkout Counter\n\n` +
        `Imagine a supermarket with a **single cashier**:\n\n` +
        `* **Customer 1** has 200 items in their cart (Large CPU burst time).\n` +
        `* **Customer 2** has just a pack of gum (Tiny CPU burst time).\n` +
        `* Under First-Come, First-Served, Customer 2 is forced to wait for all 200 items to be scanned before buying their gum!\n\n` +
        `This is the classic **Convoy Effect**. How would an express lane (like Shortest Job First) alter customer satisfaction?`;
    }

    // 3. Formula & Calculation Request
    if (q.includes('calculate') || q.includes('formula') || q.includes('math') || q.includes('waiting time') || q.includes('turnaround')) {
      return `### [Formulas] Key Scheduling Metrics\n\n` +
        `* **Waiting Time (WT)**: WT[0] = 0; WT[i] = WT[i-1] + BT[i-1]\n` +
        `* **Turnaround Time (TAT)**: TAT[i] = Burst Time[i] + Waiting Time[i]\n` +
        `* **Average Waiting Time**: Sum(WT) / Total Processes\n\n` +
        `**[Socratic Question]**: If three processes have burst times 6ms, 8ms, and 2ms, what is the waiting time of the third process under FCFS?`;
    }

    // 4. Advantages & Disadvantages
    if (q.includes('advantage') || q.includes('disadvantage') || q.includes('pros') || q.includes('cons') || q.includes('vs')) {
      return `### [Analysis] Trade-Off Summary\n\n` +
        `* **Advantages**: Simple to implement, fair arrival ordering, zero starvation.\n` +
        `* **Disadvantages**: High average waiting time, poor interactive performance due to the Convoy Effect.\n\n` +
        `**[Socratic Question]**: In what type of system (batch processing vs real-time interactive) would this approach be most suitable?`;
    }

    if (q.includes('bias')) {
      return "Notice what happens when you substitute x = 0 into z = w · x + b. If b was not present, the line would be constrained to cross the origin (0,0). How would that restrict a model trying to separate points that lie entirely above the origin?";
    }
    if (q.includes('xor') || q.includes('linear')) {
      return "Imagine placing four pins on a board at (0,0), (0,1), (1,0), and (1,1). The diagonal pairs have the same label. Can you place a single rigid ruler anywhere on the board that keeps identical pairs on one side and different pairs on the other? Why does this require an additional dimension or hidden layer?";
    }
    if (q.includes('relu') || q.includes('activation')) {
      return "Consider the derivative of ReLU for positive numbers compared to the derivative of Sigmoid. Why would gradients vanish when multiplying many numbers smaller than 0.25 in deep Sigmoid networks, whereas ReLU maintains a gradient of 1?";
    }
    if (q.includes('hint') || q.includes('quiz')) {
      return `Think carefully about the foundational assumption of ${lessonTitle || 'this concept'}. What is the single constraint that changes when we introduce non-linearities or additional parameters?`;
    }
    return `That is an interesting inquiry regarding ${lessonTitle || 'this topic'}. To discover the core intuition together: which specific line of code or step in the execution process feels most counter-intuitive to you right now?`;
  }

  /**
   * Request fresh quiz questions from FastAPI backend or fallback generator
   * Endpoint: POST /api/regenerate-quiz
   */
  async generateNewQuizQuestions(lessonTitle: string, lessonContent?: string): Promise<QuizQuestion[]> {
    try {
      const res = await fetch(this.getEndpoint('/api/regenerate-quiz'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lesson_title: lessonTitle,
          lesson_content: lessonContent || '',
          num_questions: 2,
        }),
      });

      if (res.ok) {
        const questions = await res.json();
        if (Array.isArray(questions) && questions.length > 0) {
          return questions.map((q, idx) => ({
            ...q,
            difficulty: q.difficulty || (idx === 0 ? 'Easy' : idx === 1 ? 'Medium' : 'Hard')
          }));
        }
      }
    } catch (err) {
      console.warn('FastAPI quiz regeneration failed, generating local fallback questions:', err);
    }

    return this.generateFallbackQuizQuestions(lessonTitle);
  }

  private generateFallbackQuizQuestions(lessonTitle: string): QuizQuestion[] {
    const timestamp = Date.now().toString(36).slice(-4);
    const lower = lessonTitle.toLowerCase();

    if (lower.includes('perceptron') || lower.includes('neuron')) {
      return [
        {
          id: `gen_${timestamp}_1`,
          question: "How does changing the threshold of a step activation function alter the perceptron's decision hyperplane?",
          options: [
            "It shifts the hyperplane parallel to its normal vector without changing its orientation",
            "It rotates the hyperplane perpendicular to the weight vector",
            "It forces the hyperplane into an elliptical manifold",
            "It has no mathematical effect on the decision boundary"
          ],
          correct_answer: "It shifts the hyperplane parallel to its normal vector without changing its orientation",
          hint: "Recall that w · x + b = 0 defines a plane; changing b shifts the intercept along the direction of w.",
          difficulty: "Easy"
        },
        {
          id: `gen_${timestamp}_2`,
          question: "Under the Perceptron Convergence Theorem, what condition guarantees that gradient descent will find a separating hyperplane?",
          options: [
            "The training dataset must be strictly linearly separable",
            "The inputs must be continuous real values between 0 and 1",
            "The learning rate must decrease to zero on each step",
            "The weights must be initialized to positive integers"
          ],
          correct_answer: "The training dataset must be strictly linearly separable",
          hint: "Rosenblatt proved that if a linear boundary exists, the perceptron learning rule is guaranteed to find it in finite steps.",
          difficulty: "Medium"
        },
        {
          id: `gen_${timestamp}_3`,
          question: "In geometric terms, what is the distance from the origin (0, 0) to the decision boundary defined by w · x + b = 0?",
          options: [
            "|b| / ||w||",
            "||w|| / |b|",
            "w · b",
            "(w1 + w2) / b^2"
          ],
          correct_answer: "|b| / ||w||",
          hint: "Think about projecting the vector from the origin to any point on the plane onto the unit normal vector w / ||w||.",
          difficulty: "Hard"
        }
      ];
    }

    if (lower.includes('activation')) {
      return [
        {
          id: `gen_${timestamp}_1`,
          question: "Which of the following is the primary mathematical reason Leaky ReLU was introduced?",
          options: [
            "To prevent the 'Dying ReLU' problem by ensuring a small non-zero gradient for negative inputs",
            "To constrain the activations strictly between -1 and 1",
            "To make the activation function computationally slower for benchmarking",
            "To ensure activations are always strictly zero"
          ],
          correct_answer: "To prevent the 'Dying ReLU' problem by ensuring a small non-zero gradient for negative inputs",
          hint: "Standard ReLU sets the gradient to exactly zero for negative values; what happens if a neuron gets stuck there?",
          difficulty: "Easy"
        },
        {
          id: `gen_${timestamp}_2`,
          question: "What is the maximum value of the derivative of the standard Sigmoid function σ'(z)?",
          options: [
            "0.25 (at z = 0)",
            "1.0 (at z = 0)",
            "0.5 (at z = 1)",
            "Infinity"
          ],
          correct_answer: "0.25 (at z = 0)",
          hint: "Calculate σ'(0) = σ(0)(1 - σ(0)) = 0.5 * 0.5.",
          difficulty: "Medium"
        },
        {
          id: `gen_${timestamp}_3`,
          question: "Why does multiplying gradients of 0.25 repeatedly through a 30-layer deep network cause severe vanishing gradients?",
          options: [
            "(0.25)^30 produces an infinitesimally small float, making weight updates in early layers virtually zero",
            "The network weights will oscillate between positive and negative infinity",
            "The loss function becomes non-differentiable",
            "The GPU runs out of registers"
          ],
          correct_answer: "(0.25)^30 produces an infinitesimally small float, making weight updates in early layers virtually zero",
          hint: "Exponential decay: numbers less than 1 raised to high powers decay rapidly towards zero.",
          difficulty: "Hard"
        }
      ];
    }

    if (lower.includes('backprop') || lower.includes('chain')) {
      return [
        {
          id: `gen_${timestamp}_1`,
          question: "In computational graphs, what does the backward pass calculate for an intermediate node z with children y1, y2?",
          options: [
            "dL/dz = (dL/dy1 * dy1/dz) + (dL/dy2 * dy2/dz)",
            "dL/dz = (dL/dy1) * (dL/dy2)",
            "dL/dz = dy1/dz - dy2/dz",
            "dL/dz = average(y1, y2)"
          ],
          correct_answer: "dL/dz = (dL/dy1 * dy1/dz) + (dL/dy2 * dy2/dz)",
          hint: "Apply the multivariate chain rule: sum the gradients over all branches originating from node z.",
          difficulty: "Medium"
        },
        {
          id: `gen_${timestamp}_2`,
          question: "What cache memory must be stored during the forward pass so that backpropagation can compute weight gradients?",
          options: [
            "The intermediate activations and pre-activation values z for each layer",
            "The entire future test set predictions",
            "The source code compiler symbols",
            "The uncompressed raw dataset on disk"
          ],
          correct_answer: "The intermediate activations and pre-activation values z for each layer",
          hint: "Notice that dL/dw = (dL/dz) * (dz/dw) = (dL/dz) * x_input. We need the forward input x_input to compute this derivative!",
          difficulty: "Hard"
        }
      ];
    }

    // General fallback for any other lesson topic
    return [
      {
        id: `gen_${timestamp}_1`,
        question: `What is the primary foundational goal introduced in "${lessonTitle}"?`,
        options: [
          "Establishing baseline mathematical principles and representations",
          "Ignoring all experimental validation",
          "Relying solely on heuristic rules without formalization",
          "Restricting data flow to purely discrete lookup tables"
        ],
        correct_answer: "Establishing baseline mathematical principles and representations",
        hint: `Consider how ${lessonTitle} builds core building blocks for subsequent complex models.`,
        difficulty: "Easy"
      },
      {
        id: `gen_${timestamp}_2`,
        question: `How does the core concept in "${lessonTitle}" handle non-linear structural complexities?`,
        options: [
          "Through parameterized transformation manifolds and optimization",
          "By discarding all non-linear features during preprocessing",
          "By fixing weights permanently to arbitrary constants",
          "By converting floating point numbers into single boolean flags"
        ],
        correct_answer: "Through parameterized transformation manifolds and optimization",
        hint: "Think about how deep learning architectures parameterize representations to capture intricate relationships.",
        difficulty: "Medium"
      },
      {
        id: `gen_${timestamp}_3`,
        question: `What trade-off arises when scaling the methods discussed in "${lessonTitle}" to massive datasets?`,
        options: [
          "Computational complexity and memory bandwidth versus representation generalization",
          "Loss values automatically drop to zero without any training",
          "Gradient descent becomes mathematically invalid",
          "All parameter weights become identical"
        ],
        correct_answer: "Computational complexity and memory bandwidth versus representation generalization",
        hint: "Scale brings expressive capacity, but requires careful management of compute and hardware constraints.",
        difficulty: "Hard"
      }
    ];
  }
}

export const apiService = new ApiService();

