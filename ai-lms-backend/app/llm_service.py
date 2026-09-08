import os
import json
import uuid
from typing import List
from openai import OpenAI
from dotenv import load_dotenv
from app.schemas import Course, QuizQuestion

load_dotenv()

_client = None

def get_groq_client():
    global _client
    if _client is not None:
        return _client
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        groq_key = "placeholder_key"
    _client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=groq_key
    )
    return _client

def generate_course_from_text(raw_text: str) -> Course:
    truncated_text = raw_text[:12000]
    if len(truncated_text.strip()) < 30:
        truncated_text = f"Educational study material: {truncated_text}\nComprehensive concepts, architecture, and principles."

    json_blueprint = """
    {
      "course_title": "Name of course",
      "overview": "Course summary",
      "modules": [
        {
          "module_id": "mod_1",
          "title": "Module title",
          "description": "Module description",
          "lessons": [
            {
              "lesson_id": "les_1",
              "title": "Lesson title",
              "summary": "Brief summary",
              "content_markdown": "Detailed markdown content",
              "key_takeaways": ["Point 1", "Point 2"],
              "quiz": [
                {
                  "id": "q1",
                  "question": "Question text?",
                  "options": ["A", "B", "C", "D"],
                  "correct_answer": "Exact text of correct option",
                  "hint": "Helpful hint",
                  "difficulty": "Easy"
                }
              ]
            }
          ],
          "concept_nodes": [
            {
              "node_id": "concept_1",
              "label": "Concept Name",
              "dependencies": ["other_concept_id"]
            }
          ]
        }
      ]
    }
    """

    system_prompt = (
        "You are an expert curriculum designer. Extract educational modules from the following text. "
        "CRITICAL RULES: \n"
        "1. Generate EXACTLY ONE module containing at least one high-quality lesson to ensure stable formatting.\n"
        "2. For each quiz question, assign an appropriate difficulty: 'Easy', 'Medium', or 'Hard'.\n"
        f"3. You MUST respond with ONLY a valid JSON object that EXACTLY matches this structure and uses these exact keys:\n{json_blueprint}"
    )

    models_to_try = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
    last_err = None

    client = get_groq_client()
    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Source Material:\n\n{truncated_text}"}
                ],
                response_format={"type": "json_object"},
                max_tokens=3000
            )

            json_string = response.choices[0].message.content or "{}"
            cleaned = json_string.strip()
            if cleaned.startswith("```"):
                parts = cleaned.split("```")
                if len(parts) >= 2:
                    cleaned = parts[1]
                    if cleaned.startswith("json"):
                        cleaned = cleaned[4:]
            cleaned = cleaned.strip()

            return Course.model_validate_json(cleaned)
        except Exception as e:
            last_err = e
            print(f"Model {model_name} failed: {e}. Trying next fallback...")

    raise last_err or RuntimeError("Failed to generate course from text.")

def generate_quiz_for_lesson(lesson_title: str, lesson_content: str, num_questions: int = 2) -> List[QuizQuestion]:
    prompt = f"""
    Generate {num_questions} fresh, thoughtful multiple-choice questions for the lesson "{lesson_title}".
    Lesson Content excerpt:
    {lesson_content[:4000]}

    Requirements:
    - Include exactly 4 distinct options per question.
    - Indicate the exact correct_answer.
    - Provide a helpful Socratic hint that guides the student without giving away the answer.
    - Include a "difficulty" property set to "Easy", "Medium", or "Hard" (provide a mix of difficulties).

    Respond with ONLY a JSON object containing a "questions" array:
    {{
      "questions": [
        {{
          "id": "q_{str(uuid.uuid4())[:8]}",
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "hint": "Guiding hint",
          "difficulty": "Easy"
        }}
      ]
    }}
    """

    client = get_groq_client()
    models_to_try = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]
    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are an expert assessment educator creating multiple-choice questions with difficulty tags."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1500
            )
            data = json.loads(response.choices[0].message.content or "{}")
            questions_data = data.get("questions", [])
            questions = []
            for item in questions_data:
                if not item.get("id"):
                    item["id"] = f"q_{uuid.uuid4().hex[:6]}"
                if not item.get("difficulty"):
                    item["difficulty"] = "Medium"
                questions.append(QuizQuestion(**item))
            if questions:
                return questions
        except Exception as e:
            print(f"Quiz generation with {model_name} failed: {e}")

    # Fallback default questions if LLM is unavailable
    return [
        QuizQuestion(
            id=f"q_{uuid.uuid4().hex[:6]}",
            question=f"Which key conceptual principle is demonstrated in '{lesson_title}'?",
            options=[
                "Linear independence of internal features",
                "Non-linear mapping enabling higher capacity representations",
                "Strict adherence to fixed convex optimization without bounds",
                "Deterministic weight initialization with uniform bias"
            ],
            correct_answer="Non-linear mapping enabling higher capacity representations",
            hint="Consider how complex representations require transformations beyond simple affine combinations.",
            difficulty="Medium"
        ),
        QuizQuestion(
            id=f"q_{uuid.uuid4().hex[:6]}",
            question=f"What primary engineering advantage does the architecture described in '{lesson_title}' provide?",
            options=[
                "Reduces memory consumption to zero during forward inference",
                "Provides mathematical tractability and systematic error backpropagation",
                "Eliminates the necessity for training data",
                "Forces all gradient updates to zero"
            ],
            correct_answer="Provides mathematical tractability and systematic error backpropagation",
            hint="Think about how optimization algorithms navigate the loss surface systematically.",
            difficulty="Hard"
        )
    ]

def get_socratic_response(context: str, user_message: str) -> str:
    client = get_groq_client()
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": f"Act as a Socratic tutor. Guide the student without giving direct answers. Use this context: {context}"},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content