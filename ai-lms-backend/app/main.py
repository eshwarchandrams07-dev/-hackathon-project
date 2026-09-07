import uuid
from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import UploadResponse, GenerateCourseRequest, Course, Module, ChatRequest, ChatResponse
from app.rag_engine import process_pdf, ask_socratic_tutor, generate_course_outline
from app.pdf_parser import extract_text_from_pdf
from app.llm_service import generate_course_from_text, get_socratic_response

app = FastAPI(title="Hackathon LMS API")

# This allows your friend's frontend code to talk to your backend without security blocks
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
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Must be a PDF.")
    
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Process chunks into ChromaDB using your friend's RAG engine
    result = process_pdf(file_path)
    task_id = str(uuid.uuid4())
    document_store[task_id] = file_path
    
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
    course = generate_course_from_text(text)
    course_store[payload.task_id] = course
    return course

@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    tutor_result = ask_socratic_tutor(payload.user_message)
    return ChatResponse(reply=tutor_result["answer"])