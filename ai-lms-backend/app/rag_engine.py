import os
import pymupdf
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

API_KEY = os.getenv("GEMINI_API_KEY")
_client = None

def get_gemini_client():
    global _client, API_KEY
    if _client is not None:
        return _client
    if not API_KEY:
        API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        raise ValueError("❌ GEMINI_API_KEY missing from .env environment! Please add your GEMINI_API_KEY to ai-lms-backend/.env")
    from google import genai
    _client = genai.Client(api_key=API_KEY)
    return _client

# Vector DB setup
chroma_client = chromadb.PersistentClient(path="./chroma_db")
emb_fn = embedding_functions.DefaultEmbeddingFunction()

collection = chroma_client.get_or_create_collection(
    name="lms_materials",
    embedding_function=emb_fn
)

def process_pdf(pdf_path: str, chunk_size: int = 250, overlap: int = 30) -> dict:
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Cannot find PDF at path: {pdf_path}")

    doc = pymupdf.open(pdf_path)
    chunks, ids, metadatas = [], [], []
    chunk_counter = 0

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        if not text:
            continue
        
        words = text.split()
        for i in range(0, len(words), max(1, chunk_size - overlap)):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            ids.append(f"{os.path.basename(pdf_path)}_p{page_num}_c{chunk_counter}")
            metadatas.append({
                "source": os.path.basename(pdf_path),
                "page": page_num,
                "chunk_id": chunk_counter
            })
            chunk_counter += 1

    if chunks:
        collection.upsert(documents=chunks, ids=ids, metadatas=metadatas)

    return {"status": "success", "total_chunks": len(chunks), "pages_processed": len(doc)}

def retrieve_context(query: str, n_results: int = 3) -> list[dict]:
    results = collection.query(query_texts=[query], n_results=n_results)
    retrieved_docs = results.get('documents', [[]])[0]
    retrieved_meta = results.get('metadatas', [[]])[0]
    
    formatted_context = []
    for doc, meta in zip(retrieved_docs, retrieved_meta):
        formatted_context.append({
            "text": doc,
            "page": meta.get("page", 1),
            "source": meta.get("source", "Document")
        })
    return formatted_context

def ask_socratic_tutor(user_query: str) -> dict:
    context_data = retrieve_context(user_query)
    context_str = "\n\n".join([f"[Page {c['page']}]: {c['text']}" for c in context_data])

    prompt = f"""
You are an encouraging Socratic AI Tutor on an interactive LMS platform.
Base your response strictly on the provided Course Context.

Guidelines:
1. Explain the underlying key concept simply without directly giving away the final solution if it's a problem.
2. Reference the relevant page numbers from the context (e.g., "As mentioned on Page 3...").
3. End with 1 interactive, probing question that forces the student to think critically.

Course Context:
{context_str}

Student Question: {user_query}
"""
    citations = list(set([c["page"] for c in context_data if "page" in c]))
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {
            "answer": response.text,
            "citations": citations
        }
    except Exception as e:
        print(f"[Notice] Gemini tutor API unavailable ({e}). Using document context tutor fallback.")
        top_snippet = context_data[0]["text"] if context_data else "the uploaded course material"
        top_page = citations[0] if citations else 1
        return {
            "answer": (
                f"Let's reason through this using your course material!\n\n"
                f"Referencing slide / page {top_page}:\n"
                f"> \"{top_snippet[:260].strip()}...\"\n\n"
                f"Notice how the core concept is presented here. What do you think happens if this mechanism is altered or executed?"
            ),
            "citations": citations
        }

def generate_course_outline(topic: str) -> str:
    context_data = retrieve_context(topic, n_results=5)
    context_str = "\n\n".join([c["text"] for c in context_data])
    
    prompt = f"""
You are an expert curriculum designer. Based on the following textbook context, 
generate a structured 4-Week Module Outline for a course on '{topic}'.
Format using clear bullet points with Module Titles, Key Learning Objectives, and Page References.

Course Context:
{context_str}
"""
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"# 4-Week Module Outline for {topic}\n\n- **Week 1: Core Foundations & Terminology**\n- **Week 2: Architectural Patterns & Syntax**\n- **Week 3: Practical Implementation & Error Handling**\n- **Week 4: Advanced Optimizations & Review**"

def generate_quiz(topic: str, num_questions: int = 3) -> str:
    context_data = retrieve_context(topic, n_results=4)
    context_str = "\n\n".join([c["text"] for c in context_data])
    
    prompt = f"""
Generate a {num_questions}-question multiple-choice quiz based strictly on this context.
For each question, provide 4 options (A, B, C, D) and specify the correct answer with a short explanation citing the page.

Course Context:
{context_str}
"""
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Assessment Quiz for {topic}: Review the core principles and test edge cases."

if __name__ == "__main__":
    print("🚀 Running full RAG engine pipeline test...\n")
    
    pdf_path = "sample.pdf" if os.path.exists("sample.pdf") else "backend/sample.pdf"
    
    if os.path.exists(pdf_path):
        print("1. Processing PDF...")
        ingest_res = process_pdf(pdf_path)
        print("Ingestion Result:", ingest_res)
        print("-" * 50)
        
        print("2. Testing Socratic AI Tutor...")
        tutor_res = ask_socratic_tutor("What are the primary topics covered?")
        print("Answer:\n", tutor_res["answer"])
        print("Citations (Pages):", tutor_res["citations"])
        print("-" * 50)
        
        print("3. Generating Course Outline...")
        outline_res = generate_course_outline("Overview")
        print("Outline:\n", outline_res)
        print("-" * 50)
        
        print("4. Generating Assessment Quiz...")
        quiz_res = generate_quiz("Overview", num_questions=2)
        print("Quiz:\n", quiz_res)
    else:
        print(f"⚠️ Please add a PDF to '{pdf_path}' to run the functional tests.")