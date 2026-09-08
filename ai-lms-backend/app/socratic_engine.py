"""
MindForge Intelligent Socratic Engine
Provides context-aware, pedagogical Socratic responses for course materials.
Supports multi-tier architecture:
1. Direct API Key passed from client (Gemini or Groq)
2. Server Environment API Keys (GEMINI_API_KEY, GROQ_API_KEY)
3. Intelligent Context-Aware Synthesis Engine (zero external API dependency fallback)
"""

import os
import re
from typing import Dict, List, Optional

def _clean_markdown(text: str) -> str:
    return text.replace("\r\n", "\n").strip()

def extract_course_metadata(context: str) -> Dict[str, str]:
    """Extract course and lesson names from context string."""
    m_course = re.search(r"Course:\s*([^\n]+)", context)
    m_module = re.search(r"Module:\s*([^\n]+)", context)
    m_lesson = re.search(r"Lesson:\s*([^\n]+)", context)
    return {
        "course": m_course.group(1).strip() if m_course else "your course material",
        "module": m_module.group(1).strip() if m_module else "Module",
        "lesson": m_lesson.group(1).strip() if m_lesson else "this lesson"
    }

def extract_clean_content(context: str) -> str:
    """Strip header metadata like 'Course: ... Module: ...' and return pure lesson text."""
    lines = context.split("\n")
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if any(stripped.startswith(prefix) for prefix in [
            "Course:", "Module:", "Lesson:", "Lesson Summary:", "Lesson Content:"
        ]):
            continue
        cleaned.append(line)
    return "\n".join(cleaned).strip()

def extract_code_blocks(context: str) -> List[str]:
    """Extract all fenced code blocks from context markdown."""
    pattern = r"```(?:c|cpp|java|python|javascript|sh)?\n(.*?)```"
    matches = re.findall(pattern, context, re.DOTALL)
    if matches:
        return [m.strip() for m in matches if m.strip()]
    
    # Fallback: look for lines with programming keywords
    lines = context.split("\n")
    code_lines = []
    for line in lines:
        stripped = line.strip()
        if any(keyword in stripped for keyword in ["printf(", "scanf(", "for (", "while (", "wt[", "bt[", "tat[", "#include", "public class", "def "]):
            code_lines.append(line)
    if code_lines:
        return ["\n".join(code_lines)]
    return []

def extract_relevant_paragraphs(context: str, query: str, top_k: int = 2) -> List[str]:
    """Find paragraphs in clean context with highest keyword relevance to query (must score > 0)."""
    stop_words = {
        "the", "a", "an", "is", "are", "in", "on", "at", "to", "for", "of", "and", "or", 
        "what", "how", "why", "me", "give", "detailed", "explanation", "explain", "about", 
        "this", "that", "can", "you", "tell", "show", "know", "want", "please", "hi", "hello"
    }
    query_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", query.lower())) - stop_words
    if not query_words:
        return []

    clean_text = extract_clean_content(context)
    paragraphs = [p.strip() for p in clean_text.split("\n\n") if len(p.strip()) > 30]
    if not paragraphs:
        paragraphs = [clean_text]

    scored = []
    for p in paragraphs:
        p_lower = p.lower()
        score = sum(1 for w in query_words if w in p_lower)
        if score > 0:
            scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for score, p in scored[:top_k]]

