import os
import sqlite3
import hashlib
import secrets
import json
import uuid
import time
from typing import Optional, List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "lms.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "database", "schema.sql")

# Memory store for active auth session tokens -> user_id mapping
ACTIVE_AUTH_TOKENS: Dict[str, str] = {}

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            statements = [s.strip() for s in schema_sql.split(";") if s.strip()]
            for stmt in statements:
                try:
                    cursor.execute(stmt)
                    conn.commit()
                except sqlite3.OperationalError:
                    pass

        # Ensure column lesson_id exists if database was created with earlier schema
        try:
            cursor.execute("ALTER TABLE chat_messages ADD COLUMN lesson_id TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            pass  # Already exists

        # Ensure indexes exist
        try:
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_lesson ON chat_messages(lesson_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp)")
            conn.commit()
        except sqlite3.OperationalError:
            pass

        # Seed default user and default session for frictionless usage
        cursor.execute(
            """
            INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, is_verified)
            VALUES (?, ?, ?, ?, ?, 1)
            """,
            ("default_user", "Default Learner", "learner@mindforge.ai", "none", "none")
        )
        cursor.execute(
            """
            INSERT OR IGNORE INTO sessions (id, user_id, title, document_name, course_data)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("default_session", "default_user", "Default Course", "course.pdf", "{}")
        )
        conn.commit()
    finally:
        conn.close()


def hash_password(password: str, salt: str) -> str:
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex()

def register_user(name: str, email: str, password: str) -> Dict[str, Any]:
    email_clean = email.strip().lower()
    name_clean = name.strip()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email_clean,))
        existing = cursor.fetchone()
        if existing:
            raise ValueError("An account with this email address already exists.")

        user_id = str(uuid.uuid4())
        salt = secrets.token_hex(16)
        pwd_hash = hash_password(password, salt)
        # Generate random 6-digit verification code
        code = str(secrets.randbelow(900000) + 100000)

        cursor.execute(
            """
            INSERT INTO users (id, name, email, password_hash, salt, is_verified, verification_code)
            VALUES (?, ?, ?, ?, ?, 0, ?)
            """,
            (user_id, name_clean, email_clean, pwd_hash, salt, code)
        )
        conn.commit()

        return {
            "user_id": user_id,
            "name": name_clean,
            "email": email_clean,
            "verification_code": code,
            "is_verified": False
        }
    finally:
        conn.close()

def verify_email(email: str, code: str) -> bool:
    email_clean = email.strip().lower()
    code_clean = code.strip()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, verification_code FROM users WHERE email = ?", (email_clean,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("Account not found.")

        if row["verification_code"] != code_clean:
            raise ValueError("Invalid verification code. Please check the code and try again.")

        cursor.execute("UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?", (row["id"],))
        conn.commit()
        return True
    finally:
        conn.close()

def login_user(email: str, password: str) -> Dict[str, Any]:
    email_clean = email.strip().lower()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
        row = cursor.fetchone()
        if not row:
            raise ValueError("No account found with this email.")

        if not row["is_verified"]:
            raise ValueError("Email is not verified yet. Please enter the verification code sent to your email.")

        computed_hash = hash_password(password, row["salt"])
        if computed_hash != row["password_hash"]:
            raise ValueError("Incorrect password. Please try again.")

        user_id = row["id"]
        token = secrets.token_hex(32)
        ACTIVE_AUTH_TOKENS[token] = user_id

        return {
            "token": token,
            "user": {
                "id": user_id,
                "name": row["name"],
                "email": row["email"],
            }
        }
    finally:
        conn.close()

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    user_id = ACTIVE_AUTH_TOKENS.get(token)
    if not user_id:
        return None

    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {"id": row["id"], "name": row["name"], "email": row["email"]}
        return None
    finally:
        conn.close()

def save_or_update_session(
    user_id: str,
    title: str,
    document_name: str,
    course_data: Dict[str, Any],
    session_id: Optional[str] = None,
    active_module_id: Optional[str] = None,
    active_lesson_id: Optional[str] = None,
) -> str:
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # Unset previous last_opened for this user
        cursor.execute("UPDATE sessions SET is_last_opened = 0 WHERE user_id = ?", (user_id,))

        sid = session_id or str(uuid.uuid4())
        course_json = json.dumps(course_data)

        # Check if session exists
        cursor.execute("SELECT id FROM sessions WHERE id = ? AND user_id = ?", (sid, user_id))
        exists = cursor.fetchone()

        if exists:
            cursor.execute(
                """
                UPDATE sessions 
                SET title = ?, document_name = ?, course_data = ?, active_module_id = ?, active_lesson_id = ?, is_last_opened = 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
                """,
                (title, document_name, course_json, active_module_id, active_lesson_id, sid, user_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO sessions (id, user_id, title, document_name, course_data, active_module_id, active_lesson_id, is_last_opened)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """,
                (sid, user_id, title, document_name, course_json, active_module_id, active_lesson_id)
            )

        conn.commit()
        return sid
    finally:
        conn.close()

def get_user_sessions(user_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT s.id, s.title, s.document_name, s.active_module_id, s.active_lesson_id, s.is_last_opened, s.updated_at,
                   COUNT(m.id) as message_count
            FROM sessions s
            LEFT JOIN chat_messages m ON s.id = m.session_id
            WHERE s.user_id = ?
            GROUP BY s.id
            ORDER BY s.is_last_opened DESC, s.updated_at DESC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "title": r["title"],
                "document_name": r["document_name"],
                "active_module_id": r["active_module_id"],
                "active_lesson_id": r["active_lesson_id"],
                "is_last_opened": bool(r["is_last_opened"]),
                "updated_at": r["updated_at"],
                "message_count": r["message_count"]
            })
        return result
    finally:
        conn.close()

