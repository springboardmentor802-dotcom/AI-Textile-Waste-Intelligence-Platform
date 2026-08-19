import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from ml_endpoints import get_current_user
from database import (
    client,
    users_collection,
    inventory_collection,
    waste_batches_collection,
    ai_logs_collection,
)
from notifications_service import notifications_collection
from notifications_scheduler import scheduler

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def _require_admin(current_user: dict) -> None:
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin privileges required.")

@router.get("/stats")
async def get_platform_stats(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)

    total_users = await users_collection.count_documents({})
    total_scans = await ai_logs_collection.count_documents({})
    total_inventory_items = await inventory_collection.count_documents({})
    total_waste_batches = await waste_batches_collection.count_documents({})
    total_notifications = await notifications_collection.count_documents({})

    # Users grouped by role
    role_counts = {}
    role_pipeline = [{"$group": {"_id": "$role", "count": {"$sum": 1}}}]
    async for row in users_collection.aggregate(role_pipeline):
        role_counts[row["_id"] or "Unknown"] = row["count"]

    # Scans grouped by material type (for a platform-level breakdown)
    material_counts = {}
    material_pipeline = [
        {"$group": {"_id": "$analysis.material_type.label", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8},
    ]
    async for row in ai_logs_collection.aggregate(material_pipeline):
        material_counts[row["_id"] or "Unknown"] = row["count"]

    # Distinct batches (scans grouped under a batch_id)
    distinct_batches = len(await ai_logs_collection.distinct("batch_id", {"batch_id": {"$ne": None}}))

    return {
        "active_users": total_users,
        "users_by_role": role_counts,
        "total_reports_generated": total_scans,
        "total_scans": total_scans,
        "total_batches": distinct_batches,
        "total_inventory_items": total_inventory_items,
        "total_waste_batches": total_waste_batches,
        "total_notifications_sent": total_notifications,
        "scans_by_material": material_counts,
    }

@router.get("/system-health")
async def get_system_health(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)

    db_connected = True
    db_error = None
    try:
        await client.admin.command("ping")
    except Exception as exc:
        db_connected = False
        db_error = str(exc)

    import httpx
    ML_ENGINE_URL = os.getenv("ML_ENGINE_URL", "http://ml_engine:8001")

    ml_models = {}
    try:
        async with httpx.AsyncClient(timeout=5.0) as http_client:
            resp = await http_client.get(f"{ML_ENGINE_URL}/health")
            resp.raise_for_status()
            ml_models = resp.json().get("loaded_models", {})
    except Exception as exc:
        ml_models = {"error": str(exc)}

    return {
        "database": {"connected": db_connected, "error": db_error},
        "scheduler": {"running": scheduler.running},
        "ml_models": ml_models,
    }

@router.get("/reports")
async def list_all_reports(
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)

    total_scans = await ai_logs_collection.count_documents({})

    scans = []
    cursor = ai_logs_collection.find({}).sort("created_at", -1).skip(skip).limit(limit)
    async for doc in cursor:
        analysis = doc.get("analysis") or {}
        scans.append({
            "scan_id": str(doc["_id"]),
            "filename": doc.get("filename"),
            "user_email": doc.get("user_email"),
            "created_at": doc.get("created_at"),
            "batch_id": doc.get("batch_id"),
            "material": (analysis.get("material_type") or {}).get("label"),
            "condition": (analysis.get("waste_status") or {}).get("label"),
        })

    batch_pipeline = [
        {"$match": {"batch_id": {"$ne": None}}},
        {"$group": {
            "_id": "$batch_id",
            "scan_count": {"$sum": 1},
            "user_email": {"$first": "$user_email"},
            "latest_created_at": {"$max": "$created_at"},
            "label": {"$first": "$batch_meta.label"},
        }},
        {"$sort": {"latest_created_at": -1}},
        {"$limit": 50},
    ]
    batches = []
    async for row in ai_logs_collection.aggregate(batch_pipeline):
        batches.append({
            "batch_id": row["_id"],
            "scan_count": row["scan_count"],
            "user_email": row.get("user_email"),
            "latest_created_at": row.get("latest_created_at"),
            "label": row.get("label") or "Untitled batch",
        })

    return {
        "scans": scans,
        "total_scans": total_scans,
        "batches": batches,
    }
