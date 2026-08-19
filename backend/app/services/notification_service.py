from sqlalchemy.orm import Session

from app.models.notification import Notification


# ==========================================================
# GENERIC NOTIFICATION CREATOR
# ==========================================================

def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    severity: str = "info",
    related_entity_type: str | None = None,
    related_entity_id: int | None = None,
):
    """
    Create and store one notification.
    """

    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        severity=severity,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
    )

    db.add(notification)

    return notification


# ==========================================================
# CHECK WHETHER SAME ALERT ALREADY EXISTS
# ==========================================================

def notification_exists(
    db: Session,
    user_id: int,
    notification_type: str,
    related_entity_type: str,
    related_entity_id: int,
):
    """
    Prevent duplicate notifications for
    the same analysis or inventory record.
    """

    existing = (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.notification_type
            == notification_type,
            Notification.related_entity_type
            == related_entity_type,
            Notification.related_entity_id
            == related_entity_id,
        )
        .first()
    )

    return existing is not None


# ==========================================================
# TEXTILE ANALYSIS NOTIFICATIONS
# ==========================================================

def create_analysis_notifications(
    db: Session,
    upload,
):
    """
    Generate notifications after a textile
    analysis has a confirmed assessment.
    """

    user_id = upload.uploaded_by
    upload_id = upload.upload_id

    if user_id is None:
        return []

    created_notifications = []

    # ------------------------------------------------------
    # 1. HAZARDOUS CONTAMINATION ALERT
    # ------------------------------------------------------

    contamination = (
        str(upload.contamination_status or "")
        .strip()
        .lower()
    )

    hazardous_terms = {
        "hazardous",
        "chemical",
        "toxic",
        "severe contamination",
    }

    if any(
        term in contamination
        for term in hazardous_terms
    ):
        notification_type = "hazardous_alert"

        if not notification_exists(
            db=db,
            user_id=user_id,
            notification_type=notification_type,
            related_entity_type="waste_upload",
            related_entity_id=upload_id,
        ):
            notification = create_notification(
                db=db,
                user_id=user_id,
                notification_type=notification_type,
                title="Hazardous Textile Alert",
                message=(
                    f"Analysis #{upload_id} contains "
                    "potentially hazardous contamination. "
                    "Specialized handling and treatment "
                    "are recommended."
                ),
                severity="critical",
                related_entity_type="waste_upload",
                related_entity_id=upload_id,
            )

            created_notifications.append(
                notification
            )

    # ------------------------------------------------------
    # 2. MANUAL REVIEW REQUIRED
    # ------------------------------------------------------

    if upload.requires_manual_review:
        notification_type = "manual_review"

        if not notification_exists(
            db=db,
            user_id=user_id,
            notification_type=notification_type,
            related_entity_type="waste_upload",
            related_entity_id=upload_id,
        ):
            notification = create_notification(
                db=db,
                user_id=user_id,
                notification_type=notification_type,
                title="Manual Review Required",
                message=(
                    f"Analysis #{upload_id} requires "
                    "manual review before the final "
                    "recovery decision is confirmed."
                ),
                severity="warning",
                related_entity_type="waste_upload",
                related_entity_id=upload_id,
            )

            created_notifications.append(
                notification
            )

    # ------------------------------------------------------
    # 3. HIGH RECYCLING / RECOVERY OPPORTUNITY
    # ------------------------------------------------------

    recovery_score = upload.recovery_score

    recovery_category = (
        str(upload.recovery_category or "")
        .strip()
        .lower()
    )

    strong_recovery_categories = {
        "reuse",
        "repair",
        "upcycling",
        "recycling",
        "mechanical recycling",
        "chemical recycling",
        "fiber recovery",
        "fibre recovery",
    }

    high_recovery = False

    if (
        recovery_score is not None
        and recovery_score >= 75
    ):
        high_recovery = True

    if recovery_category in strong_recovery_categories:
        high_recovery = True

    if high_recovery:
        notification_type = (
            "recycling_opportunity"
        )

        if not notification_exists(
            db=db,
            user_id=user_id,
            notification_type=notification_type,
            related_entity_type="waste_upload",
            related_entity_id=upload_id,
        ):
            score_text = ""

            if recovery_score is not None:
                score_text = (
                    f" Recovery score: "
                    f"{round(recovery_score, 1)}."
                )

            notification = create_notification(
                db=db,
                user_id=user_id,
                notification_type=notification_type,
                title="High Recovery Opportunity",
                message=(
                    f"Analysis #{upload_id} has a "
                    "strong textile recovery opportunity."
                    f"{score_text} Recommended pathway: "
                    f"{upload.recovery_path or 'Recovery'}."
                ),
                severity="success",
                related_entity_type="waste_upload",
                related_entity_id=upload_id,
            )

            created_notifications.append(
                notification
            )

    # ------------------------------------------------------
    # 4. SUSTAINABILITY ACHIEVEMENT
    # ------------------------------------------------------

    sustainability_score = (
        upload.sustainability_score
    )

    if (
        sustainability_score is not None
        and sustainability_score >= 80
    ):
        notification_type = (
            "sustainability_milestone"
        )

        if not notification_exists(
            db=db,
            user_id=user_id,
            notification_type=notification_type,
            related_entity_type="waste_upload",
            related_entity_id=upload_id,
        ):
            notification = create_notification(
                db=db,
                user_id=user_id,
                notification_type=notification_type,
                title="Sustainability Milestone",
                message=(
                    f"Analysis #{upload_id} achieved "
                    f"a sustainability score of "
                    f"{round(sustainability_score, 1)}. "
                    "This textile has strong circular "
                    "recovery potential."
                ),
                severity="success",
                related_entity_type="waste_upload",
                related_entity_id=upload_id,
            )

            created_notifications.append(
                notification
            )

    return created_notifications


