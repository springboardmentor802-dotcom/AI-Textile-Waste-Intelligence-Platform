"""
Database layer — PostgreSQL primary, per the project's tech stack.

Run `docker compose up -d` from the project root first (spins up Postgres +
MongoDB in seconds). DATABASE_URL below points at that container.

Safety net for presentation day: if Postgres isn't reachable when the app
starts (e.g. Docker isn't running yet), this automatically falls back to a
local SQLite file so your demo doesn't die on stage. Get Postgres running
before/after the demo and just restart the app to switch back -- no code
changes needed either way, since all queries below are plain portable SQL.
"""
import os
from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

POSTGRES_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://textile_admin:textile_pass@localhost:5432/textile_waste",
)
SQLITE_FALLBACK_URL = "sqlite:///" + os.path.join(os.path.dirname(__file__), "..", "textile_waste_fallback.db")

_engine: Engine = None
USING_POSTGRES = True


def _build_engine() -> Engine:
    global USING_POSTGRES
    try:
        engine = create_engine(POSTGRES_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        USING_POSTGRES = True
        print("[db] Connected to PostgreSQL.")
        return engine
    except Exception as exc:
        USING_POSTGRES = False
        print(f"[db] PostgreSQL unavailable ({exc}). Falling back to local SQLite for this run.")
        return create_engine(SQLITE_FALLBACK_URL)


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = _build_engine()
    return _engine


@contextmanager
def db_session():
    engine = get_engine()
    with engine.begin() as conn:
        yield conn


# ---- Schema: written in ANSI-ish SQL that runs on both Postgres and SQLite ----
PG_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    batch_id TEXT UNIQUE NOT NULL,
    fabric_type TEXT NOT NULL,
    source TEXT,
    quantity REAL NOT NULL,
    color TEXT,
    condition TEXT,
    collection_date TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    waste_collection_alerts BOOLEAN DEFAULT TRUE,
    recycling_opportunity_notifications BOOLEAN DEFAULT TRUE,
    sustainability_milestone_alerts BOOLEAN DEFAULT TRUE,
    inventory_warnings BOOLEAN DEFAULT TRUE,
    platform_announcements BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    material TEXT,
    confidence REAL,
    fiber_composition TEXT,
    recyclability TEXT,
    circularity_score REAL,
    waste_category TEXT,
    recommendation TEXT,
    mongo_doc_id TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

SQLITE_SCHEMA = PG_SCHEMA.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT") \
                         .replace("BOOLEAN DEFAULT FALSE", "INTEGER DEFAULT 0") \
                         .replace("CURRENT_TIMESTAMP", "@@NOWDEFAULT@@") \
                         .replace("TIMESTAMP", "TEXT") \
                         .replace("@@NOWDEFAULT@@", "CURRENT_TIMESTAMP")


def init_db():
    engine = get_engine()
    schema = PG_SCHEMA if USING_POSTGRES else SQLITE_SCHEMA
    with engine.begin() as conn:
        for statement in schema.strip().split(";"):
            statement = statement.strip()
            if statement:
                conn.execute(text(statement))

        count = conn.execute(text("SELECT COUNT(*) AS c FROM users")).mappings().first()["c"]
        if count == 0:
            from .auth import hash_password
            conn.execute(
                text("INSERT INTO users (full_name, email, hashed_password, role) "
                     "VALUES (:n, :e, :p, :r)"),
                {"n": "Demo Admin", "e": "admin@textilewaste.ai",
                 "p": hash_password("Admin@123"), "r": "admin"},
            )
