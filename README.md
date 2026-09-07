# AI-Powered Socratic LMS (Interactive Learning Management System)

An AI-driven interactive educational platform that transforms static course materials and lecture slides (PDFs) into structured, engaging, modular courses featuring Socratic tutoring, concept maps, and dynamic quizzes.

---

## Architecture Overview

- **Frontend (`ai-lms-frontend/`)**: Modern React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite.
  - Interactive PDF dropzone with real-time pipeline status animation.
  - Split-screen layout: Modular lesson reader side-by-side with an AI Socratic Tutor.
  - Concept graph visualization and interactive multiple-choice quizzes with celebratory feedback.
  - Seamless reverse proxy configuring API calls directly to the FastAPI server.
- **Backend (`ai-lms-backend/`)**: FastAPI, Python 3.12, PyMuPDF, Groq LLM API, ChromaDB RAG Engine.
  - Ingestion pipeline extracting structured text from uploaded PDFs.
  - Automated course and syllabus generation with lessons, takeaways, concept tags, and quizzes.
  - Socratic dialogue chat engine providing hints, guiding questions, and conceptual reinforcement.

---

## Quickstart Guide

### 1. Backend Setup

```bash
cd ai-lms-backend

# 1. Create and activate a Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
# Copy .env.example to .env and insert your API keys
cp .env.example .env

# 4. Start the FastAPI server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend server will run at `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
cd ai-lms-frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend application will be live at `http://127.0.0.1:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status check |
| `POST` | `/api/upload` | Upload PDF file and extract text contents |
| `POST` | `/api/generate-course` | Generate interactive course curriculum and quizzes |
| `POST` | `/api/chat` | Ask Socratic questions with lesson context |