# ==========================================================
# INVENTORY WARNING
# ==========================================================

def create_inventory_warning(
    db: Session,
    user_id: int,
    batch,
):
    """
    Generate an inventory warning when a
    textile batch requires attention.
    """

    if batch is None:
        return None

    notification_type = "inventory_warning"

    if notification_exists(
        db=db,
        user_id=user_id,
        notification_type=notification_type,
        related_entity_type="inventory",
        related_entity_id=batch.textile_id,
    ):
        return None

    status = (
        str(batch.processing_status or "")
        .strip()
        .lower()
    )

    weight = batch.waste_weight or 0

    warning_required = (
        weight >= 100
        or status in {
            "pending",
            "unprocessed",
            "waiting",
        }
    )

    if not warning_required:
        return None

    return create_notification(
        db=db,
        user_id=user_id,
        notification_type=notification_type,
        title="Inventory Warning",
        message=(
            f"Batch {batch.batch_id} requires "
            f"attention. Current weight: "
            f"{round(weight, 2)} kg. "
            f"Processing status: "
            f"{batch.processing_status or 'Unknown'}."
        ),
        severity="warning",
        related_entity_type="inventory",
        related_entity_id=batch.textile_id,
    )


# ==========================================================
# WASTE COLLECTION ALERT
# ==========================================================

def create_collection_alert(
    db: Session,
    user_id: int,
    batch,
):
    """
    Notify the user when a new textile
    waste batch is registered.
    """

    notification_type = "collection_alert"

    if notification_exists(
        db=db,
        user_id=user_id,
        notification_type=notification_type,
        related_entity_type="inventory",
        related_entity_id=batch.textile_id,
    ):
        return None

    return create_notification(
        db=db,
        user_id=user_id,
        notification_type=notification_type,
        title="Waste Collection Registered",
        message=(
            f"Textile waste batch "
            f"{batch.batch_id} has been registered "
            f"with {round(batch.waste_weight or 0, 2)} "
            "kg of textile waste."
        ),
        severity="info",
        related_entity_type="inventory",
        related_entity_id=batch.textile_id,
    )
# ==========================================================
# PLATFORM ANNOUNCEMENT
# ==========================================================

def create_platform_announcement(
    db: Session,
    user_ids: list[int],
    title: str,
    message: str,
    severity: str = "info",
):
    """
    Create a platform announcement for multiple users.

    Each user receives their own notification record so
    read/unread state remains independent for every account.
    """

    allowed_severities = {
        "info",
        "success",
        "warning",
        "critical",
    }

    severity = str(severity or "info").strip().lower()

    if severity not in allowed_severities:
        severity = "info"

    created_notifications = []

    for user_id in user_ids:

        notification = create_notification(
            db=db,
            user_id=user_id,
            notification_type="platform_announcement",
            title=title.strip(),
            message=message.strip(),
            severity=severity,
            related_entity_type=None,
            related_entity_id=None,
        )

        created_notifications.append(notification)

    return created_notifications