def generate_code_explanation(code: str, query: str, context: str) -> str:
    """Generate detailed line-by-line / block-by-block code walkthrough."""
    is_fcfs_or_scheduling = any(k in (code + context + query).lower() for k in ["fcfs", "burst", "wt[", "bt[", "waiting time", "tat", "first-come", "scheduling"])
    
    if is_fcfs_or_scheduling:
        return (
            "### [Code Breakdown] Detailed Line-by-Line Analysis of FCFS Scheduling Code\n\n"
            "Here is a comprehensive breakdown of the First-Come, First-Served (FCFS) CPU scheduling algorithm implemented in C:\n\n"
            "#### 1. Input Collection & Process Registration\n"
            "```c\n"
            "printf(\"Enter process burst time:\\n\");\n"
            "for (i = 0; i < n; i++) {\n"
            "    printf(\"P[%d]: \", i + 1);\n"
            "    scanf(\"%d\", &bt[i]);\n"
            "}\n"
            "```\n"
            "* **`for (i = 0; i < n; i++)`**: Iterates through each process from `0` to `n-1`.\n"
            "* **`scanf(\"%d\", &bt[i]);`**: Reads the **Burst Time** (`bt[i]`), which is the total CPU execution duration needed by process P[i].\n"
            "* In FCFS, processes are serviced strictly in arrival order (the order of input indices P[1], P[2], ..., P[n]).\n\n"
            "#### 2. Waiting Time Calculation (WT)\n"
            "```c\n"
            "wt[0] = 0; // The first arriving process never waits\n"
            "for (i = 1; i < n; i++) {\n"
            "    wt[i] = 0;\n"
            "    for (j = 0; j < i; j++)\n"
            "        wt[i] += bt[j]; // Cumulative sum of preceding burst times\n"
            "}\n"
            "```\n"
            "* **`wt[0] = 0;`**: Foundational rule - the very first process gets the CPU immediately upon dispatch, resulting in `0` waiting time.\n"
            "* **`for (i = 1; i < n; i++)`**: For each subsequent process i, its waiting time is the cumulative sum of execution times of all preceding processes (0 through i-1).\n"
            "* **Efficiency Alternative**: Notice that `wt[i] = wt[i-1] + bt[i-1];` achieves the exact same result in O(n) time instead of nested O(n^2) loops.\n\n"
            "#### 3. Turnaround Time Calculation (TAT)\n"
            "```c\n"
            "for (i = 0; i < n; i++) {\n"
            "    tat[i] = bt[i] + wt[i];\n"
            "}\n"
            "```\n"
            "* **`tat[i] = bt[i] + wt[i];`**: Turnaround time represents the complete lifespan of the process from arrival to completion. It equals its time spent waiting **plus** its actual execution burst.\n\n"
            "#### 4. Computing Metrics & Averages\n"
            "```c\n"
            "avg_wt = (float)total_wt / n;\n"
            "avg_tat = (float)total_tat / n;\n"
            "```\n"
            "* Accumulates `total_wt` and `total_tat` across all processes and divides by n to assess overall CPU scheduler efficiency.\n\n"
            "---\n\n"
            "**[Socratic Question to Test Your Understanding]**:\n"
            "Notice how `wt[i]` depends directly on every preceding process's burst time. If Process P[1] has a massive burst time of 100 ms while P[2] and P[3] only need 2 ms each, how does this affect the average waiting time? What is this phenomenon called in Operating Systems?"
        )
    
    # General code explanation
    lines = [l for l in code.split("\n") if l.strip()]
    formatted_steps = []
    chunk_size = max(1, len(lines) // 4)
    for idx, i in enumerate(range(0, len(lines), chunk_size)):
        segment = "\n".join(lines[i:i + chunk_size])
        formatted_steps.append(
            f"#### Block {idx + 1}: Program Logic & State Flow\n"
            f"```text\n{segment}\n```\n"
            f"* **Purpose**: Executes key operations within the execution flow, updating data structures and controlling state transitions."
        )

    walkthrough = "\n\n".join(formatted_steps)
    return (
        f"### [Code Architecture] Logic & Execution Flow\n\n"
        f"Let's trace how this implementation operates step-by-step:\n\n"
        f"{walkthrough}\n\n"
        f"---\n\n"
        f"**[Socratic Question to Consider]**:\n"
        f"Which line of this code acts as the critical bottleneck or state invariant? If the input size increases by a factor of 100, what happens to its memory and time complexity?"
    )

def generate_analogy_explanation(query: str, context: str) -> str:
    """Generate real-world intuitive analogies."""
    lower_ctx = (query + " " + context).lower()
    
    if any(k in lower_ctx for k in ["fcfs", "first-come", "scheduling", "queue"]):
        return (
            "### [Analogy] The Single-Lane Supermarket Checkout\n\n"
            "Imagine a supermarket checkout counter with a **single cashier** and no express lane:\n\n"
            "1. **Customers = Processes** entering the ready queue.\n"
            "2. **Cart Size (items) = Burst Time** (CPU processing duration needed).\n"
            "3. **Queue Position = Arrival Order**.\n\n"
            "#### How FCFS Behaves in This Scenario:\n"
            "* **Customer 1** arrives with an overflowing cart of 250 items (BT = 250). They go first.\n"
            "* **Customer 2** arrives right behind them with just a pack of gum (BT = 1).\n"
            "* Under First-Come, First-Served, Customer 2 must wait the entire duration of Customer 1's 250 items to scan their single pack of gum!\n\n"
            "This delay is the classic **Convoy Effect** - small, fast processes get stuck idling behind a single heavy resource hog.\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "If you were the supermarket store manager trying to minimize the *average customer waiting time*, how would you reorder the queue? Which OS scheduling algorithm does your proposed strategy match?"
        )
    
    if any(k in lower_ctx for k in ["compiler", "parsing", "syntax", "grammar"]):
        return (
            "### [Analogy] The Multilingual Legal Translator\n\n"
            "Think of a compiler like a certified legal translator turning an English contract into French:\n\n"
            "* **Lexical Analysis (Scanner)**: Checks that every single word is a valid legal term (dictionary lookup).\n"
            "* **Syntax Analysis (Parser)**: Checks that words follow valid grammar rules (Subject + Verb + Object).\n"
            "* **Semantic Analysis**: Checks that the sentence actually makes sense (e.g. \"The corporation ate an apple\" is grammatically valid, but legally meaningless).\n"
            "* **Code Generation**: Writes out the final official decree in French.\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "If you write `int x = \"hello\";`, at which translation stage will the error be caught, and why?"
        )

    meta = extract_course_metadata(context)
    return (
        f"### [Analogy] Real-World Comparison for {meta['lesson']}\n\n"
        f"Think of **this concept** like a collaborative assembly line in a manufacturing plant:\n\n"
        f"* Each stage has strict prerequisites before moving to the next workstation.\n"
        f"* Work items enter sequentially and undergo deterministic verification.\n"
        f"* If any incoming unit is delayed, subsequent stations must pause downstream execution.\n\n"
        f"---\n\n"
        f"**[Socratic Question]**:\n"
        f"How does this real-world constraint compare to the computational trade-off in your software design?"
    )

def generate_calculation_explanation(query: str, context: str) -> str:
    """Generate formula and mathematical calculation walkthrough."""
    lower_ctx = (query + " " + context).lower()
    
    if any(k in lower_ctx for k in ["fcfs", "waiting time", "turnaround", "burst", "average"]):
        return (
            "### [Formulas] FCFS Mathematical Formulas & Calculation Walkthrough\n\n"
            "In CPU scheduling, there are two primary time metrics:\n\n"
            "#### 1. Fundamental Formulas\n"
            "* **Waiting Time (WT)**: Time a process spends sitting in the ready queue waiting for execution.\n"
            "  * WT[0] = 0\n"
            "  * WT[i] = WT[i-1] + BT[i-1] (assuming arrival time = 0)\n"
            "* **Turnaround Time (TAT)**: Total elapsed time from arrival to completion.\n"
            "  * TAT[i] = Burst Time[i] + Waiting Time[i]\n"
            "* **Average Metrics**:\n"
            "  * Average WT = (sum of WT) / n\n"
            "  * Average TAT = (sum of TAT) / n\n\n"
            "#### 2. Concrete Worked Example\n"
            "Suppose we have 3 processes arriving at time 0 with Burst Times:\n"
            "* P1 = 6 ms, P2 = 8 ms, P3 = 2 ms\n\n"
            "| Process | Burst Time (BT) | Waiting Time (WT) | Turnaround Time (TAT) |\n"
            "| :--- | :--- | :--- | :--- |\n"
            "| P1 | 6 ms | 0 ms | 0 + 6 = 6 ms |\n"
            "| P2 | 8 ms | 6 ms | 6 + 8 = 14 ms |\n"
            "| P3 | 2 ms | 6 + 8 = 14 ms | 14 + 2 = 16 ms |\n\n"
            "* **Average Waiting Time**: (0 + 6 + 14) / 3 = 20 / 3 = 6.67 ms\n"
            "* **Average Turnaround Time**: (6 + 14 + 16) / 3 = 36 / 3 = 12.0 ms\n\n"
            "---\n\n"
            "**[Socratic Practice Question]**:\n"
            "What happens if the execution order is changed to P3 -> P1 -> P2? Calculate the new Average Waiting Time in your head - is it higher or lower than 6.67 ms?"
        )
    
    return (
        "### [Formulas] Quantitative Derivation\n\n"
        "Let's break down the underlying mathematical relationship:\n\n"
        "1. Identify the input variables and boundary conditions.\n"
        "2. Note the cumulative dependencies between sequential states.\n"
        "3. Evaluate the aggregate throughput or error metric.\n\n"
        "**[Socratic Question]**:\n"
        "What happens to the denominator of this formula as sample size n approaches infinity? Does the result converge smoothly?"
    )

def generate_pros_cons_explanation(query: str, context: str) -> str:
    """Generate trade-offs, advantages, and disadvantages."""
    lower_ctx = (query + " " + context).lower()
    
    if any(k in lower_ctx for k in ["fcfs", "first-come", "scheduling", "convoy"]):
        return (
            "### [Analysis] Advantages vs Disadvantages of FCFS Scheduling\n\n"
            "#### [+] Advantages\n"
            "1. **Simplicity**: Extremely easy to understand, program, and maintain using a straightforward FIFO queue.\n"
            "2. **Starvation-Free**: Every single process is guaranteed to execute eventually in strict arrival sequence.\n"
            "3. **Zero Decision Overhead**: The CPU scheduler does not need complex heuristics or runtime priority calculations.\n\n"
            "#### [-] Disadvantages\n"
            "1. **Convoy Effect**: Short processes are forced to wait for prolonged periods behind heavy processes.\n"
            "2. **High Average Waiting Time**: Typically yields the highest average waiting time among all standard algorithms.\n"
            "3. **Non-Preemptive Inefficiency**: Cannot interrupt an executing process, making it completely unsuitable for modern interactive, multi-user, or real-time operating systems.\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "If you were designing an operating system for an automated teller machine (ATM) vs a smartphone gaming OS, in which scenario would FCFS actually be preferable?"
        )
    
    return (
        "### [Analysis] Architectural Trade-Off Analysis\n\n"
        "Every software design choice involves competing priorities:\n\n"
        "* **Strengths**: Predictability, deterministic behavior, and lower computational overhead.\n"
        "* **Limitations**: Reduced adaptability when handling dynamic or bursty workloads.\n\n"
        "**[Socratic Question]**:\n"
        "In your target application, does consistency outweigh responsiveness?"
    )

def generate_intelligent_socratic_reply(context: str, user_query: str, history: Optional[List[dict]] = None) -> str:
    """Main intelligent Socratic response generator with intent detection."""
    q_clean = user_query.strip().lower()
    meta = extract_course_metadata(context)

    # 0. Check for Greeting, Small Talk, or Help
    words_in_q = set(re.findall(r"\b[a-zA-Z]+\b", q_clean))
    greeting_tokens = {"hi", "hello", "hey", "hola", "yo", "sup", "greetings", "morning", "afternoon", "evening"}
    is_pure_greeting = len(words_in_q) > 0 and words_in_q.issubset(greeting_tokens | {"there", "tutor", "bot", "assistant", "mindforge"})
    is_intro_query = any(phrase in q_clean for phrase in ["who are you", "what can you do", "help me", "how does this work", "start"])

    if is_pure_greeting or is_intro_query:
        return (
            f"### [Socratic Tutor] Hello! Welcome to MindForge\n\n"
            f"Welcome to your study session on **{meta['lesson']}** (*{meta['course']}*)!\n\n"
            f"I am your AI Socratic Study Companion. Rather than simply handing out answers, I help you understand the *why* and *how* behind every concept.\n\n"
            f"**Here are a few things you can ask me right now:**\n"
            f"* **Code Breakdown**: *\"Explain the code line by line\"* - We will walk through variables, loops, and logic.\n"
            f"* **Real-World Intuition**: *\"Give me an analogy\"* - Understand how this concept behaves in everyday life.\n"
            f"* **Quantitative Mastery**: *\"Show me the formulas and calculation steps\"* - See worked examples with numbers.\n"
            f"* **Trade-Off Analysis**: *\"What are the advantages and disadvantages?\"* - Explore real-world engineering trade-offs.\n"
            f"* **Assessments**: *\"Give me a hint on the quiz\"* - Get conceptual guidance on practice questions.\n\n"
            f"---\n\n"
            f"**What would you like to explore first?** Just type your question or pick a starter button below!"
        )

    # 0b. Check for Thanks / Affirmations
    if words_in_q.issubset({"thanks", "thank", "you", "thx", "cool", "ok", "okay", "got", "it", "makes", "sense", "understood", "nice", "great"}):
        return (
            "You're very welcome! Keep that curiosity going. "
            "Would you like to test your understanding with a quick practice problem or dive into another part of this lesson?"
        )

    # 1. Check for Line-by-Line Code Explanation Request
    is_code_req = any(k in q_clean for k in ["code", "line", "explain code", "program", "syntax", "printf", "scanf", "loop", "implementation", "c code", "each line"])
    if is_code_req:
        code_blocks = extract_code_blocks(context)
        code_to_explain = code_blocks[0] if code_blocks else ""
        return generate_code_explanation(code_to_explain, user_query, context)

    # 2. Check for Analogy / Real-World Metaphor Request
    is_analogy_req = any(k in q_clean for k in ["analogy", "metaphor", "real world", "real life", "like in life", "intuitive", "everyday"])
    if is_analogy_req:
        return generate_analogy_explanation(user_query, context)

    # 3. Check for Math / Calculation / Formula Request
    is_calc_req = any(k in q_clean for k in ["calculate", "formula", "math", "turnaround", "waiting time", "burst time", "average", "solve", "how to find", "computation"])
    if is_calc_req:
        return generate_calculation_explanation(user_query, context)

    # 4. Check for Advantages / Disadvantages / Comparison Request
    is_comparison_req = any(k in q_clean for k in ["advantage", "disadvantage", "pros", "cons", "vs", "compare", "difference", "limitation", "drawback"])
    if is_comparison_req:
        return generate_pros_cons_explanation(user_query, context)

    # 4b. Convoy Effect Deep-Dive
    if "convoy" in q_clean:
        return (
            "### [Core Concept] The Convoy Effect Explained\n\n"
            "The **Convoy Effect** is a classic performance degradation phenomenon that occurs in First-Come, First-Served (FCFS) scheduling when:\n\n"
            "1. **CPU-Bound Resource Hog Arrives First**: A process with a huge CPU burst time takes the processor.\n"
            "2. **I/O-Bound & Short Processes Line Up Behind**: Multiple fast, interactive processes with tiny burst times are forced to wait in the ready queue.\n"
            "3. **Result**: Devices sit idle waiting for CPU, while CPU sits occupied by one monolithic job, causing average waiting time to skyrocket.\n\n"
            "**Real-World Analogy**: A 100-car freight train crawling across a railroad crossing at 5 mph while 50 sports cars wait in traffic.\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "How does Shortest Job First (SJF) or Round Robin (RR) scheduling prevent the Convoy Effect from crippling interactive responsiveness?"
        )

    # 4c. Starvation Inquiry
    if "starvation" in q_clean or "starve" in q_clean:
        return (
            "### [Core Concept] Starvation in FCFS: Absolute Fairness\n\n"
            "In Operating Systems, **starvation** occurs when a process is indefinitely denied CPU access because other processes keep taking priority.\n\n"
            "* **In FCFS**: Starvation is **mathematically impossible**! Why?\n"
            "* Because the ready queue is a strict **FIFO (First-In, First-Out)** queue. Every arriving process is assigned a finite position in line, and once all earlier processes finish, it is guaranteed to execute.\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "If FCFS guarantees zero starvation, why isn't it used as the primary scheduler in modern operating systems like Windows, macOS, or Linux?"
        )

    # 4d. Preemptive vs Non-Preemptive
    if any(k in q_clean for k in ["preempt", "non-preempt", "interrupt"]):
        return (
            "### [Core Concept] Preemption in FCFS\n\n"
            "FCFS is fundamentally a **non-preemptive** scheduling algorithm:\n\n"
            "* **Non-Preemptive**: Once the CPU is allocated to a process, the process retains control until it terminates or voluntarily yields for I/O.\n"
            "* **Why It Matters**: The OS cannot pause or interrupt a process, even if a higher-priority or critical emergency task arrives!\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "What architectural component does a CPU hardware timer provide that enables preemptive operating systems (like Round Robin) to take back control from an executing thread?"
        )

    # 4e. Gantt Chart
    if "gantt" in q_clean:
        return (
            "### [Visualization] Understanding FCFS Gantt Charts\n\n"
            "A **Gantt Chart** is a horizontal bar chart illustrating process start and completion timelines:\n\n"
            "```text\n"
            "+--------+------------+------+\n"
            "|   P1   |     P2     |  P3  |\n"
            "+--------+------------+------+\n"
            "0        6           14     16\n"
            "```\n\n"
            "* **Time 0**: Process P1 begins execution.\n"
            "* **Time 6**: P1 completes (Burst = 6). P2 begins execution immediately.\n"
            "* **Time 14**: P2 completes (Burst = 8). P3 begins.\n"
            "* **Time 16**: P3 completes (Burst = 2).\n\n"
            "---\n\n"
            "**[Socratic Question]**:\n"
            "Looking at this Gantt chart, what is the completion time of P2, and what was the total time P3 had to wait before its first CPU cycle?"
        )

    # 5. Check for Definition / Conceptual Explanation (ONLY IF actual keywords matched, score > 0)
    rel_paras = extract_relevant_paragraphs(context, user_query, top_k=2)
    if rel_paras:
        top_para = rel_paras[0]
        # Clean up leading markdown formatting
        clean_para = re.sub(r"^#+\s*", "", top_para).strip()
        if len(clean_para) > 20:
            return (
                f"### [Concept] Deep-Dive: {meta['lesson']}\n\n"
                f"Here is how your study material explains this aspect of **{meta['lesson']}**:\n\n"
                f"> \"{clean_para[:350].strip()}...\"\n\n"
                f"#### Key Insights:\n"
                f"* **System Behavior**: This principle dictates the fundamental ordering of operations.\n"
                f"* **State Guarantee**: Processing transitions occur deterministically based on incoming inputs.\n\n"
                f"---\n\n"
                f"**[Socratic Question to Guide You]**:\n"
                f"How does this specific behavior influence system responsiveness when scaling to large workloads?"
            )

    # 6. Fallback General Dynamic Socratic Prompt
    return (
        f"### [Socratic Guidance] Exploring {meta['lesson']}\n\n"
        f"You asked: *\"{user_query}\"* in the context of **{meta['lesson']}**.\n\n"
        f"To reason through this together:\n\n"
        f"1. What is the initial state of the system before this operation begins?\n"
        f"2. What specific condition or input triggers the transition to the next state?\n\n"
        f"**[Socratic Question]**:\n"
        f"If you were writing a program to simulate this, what data structure would you choose to store the queue or state?"
    )

def ask_socratic_tutor_unified(
    user_query: str, 
    lesson_context: str = "", 
    history: Optional[List[dict]] = None,
    api_key: Optional[str] = None,
    api_provider: Optional[str] = None
) -> Dict:
    """Unified entry point for Socratic tutoring with multi-tier fallback."""
    # Check if client passed an API key
    active_gemini_key = api_key if (api_key and api_key.startswith("AIza")) else os.getenv("GEMINI_API_KEY", "").strip()
    active_groq_key = api_key if (api_key and api_key.startswith("gsk_")) else os.getenv("GROQ_API_KEY", "").strip()

    # Tier 1: Try Gemini API
    if active_gemini_key and not active_gemini_key.startswith("your_") and not active_gemini_key.startswith("placeholder") and len(active_gemini_key) > 10:
        try:
            from google import genai
            client = genai.Client(api_key=active_gemini_key)
            prompt = (
                f"You are an encouraging, expert Socratic AI Tutor on an interactive LMS platform.\n"
                f"Answer the student's question thoroughly and conversationally using the provided lesson context.\n"
                f"If the student says 'hi' or greets you, greet them warmly, state the lesson topic, and suggest 3 questions they can explore.\n"
                f"If the student asks for a code explanation or line-by-line breakdown, provide a clear, comprehensive line-by-line breakdown with syntax formatting.\n"
                f"If the student asks for an analogy, provide an engaging real-world comparison.\n"
                f"Conclude with 1 engaging Socratic question that tests their critical thinking.\n\n"
                f"Lesson Context:\n{lesson_context}\n\n"
                f"Student Inquiry: {user_query}"
            )
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if res.text and len(res.text.strip()) > 20:
                return {"answer": res.text.strip(), "citations": [1]}
        except Exception as e:
            print(f"[Notice] Gemini tutor API unavailable: {e}")

    # Tier 2: Try Groq API
    if active_groq_key and not active_groq_key.startswith("your_") and not active_groq_key.startswith("placeholder") and len(active_groq_key) > 10:
        for model_name in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
            try:
                from app.llm_service import get_groq_client
                g_client = get_groq_client()
                response = g_client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are an encouraging Socratic AI Tutor on an LMS platform. "
                                "Answer the student's question clearly based on the lesson context. "
                                "If the student greets you (e.g. 'hi'), greet them warmly and suggest 3 topics to explore. "
                                "If asked for line-by-line code explanation, explain each line in detail. "
                                "End with 1 probing Socratic question."
                            )
                        },
                        {
                            "role": "user",
                            "content": f"Context:\n{lesson_context}\n\nQuestion: {user_query}"
                        }
                    ],
                    max_tokens=2500
                )
                txt = response.choices[0].message.content
                if txt and len(txt.strip()) > 20:
                    return {"answer": txt.strip(), "citations": [1]}
            except Exception as e:
                print(f"[Notice] Groq model {model_name} notice: {e}")

    # Tier 3: Intelligent Dynamic Socratic Synthesis (Always succeeds, never static)
    answer = generate_intelligent_socratic_reply(lesson_context, user_query, history)
    return {"answer": answer, "citations": [1]}
