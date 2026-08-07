"""Notification generation logic -- creates alerts respecting each user's notification preferences."""
from sqlalchemy import text


def _get_prefs(conn, user_id: int) -> dict:
    row = conn.execute(
        text("SELECT * FROM user_settings WHERE user_id=:uid"), {"uid": user_id}
    ).mappings().first()
    if not row:
        return {
            "waste_collection_alerts": True,
            "recycling_opportunity_notifications": True,
            "sustainability_milestone_alerts": True,
            "inventory_warnings": True,
            "platform_announcements": True,
        }
    return dict(row)


def _create(conn, user_id: int, category: str, title: str, message: str):
    conn.execute(
        text("""INSERT INTO notifications (user_id, category, title, message)
                VALUES (:uid, :cat, :title, :msg)"""),
        {"uid": user_id, "cat": category, "title": title, "msg": message},
    )


def notify_recycling_opportunity(conn, user_id: int, filename: str, circularity_score: float, best_recommendation: str):
    prefs = _get_prefs(conn, user_id)
    if not prefs.get("recycling_opportunity_notifications", True):
        return
    if circularity_score >= 75:
        _create(
            conn, user_id, "recycling_opportunity",
            "High-value recycling opportunity",
            f"{filename} scored {circularity_score}/100 -- strong candidate for {best_recommendation}.",
        )


def notify_inventory_warning(conn, user_id: int, filename: str, waste_category: str):
    prefs = _get_prefs(conn, user_id)
    if not prefs.get("inventory_warnings", True):
        return
    if waste_category == "Hazardous":
        _create(
            conn, user_id, "inventory_warning",
            "Hazardous item flagged",
            f"{filename} was classified as Hazardous waste -- requires certified handling, do not process normally.",
        )


def notify_sustainability_milestone(conn, user_id: int, total_analyses: int, avg_circularity: float):
    prefs = _get_prefs(conn, user_id)
    if not prefs.get("sustainability_milestone_alerts", True):
        return
    milestones = [10, 25, 50, 100, 250, 500]
    if total_analyses in milestones:
        _create(
            conn, user_id, "sustainability_milestone",
            f"{total_analyses} items analyzed!",
            f"You've analyzed {total_analyses} items with an average circularity score of {avg_circularity:.1f}/100.",
        )


def notify_waste_collection_alert(conn, user_id: int, batch_id: str, fabric_type: str, quantity: float):
    prefs = _get_prefs(conn, user_id)
    if not prefs.get("waste_collection_alerts", True):
        return
    _create(
        conn, user_id, "waste_collection",
        "New waste batch registered",
        f"Batch {batch_id} ({fabric_type}, {quantity}kg) has been added to inventory.",
    )
