from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import (
    BaseModel,
    Field,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.notification import Notification
from app.models.user import User

from app.services.notification_service import (
    create_platform_announcement,
)

from app.utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==========================================================
# REQUEST MODEL
# ==========================================================

class PlatformAnnouncementRequest(BaseModel):

    title: str = Field(
        ...,
        min_length=3,
        max_length=150,
    )

    message: str = Field(
        ...,
        min_length=3,
        max_length=500,
    )

    severity: str = Field(
        default="info",
        description=(
            "Allowed values: "
            "info, success, warning, critical"
        ),
    )


# ==========================================================
# SERIALIZER
# ==========================================================

def notification_to_dict(
    notification: Notification,
):

    return {
        "notification_id":
            notification.notification_id,

        "user_id":
            notification.user_id,

        "notification_type":
            notification.notification_type,

        "title":
            notification.title,

        "message":
            notification.message,

        "severity":
            notification.severity,

        "related_entity_type":
            notification.related_entity_type,

        "related_entity_id":
            notification.related_entity_id,

        "is_read":
            notification.is_read,

        "read_at":
            notification.read_at,

        "created_at":
            notification.created_at,
    }


# ==========================================================
# GET CURRENT USER NOTIFICATIONS
# ==========================================================

@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        get_current_user
    ),
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id
            ==
            current_user["user_id"]
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return [
        notification_to_dict(
            notification
        )
        for notification in notifications
    ]


# ==========================================================
# GET UNREAD COUNT
# ==========================================================

@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        get_current_user
    ),
):

    unread_count = (
        db.query(Notification)
        .filter(
            Notification.user_id
            ==
            current_user["user_id"],

            Notification.is_read.is_(
                False
            ),
        )
        .count()
    )

    return {
        "unread_count":
            unread_count
    }


# ==========================================================
# PLATFORM ANNOUNCEMENT
# ADMIN ONLY
# ==========================================================

@router.post("/announcement")
def create_announcement(
    payload: PlatformAnnouncementRequest,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        get_current_user
    ),
):

    # ------------------------------------------------------
    # ADMIN AUTHORIZATION
    # ------------------------------------------------------

    if current_user["role"] != "Admin":

        raise HTTPException(
            status_code=403,
            detail=(
                "Only administrators can "
                "create platform announcements."
            ),
        )


    # ------------------------------------------------------
    # VALIDATE SEVERITY
    # ------------------------------------------------------

    severity = (
        payload.severity
        .strip()
        .lower()
    )

    allowed_severities = {
        "info",
        "success",
        "warning",
        "critical",
    }

    if severity not in allowed_severities:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid severity. "
                "Choose one of: "
                "info, success, warning, critical."
            ),
        )


    # ------------------------------------------------------
    # GET ALL PLATFORM USERS
    # ------------------------------------------------------

    users = (
        db.query(User)
        .all()
    )

    if not users:

        raise HTTPException(
            status_code=404,
            detail="No platform users found.",
        )


    user_ids = [
        user.user_id
        for user in users
    ]


    # ------------------------------------------------------
    # CREATE ANNOUNCEMENT FOR ALL USERS
    # ------------------------------------------------------

    try:

        created_notifications = (
            create_platform_announcement(
                db=db,
                user_ids=user_ids,
                title=payload.title,
                message=payload.message,
                severity=severity,
            )
        )

        db.commit()


        return {
            "status": "success",

            "message": (
                "Platform announcement "
                "created successfully."
            ),

            "recipients":
                len(
                    created_notifications
                ),

            "announcement": {
                "title":
                    payload.title,

                "message":
                    payload.message,

                "severity":
                    severity,
            },
        }


    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to create "
                "platform announcement."
            ),
        ) from error


# ==========================================================
# MARK ALL AS READ
# ==========================================================

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        get_current_user
    ),
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id
            ==
            current_user["user_id"],

            Notification.is_read.is_(
                False
            ),
        )
        .all()
    )


    read_time = datetime.utcnow()


    for notification in notifications:

        notification.is_read = True
        notification.read_at = read_time


    db.commit()


    return {
        "message":
            "All notifications marked as read",

        "updated_count":
            len(notifications),
    }


# ==========================================================
# MARK ONE AS READ
# ==========================================================

@router.patch(
    "/{notification_id}/read"
)
def mark_notification_as_read(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id
            ==
            notification_id,

            Notification.user_id
            ==
            current_user["user_id"],
        )
        .first()
    )


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )


    if not notification.is_read:

        notification.is_read = True

        notification.read_at = (
            datetime.utcnow()
        )

        db.commit()

        db.refresh(
            notification
        )


    return notification_to_dict(
        notification
    )


# ==========================================================
# DELETE NOTIFICATION
# ==========================================================

@router.delete(
    "/{notification_id}"
)
def delete_notification(
    notification_id: int,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        get_current_user
    ),
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id
            ==
            notification_id,

            Notification.user_id
            ==
            current_user["user_id"],
        )
        .first()
    )


    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )


    db.delete(
        notification
    )

    db.commit()


    return {
        "message":
            "Notification deleted successfully"
    }