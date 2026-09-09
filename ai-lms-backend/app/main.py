import os
import uuid
import pymupdf
from typing import Dict, List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Load .env variables
load_dotenv(override=True)
from app.schemas import (
    UploadResponse, 
    GenerateCourseRequest, 
    Course, 
    Module, 
    ChatRequest, 
    ChatResponse, 
    ChatMessageSchema,
    SaveChatMessageRequest,
    ChatHistoryResponse,
    ClearChatRequest,
    QuizQuestion, 
    RegenerateQuizRequest
)
from app.rag_engine import process_pdf, ask_socratic_tutor, generate_course_outline
from app.pdf_parser import extract_text_from_pdf
from app.llm_service import generate_course_from_text, get_socratic_response, generate_quiz_for_lesson
from app.database import (
    init_db,
    add_chat_message,
    get_chat_messages,
    clear_chat_messages
)

def safe_print(msg: str):
    try:
        print(msg)
    except Exception:
        try:
            print(str(msg).encode('ascii', 'replace').decode('ascii'))
        except Exception:
            pass

app = FastAPI(title="MindForge AI LMS API")

@app.on_event("startup")
def on_startup():
    try:
        init_db()
        safe_print("MindForge SQLite Database initialized successfully.")
    except Exception as e:
        safe_print(f"Warning: Database initialization error: {e}")

# This allows your frontend code to talk to your backend without security blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary memory storage for the hackathon
document_store: Dict[str, str] = {}
course_store: Dict[str, Course] = {}

