import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from app.schemas import Course

load_dotenv()

# We use the OpenAI library but point it to Groq's servers using your Groq key
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_course_from_text(raw_text: str) -> Course:
    # Limit characters so we don't overwhelm the AI
    truncated_text = raw_text[:12000] 

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
                  "hint": "Helpful hint"
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
        "1. Generate EXACTLY ONE module containing EXACTLY ONE lesson to ensure stable formatting.\n"
        f"2. You MUST respond with ONLY a valid JSON object that EXACTLY matches this structure and uses these exact keys:\n{json_blueprint}"
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Source Material:\n\n{truncated_text}"}
        ],
        response_format={"type": "json_object"},
        max_tokens=3000
    )

    json_string = response.choices[0].message.content
    return Course.model_validate_json(json_string)

def get_socratic_response(context: str, user_message: str) -> str:
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": f"Act as a Socratic tutor. Guide the student without giving direct answers. Use this context: {context}"},
            {"role": "user", "content": user_message}
        ]
    )
    return response.choices[0].message.content