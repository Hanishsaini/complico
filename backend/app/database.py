import sqlite3
import json
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path("./data/audit.db")
DB_PATH.parent.mkdir(exist_ok=True)


@contextmanager
def _conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db():
    with _conn() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                company TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                original_name TEXT NOT NULL,
                stored_path TEXT NOT NULL,
                size_bytes INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS findings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trace_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                control_id TEXT,
                status TEXT,
                confidence REAL,
                rationale TEXT,
                recommendation TEXT,
                priority TEXT DEFAULT 'medium',
                action_steps TEXT DEFAULT '[]',
                evidence_snippet TEXT DEFAULT '',
                evidence_sentence TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS policies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trace_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                control_id TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS audit_texts (
                trace_id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                full_text TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("CREATE INDEX IF NOT EXISTS idx_findings_user_trace ON findings(user_id, trace_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id, created_at DESC)")


# ---------- USERS ----------
def create_user(email: str, password_hash: str, full_name: str = "", company: str = "") -> int:
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO users (email, password_hash, full_name, company) VALUES (?,?,?,?)",
            (email.lower().strip(), password_hash, full_name, company),
        )
        return cur.lastrowid


def get_user_by_email(email: str):
    with _conn() as c:
        row = c.execute(
            "SELECT id, email, password_hash, full_name, company FROM users WHERE email = ?",
            (email.lower().strip(),),
        ).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id: int):
    with _conn() as c:
        row = c.execute(
            "SELECT id, email, full_name, company FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


# ---------- UPLOADS ----------
def save_upload(upload_id: str, user_id: int, original_name: str, stored_path: str, size_bytes: int):
    with _conn() as c:
        c.execute(
            "INSERT INTO uploads (id, user_id, original_name, stored_path, size_bytes) VALUES (?,?,?,?,?)",
            (upload_id, user_id, original_name, stored_path, size_bytes),
        )


def get_upload(upload_id: str, user_id: int):
    with _conn() as c:
        row = c.execute(
            "SELECT id, user_id, original_name, stored_path FROM uploads WHERE id = ? AND user_id = ?",
            (upload_id, user_id),
        ).fetchone()
        return dict(row) if row else None


def get_latest_upload(user_id: int):
    with _conn() as c:
        row = c.execute(
            "SELECT id, user_id, original_name, stored_path FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


# ---------- FINDINGS ----------
def save_findings(trace_id: str, user_id: int, findings: list):
    with _conn() as c:
        for f in findings:
            c.execute(
                """INSERT INTO findings
                   (trace_id, user_id, control_id, status, confidence, rationale, recommendation,
                    priority, action_steps, evidence_snippet, evidence_sentence)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    trace_id,
                    user_id,
                    f["control_id"],
                    f["status"],
                    f["confidence"],
                    f.get("rationale", ""),
                    f.get("recommendation", ""),
                    f.get("priority", "medium"),
                    json.dumps(f.get("action_steps", [])),
                    f.get("evidence_snippet", ""),
                    f.get("evidence_sentence", ""),
                ),
            )


def get_findings_by_trace(trace_id: str, user_id: int):
    with _conn() as c:
        rows = c.execute(
            """SELECT id, control_id, status, confidence, rationale,
                      recommendation, priority, action_steps, evidence_snippet, evidence_sentence
               FROM findings WHERE trace_id = ? AND user_id = ?""",
            (trace_id, user_id),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "control_id": r["control_id"],
            "status": r["status"],
            "confidence": r["confidence"],
            "rationale": r["rationale"],
            "recommendation": r["recommendation"],
            "priority": r["priority"],
            "action_steps": json.loads(r["action_steps"]) if r["action_steps"] else [],
            "evidence_snippet": r["evidence_snippet"],
            "evidence_sentence": r["evidence_sentence"],
        }
        for r in rows
    ]


# ---------- AUDIT TEXTS ----------
def save_audit_text(trace_id: str, user_id: int, full_text: str):
    with _conn() as c:
        c.execute(
            "INSERT OR REPLACE INTO audit_texts (trace_id, user_id, full_text) VALUES (?,?,?)",
            (trace_id, user_id, full_text),
        )


def get_audit_text(trace_id: str, user_id: int):
    with _conn() as c:
        row = c.execute(
            "SELECT full_text FROM audit_texts WHERE trace_id = ? AND user_id = ?",
            (trace_id, user_id),
        ).fetchone()
        return row["full_text"] if row else ""


# ---------- POLICIES ----------
def save_policy(trace_id: str, user_id: int, control_id: str, content: dict):
    with _conn() as c:
        c.execute(
            "INSERT INTO policies (trace_id, user_id, control_id, content) VALUES (?,?,?,?)",
            (trace_id, user_id, control_id, json.dumps(content)),
        )


init_db()