@app.get("/")
@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MindForge AI LMS API"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Must be a PDF document ending in .pdf.")
    
    file_bytes = await file.read()
    if not file_bytes or len(file_bytes) == 0:
        raise HTTPException(
            status_code=400, 
            detail="The uploaded PDF is empty (0 bytes). Please upload a valid PDF document with text."
        )
    
    file_path = f"temp_{os.path.basename(file.filename)}"
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
    
    # Verify PDF is readable and extract text
    try:
        doc = pymupdf.open(file_path)
        extracted_pages = []
        for page in doc:
            t = page.get_text().strip()
            if t:
                extracted_pages.append(t)
        extracted_text = "\n\n".join(extracted_pages).strip()
    except pymupdf.EmptyFileError:
        raise HTTPException(
            status_code=400,
            detail="Cannot parse empty PDF. Please upload a PDF file containing course content."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {str(e)}")

    if not extracted_text:
        # If it's a scanned document with minimal text, fallback to filename or placeholder
        extracted_text = f"Curriculum extracted from {file.filename}. Key topics and domain foundations."

    # Process chunks into ChromaDB using RAG engine
    try:
        process_pdf(file_path)
    except Exception as e:
        safe_print(f"Warning: ChromaDB RAG processing encountered: {e}")

    task_id = str(uuid.uuid4())
    # Save the actual extracted text so LLM generates a curriculum from the real content
    document_store[task_id] = extracted_text
    
    return UploadResponse(task_id=task_id, message="Upload and RAG ingestion successful.")

@app.post("/api/generate-course/mock", response_model=Course)
def generate_course_dummy():
    """Give this URL to the frontend team so they can build UI immediately while you test."""
    return Course(
        course_title="Dummy Course: Introduction to Physics",
        overview="A hardcoded course for UI testing.",
        modules=[
            Module(
                module_id="mod_1",
                title="Kinematics",
                description="Motion in one dimension.",
                lessons=[],
                concept_nodes=[]
            )
        ]
    )

@app.post("/api/generate-course", response_model=Course)
async def generate_course(payload: GenerateCourseRequest):
    text = document_store.get(payload.task_id)
    if not text:
        raise HTTPException(status_code=404, detail="Task ID not found. Upload a PDF first.")
    
    # If we already generated this course, return it immediately to save time
    if payload.task_id in course_store:
        return course_store[payload.task_id]

    # Otherwise, ask the AI to generate it
    try:
        course = generate_course_from_text(text)
    except Exception as e:
        safe_print(f"LLM course generation error: {e}")
        # Try Socratic fallback if Groq API fails
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

    course_store[payload.task_id] = course
    return course

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    session_id = payload.session_id or "default_session"
    user_id = payload.user_id or "default_user"
    lesson_id = payload.lesson_id

    # 1. Automatically save user message to chat history
    try:
        add_chat_message(
            session_id=session_id,
            user_id=user_id,
            role="user",
            content=payload.user_message,
            lesson_id=lesson_id
        )
    except Exception as db_err:
        safe_print(f"Warning: Failed to save user message to DB: {db_err}")

    # 2. Generate Socratic AI response
    citations = None
    try:
        from app.socratic_engine import ask_socratic_tutor_unified
        tutor_result = ask_socratic_tutor_unified(
            user_query=payload.user_message,
            lesson_context=payload.lesson_context,
            history=payload.history
        )
        reply_text = tutor_result.get("answer", "")
        citations = tutor_result.get("citations", [1])
    except Exception as e:
        safe_print(f"Unified tutor notice, using fallback: {e}")
        try:
            reply_text = get_socratic_response(payload.lesson_context, payload.user_message)
            citations = [1]
        except Exception as e2:
            reply_text = (
                "Let's discover this together. Looking at your current lesson, "
                "which specific variable, line of code, or concept feels most counter-intuitive right now?"
            )
            citations = [1]

    # 3. Automatically save assistant reply to chat history
    msg_id = None
    ts = None
    try:
        saved = add_chat_message(
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=reply_text,
            citations=citations,
            lesson_id=lesson_id
        )
        msg_id = saved.get("id")
        ts = saved.get("timestamp")
    except Exception as db_err:
        safe_print(f"Warning: Failed to save tutor reply to DB: {db_err}")

    return ChatResponse(
        reply=reply_text,
        message_id=msg_id,
        timestamp=ts,
        citations=citations
    )

@app.get("/api/chat/history", response_model=ChatHistoryResponse)
def get_history(
    session_id: str = Query(default="default_session", description="Session identifier"),
    lesson_id: Optional[str] = Query(default=None, description="Optional lesson filter"),
    limit: int = Query(default=200, ge=1, le=500, description="Max messages to return")
):
    try:
        messages = get_chat_messages(session_id=session_id, lesson_id=lesson_id, limit=limit)
        return ChatHistoryResponse(
            session_id=session_id,
            messages=[ChatMessageSchema(**m) for m in messages],
            count=len(messages)
        )
    except Exception as e:
        safe_print(f"Error fetching chat history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve chat history: {str(e)}")

@app.post("/api/chat/save", response_model=ChatMessageSchema)
def save_chat_message_endpoint(payload: SaveChatMessageRequest):
    try:
        saved = add_chat_message(
            session_id=payload.session_id or "default_session",
            user_id=payload.user_id or "default_user",
            role=payload.role,
            content=payload.content,
            citations=payload.citations,
            timestamp=payload.timestamp,
            lesson_id=payload.lesson_id,
            msg_id=payload.id
        )
        return ChatMessageSchema(**saved)
    except Exception as e:
        safe_print(f"Error saving chat message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")

@app.delete("/api/chat/history")
def clear_history(
    session_id: str = Query(default="default_session", description="Session identifier to clear"),
    lesson_id: Optional[str] = Query(default=None, description="Optional lesson filter")
):
    try:
        deleted_count = clear_chat_messages(session_id=session_id, lesson_id=lesson_id)
        return {
            "status": "success",
            "session_id": session_id,
            "lesson_id": lesson_id,
            "deleted_count": deleted_count
        }
    except Exception as e:
        safe_print(f"Error clearing chat history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear chat history: {str(e)}")


@app.post("/api/regenerate-quiz", response_model=List[QuizQuestion])
async def regenerate_quiz(payload: RegenerateQuizRequest):
    try:
        num_q = payload.num_questions or 2
        questions = generate_quiz_for_lesson(
            lesson_title=payload.lesson_title,
            lesson_content=payload.lesson_content or "",
            num_questions=num_q
        )
        return questions
    except Exception as e:
        safe_print(f"Quiz regeneration error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")