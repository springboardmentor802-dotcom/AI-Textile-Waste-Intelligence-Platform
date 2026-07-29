"""
MongoDB — secondary database, per the project's tech stack.

Used to store the full raw analysis JSON per uploaded image (texture maps,
per-pixel stats, etc.) so Postgres only needs to hold the summarized,
queryable fields (material, confidence, scores...).

If Mongo isn't running (e.g. `docker compose up -d` hasn't been run yet),
this fails silently and the app keeps working -- the full result still goes
back to the frontend and the summary still lands in Postgres/SQLite. You
just won't have the raw-document history in Mongo until it's up.
"""
import os
from datetime import datetime

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
_client = None
_available = None


def _get_client():
    global _client, _available
    if _available is not None:
        return _client
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=800)
        client.admin.command("ping")
        _client = client
        _available = True
        print("[mongo] Connected to MongoDB.")
    except Exception as exc:
        _client = None
        _available = False
        print(f"[mongo] MongoDB unavailable ({exc}). Raw analysis documents will not be archived this run.")
    return _client


def save_analysis_document(result: dict) -> str | None:
    client = _get_client()
    if not client:
        return None
    try:
        col = client["textile_waste"]["analysis_raw"]
        doc = dict(result)
        doc["stored_at"] = datetime.utcnow().isoformat()
        inserted = col.insert_one(doc)
        return str(inserted.inserted_id)
    except Exception as exc:
        print(f"[mongo] write failed: {exc}")
        return None
