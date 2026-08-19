from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from bson import ObjectId
from bson.errors import InvalidId

from ml_endpoints import get_current_user
from database import users_collection
from notifications_models import NotificationInDB, BroadcastRequest, NotificationPreferences
from notifications_service import notifications_collection, dispatch_notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=List[dict])
async def list_notifications(
    limit: int = Query(default=50, ge=1, le=100),
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
):
    user_email = current_user["email"]
    user_role = current_user.get("role")

    query = {
        "$or": [
            {"target_user_email": user_email},
            {"target_role": user_role},
            {"$and": [{"target_user_email": None}, {"target_role": None}]}
        ]
    }
    if unread_only:
        query["read"] = False

    notifications = []
    cursor = notifications_collection.find(query).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        notifications.append(doc)
    return notifications

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    try:
        obj_id = ObjectId(notification_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    result = await notifications_collection.update_one(
        {"_id": obj_id},
        {"$set": {"read": True, "read_at": datetime.utcnow().isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"message": "Notification marked as read", "id": notification_id}

@router.get("/preferences")
async def get_notification_preferences(
    current_user: dict = Depends(get_current_user),
):
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"email_notifications": user.get("email_notifications", True)}

@router.patch("/preferences")
async def update_notification_preferences(
    payload: NotificationPreferences,
    current_user: dict = Depends(get_current_user),
):
    result = await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"email_notifications": payload.email_notifications}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"email_notifications": payload.email_notifications}

@router.post("/broadcast")
async def admin_broadcast(
    payload: BroadcastRequest,
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin privileges required for broadcasting.")

    nid = await dispatch_notification(
        title=payload.title,
        message=payload.message,
        notification_type="admin_broadcast",
        severity=payload.severity,
        target_role=payload.target_role,
        link=payload.link
    )
    return {"message": "Broadcast sent successfully", "notification_id": nid}