def get_session_details(user_id: str, session_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM sessions WHERE id = ? AND user_id = ?",
            (session_id, user_id)
        )
        row = cursor.fetchone()
        if not row:
            return None

        # Mark as last opened
        cursor.execute("UPDATE sessions SET is_last_opened = 0 WHERE user_id = ?", (user_id,))
        cursor.execute("UPDATE sessions SET is_last_opened = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
        conn.commit()

        # Fetch messages for this session
        cursor.execute(
            "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC",
            (session_id,)
        )
        msg_rows = cursor.fetchall()
        messages = []
        for m in msg_rows:
            citations = json.loads(m["citations"]) if m["citations"] else None
            messages.append({
                "id": m["id"],
                "role": m["role"],
                "content": m["content"],
                "citations": citations,
                "timestamp": m["timestamp"]
            })

        course_obj = json.loads(row["course_data"])
        return {
            "id": row["id"],
            "title": row["title"],
            "document_name": row["document_name"],
            "course": course_obj,
            "active_module_id": row["active_module_id"],
            "active_lesson_id": row["active_lesson_id"],
            "messages": messages
        }
    finally:
        conn.close()

def get_last_opened_session(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM sessions WHERE user_id = ? ORDER BY is_last_opened DESC, updated_at DESC LIMIT 1",
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return get_session_details(user_id, row["id"])
    finally:
        conn.close()

def ensure_session_exists(cursor, session_id: str, user_id: str = "default_user"):
    cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, is_verified) VALUES (?, ?, ?, ?, ?, 1)",
            (user_id, "Learner", f"{user_id}@mindforge.ai", "none", "none")
        )
    cursor.execute("SELECT id FROM sessions WHERE id = ?", (session_id,))
    if not cursor.fetchone():
        cursor.execute(
            "INSERT OR IGNORE INTO sessions (id, user_id, title, document_name, course_data) VALUES (?, ?, ?, ?, ?)",
            (session_id, user_id, "Course Session", "document.pdf", "{}")
        )

def add_chat_message(
    session_id: str = "default_session",
    user_id: str = "default_user",
    role: str = "user",
    content: str = "",
    citations: Optional[List[int]] = None,
    timestamp: Optional[int] = None,
    lesson_id: Optional[str] = None,
    msg_id: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        ensure_session_exists(cursor, session_id, user_id)

        m_id = msg_id or f"msg_{uuid.uuid4().hex[:8]}"
        ts = timestamp or int(time.time() * 1000)
        citations_json = json.dumps(citations) if citations else None

        cursor.execute(
            """
            INSERT INTO chat_messages (id, session_id, user_id, lesson_id, role, content, citations, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (m_id, session_id, user_id, lesson_id, role, content, citations_json, ts)
        )
        # Update session timestamp
        cursor.execute("UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
        conn.commit()

        return {
            "id": m_id,
            "session_id": session_id,
            "user_id": user_id,
            "lesson_id": lesson_id,
            "role": role,
            "content": content,
            "citations": citations,
            "timestamp": ts
        }
    finally:
        conn.close()

def get_chat_messages(
    session_id: str = "default_session",
    lesson_id: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 200
) -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = "SELECT * FROM chat_messages WHERE session_id = ?"
        params: List[Any] = [session_id]

        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)

        if lesson_id:
            query += " AND (lesson_id = ? OR lesson_id IS NULL)"
            params.append(lesson_id)

        query += " ORDER BY timestamp ASC LIMIT ?"
        params.append(limit)

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        messages = []
        for m in rows:
            citations = json.loads(m["citations"]) if m["citations"] else None
            les_id = m["lesson_id"] if "lesson_id" in m.keys() else None
            messages.append({
                "id": m["id"],
                "session_id": m["session_id"],
                "user_id": m["user_id"],
                "lesson_id": les_id,
                "role": m["role"],
                "content": m["content"],
                "citations": citations,
                "timestamp": m["timestamp"]
            })
        return messages
    finally:
        conn.close()

def clear_chat_messages(
    session_id: str = "default_session",
    lesson_id: Optional[str] = None
) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        if lesson_id:
            cursor.execute(
                "DELETE FROM chat_messages WHERE session_id = ? AND lesson_id = ?",
                (session_id, lesson_id)
            )
        else:
            cursor.execute(
                "DELETE FROM chat_messages WHERE session_id = ?",
                (session_id,)
            )
        deleted = cursor.rowcount
        conn.commit()
        return deleted
    finally:
        conn.close()

