from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Notification, User
from schemas import (
    AnnouncementCreate,
    NotificationResponse,
    UnreadCountResponse,
)
from routes.auth import get_current_user, require_role
from services.notification_service import create_notification

router = APIRouter()


def _notification_query_for_user(db: Session, current_user: User):
    """Scope every notification query to the logged-in user.

    Unlike Inventory (where Administrator can see everyone's rows),
    notifications are always personal - even an Administrator only
    ever sees their own notifications. This mirrors Prediction/History,
    which are also always scoped to `current_user.id` with no
    role-based override.
    """
    return db.query(Notification).filter(Notification.user_id == current_user.id)


@router.get("/notifications", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all notifications belonging to the authenticated user, newest first."""
    return (
        _notification_query_for_user(db, current_user)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/notifications/unread-count", response_model=UnreadCountResponse)
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return how many of the authenticated user's notifications are unread."""
    unread_count = (
        _notification_query_for_user(db, current_user)
        .filter(Notification.is_read == False)  # noqa: E712 (SQLAlchemy needs `== False`)
        .count()
    )
    return {"unread_count": unread_count}


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark exactly one of the authenticated user's own notifications as read.

    Security: the query below is filtered by both the notification id
    AND user_id == current_user.id together, so a user can never mark
    another user's notification as read - if the id belongs to someone
    else, this simply returns 404 (not 403), the same "don't confirm
    another user's data exists" pattern already used by
    routes/inventory.py.
    """
    notification = (
        _notification_query_for_user(db, current_user)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or you do not have access to it",
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return notification


@router.patch("/notifications/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark every unread notification belonging to the authenticated user as read."""
    updated_count = (
        _notification_query_for_user(db, current_user)
        .filter(Notification.is_read == False)  # noqa: E712
        .update({"is_read": True}, synchronize_session=False)
    )
    db.commit()

    return {"message": "All notifications marked as read", "updated_count": updated_count}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete exactly one of the authenticated user's own notifications.

    Same ownership pattern as mark_notification_as_read: scoped to
    user_id == current_user.id, so a user can never delete another
    user's notification.
    """
    notification = (
        _notification_query_for_user(db, current_user)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or you do not have access to it",
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted successfully"}


# ADMINISTRATOR: PLATFORM ANNOUNCEMENTS
#
# Only an Administrator may create a platform-wide announcement (same
# require_role(["administrator"]) pattern already used for
# /admin/users and /admin/analytics - no second RBAC mechanism).
#
# The existing project has no notion of "which users are active" or a
# subscription/opt-in list, so an announcement is delivered to every
# currently registered user by creating one Notification row per user.
# This keeps the read/unread/mark-as-read model identical to every
# other notification type - there is no separate "announcements" table
# or endpoint for regular users to poll.
@router.post("/notifications/announcement", response_model=list[NotificationResponse])
def create_platform_announcement(
    request: AnnouncementCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["administrator"])),
):
    all_users = db.query(User).all()

    created = [
        create_notification(
            db=db,
            user_id=user.id,
            title=request.title,
            message=request.message,
            notification_type="platform_announcement",
            severity=request.severity,
            background_tasks=background_tasks,
        )
        for user in all_users
    ]

    return created
