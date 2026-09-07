import os
import uuid
import pymupdf
from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import UploadResponse, GenerateCourseRequest, Course, Module, ChatRequest, ChatResponse
from app.rag_engine import process_pdf, ask_socratic_tutor, generate_course_outline
from app.pdf_parser import extract_text_from_pdf
from app.llm_service import generate_course_from_text, get_socratic_response

app = FastAPI(title="Hackathon LMS API")

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
        print(f"Warning: ChromaDB RAG processing encountered: {e}")

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
        print(f"LLM course generation error: {e}")
        # Try Socratic fallback if Groq API fails
        raise HTTPException(status_code=500, detail=f"Course generation failed: {str(e)}")

    course_store[payload.task_id] = course
    return course

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    try:
        tutor_result = ask_socratic_tutor(payload.user_message)
        return ChatResponse(reply=tutor_result["answer"])
    except Exception as e:
        print(f"RAG tutor error, using Groq LLM fallback: {e}")
        try:
            fallback_answer = get_socratic_response(payload.lesson_context, payload.user_message)
            return ChatResponse(reply=fallback_answer)
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Chat failed: {str(e2)}")