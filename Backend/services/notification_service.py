"""
Notification creation service.

This is the single place notifications get created from. Every module
that wants to notify a user (inventory.py, predict.py, future admin
announcement logic, etc.) should call create_notification() below
instead of writing directly to the Notification table, so there is
only one code path to review for correctness/security.

IMPORTANT: notifications must only ever be created from backend
business logic (i.e. right after a real event: an inventory row was
committed, a prediction was saved, etc.) - never from a GET request or
from the frontend simply rendering a page. That is what prevents
duplicate notifications on page refresh / component remount / polling.
"""

from typing import Optional

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from models import Notification, User
from services.email_service import (
    EMAIL_ENABLED_NOTIFICATION_TYPES,
    send_notification_email_safe,
)

# --- Centralized configuration -------------------------------------------
#
# Inventory Warning threshold. The existing Inventory model has no
# concept of a "low stock" or "capacity" limit today - quantity is a
# simple per-batch Float. Rather than inventing a business rule buried
# inline in routes/inventory.py, the threshold lives here as a single
# named constant so it's easy to find and tune later.
#
# Semantics: a single batch whose quantity (kg) is at or above this
# value is considered large enough to warn about (e.g. it may need
# special handling/logistics). This only fires once, at the moment the
# batch is created - it is not re-evaluated on every page load, so it
# cannot duplicate.
INVENTORY_WARNING_THRESHOLD_KG = 500.0


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    severity: str = "info",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[int] = None,
    background_tasks: Optional[BackgroundTasks] = None,
) -> Notification:
    """Create and persist a single notification for one user.

    This function commits its own transaction. It is intended to be
    called AFTER the triggering business object (Inventory row,
    Prediction row, etc.) has already been successfully committed, so
    a notification is never created for an action that ultimately
    failed to save.

    `background_tasks` is optional and additive only: every route that
    calls create_notification() may pass its `BackgroundTasks`
    dependency through so the email counterpart of this notification
    (see _dispatch_notification_email below) can be sent after the
    response instead of blocking it. Callers that don't pass one still
    get email - just sent synchronously as a safe fallback.
    """
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        severity=severity,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # --- Email delivery (additional channel, never a replacement) ---
    # The in-app notification above is already committed by this point.
    # Nothing below can undo it: _dispatch_notification_email() never
    # raises (see services/email_service.send_notification_email_safe),
    # so a broken/missing SMTP setup can only fail to send an email -
    # it can never remove the notification the user already has.
    _dispatch_notification_email(db, notification, background_tasks)

    return notification


def _dispatch_notification_email(
    db: Session,
    notification: Notification,
    background_tasks: Optional[BackgroundTasks],
) -> None:
    """Send the email counterpart of a just-created notification, if enabled.

    Only ever called from create_notification() above - i.e. only at
    the exact moment a notification is created from a real backend
    event (a committed Inventory row, a committed Prediction, an
    Administrator announcement). It is never called from GET
    /notifications, GET /notifications/unread-count, or anywhere else
    the frontend polls/re-renders, so this cannot produce duplicate
    emails on refresh or polling.
    """
    if notification.notification_type not in EMAIL_ENABLED_NOTIFICATION_TYPES:
        return

    user = db.query(User).filter(User.id == notification.user_id).first()
    if user is None or not user.email:
        return

    email_kwargs = dict(
        to_email=user.email,
        notification_type=notification.notification_type,
        title=notification.title,
        message=notification.message,
        severity=notification.severity,
        created_at=notification.created_at,
    )

    if background_tasks is not None:
        # Preferred path: don't make the caller's HTTP response wait on
        # an SMTP round-trip. Only plain strings/datetime are handed to
        # the background task below - never the live `db` session or an
        # ORM object - so sending the email never depends on this
        # request's database session still being open.
        background_tasks.add_task(send_notification_email_safe, **email_kwargs)
    else:
        # Fallback for the rare call site without a BackgroundTasks
        # instance available. Still routed through
        # send_notification_email_safe(), so a slow/failed SMTP call
        # cannot raise into the caller - only add latency.
        send_notification_email_safe(**email_kwargs)


def notification_already_exists(
    db: Session,
    user_id: int,
    notification_type: str,
    related_entity_type: str,
    related_entity_id: int,
) -> bool:
    """Duplicate-prevention check.

    Used for any alert that could otherwise be triggered more than
    once for the same underlying event (e.g. a milestone that could be
    re-evaluated from multiple places). Returns True if a notification
    of this exact type, already linked to this exact entity, has been
    created for this user before.
    """
    existing = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.notification_type == notification_type,
            Notification.related_entity_type == related_entity_type,
            Notification.related_entity_id == related_entity_id,
        )
        .first()
    )
    return existing is not None
