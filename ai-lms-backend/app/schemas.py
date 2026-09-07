from typing import List, Optional
from pydantic import BaseModel, Field

class ConceptGraphNode(BaseModel):
    node_id: str = Field(description="Unique snake_case identifier, e.g., 'machine_learning'")
    label: str = Field(description="Display name of the concept")
    dependencies: List[str] = Field(
        default_factory=list,
        description="List of node_ids that must be understood before this topic"
    )

class QuizQuestion(BaseModel):
    id: str = Field(description="Unique identifier, e.g., 'q1'")
    question: str
    options: List[str] = Field(description="Exactly 4 multiple choice options")
    correct_answer: str = Field(description="The exact text of the correct option")
    hint: str = Field(description="A guiding Socratic hint")

class Lesson(BaseModel):
    lesson_id: str = Field(description="Unique identifier, e.g., 'lesson_1'")
    title: str
    summary: str
    content_markdown: str = Field(description="Detailed lesson content formatted in Markdown")
    key_takeaways: List[str]
    quiz: List[QuizQuestion]

class Module(BaseModel):
    module_id: str = Field(description="Unique identifier, e.g., 'mod_1'")
    title: str
    description: str
    lessons: List[Lesson]
    concept_nodes: List[ConceptGraphNode]

class Course(BaseModel):
    course_title: str
    overview: str
    modules: List[Module]

class UploadResponse(BaseModel):
    task_id: str
    message: str

class GenerateCourseRequest(BaseModel):
    task_id: str

class ChatRequest(BaseModel):
    lesson_context: str
    user_message: str
    history: List[dict] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str