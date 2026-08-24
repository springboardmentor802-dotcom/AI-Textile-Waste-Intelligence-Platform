"""
Administrator-only routes.

GET /admin/users (User Management) currently still lives in routes/auth.py,
next to the RBAC helpers it was built alongside. This file is for
Administrator functionality added from here on -- starting with Platform
Analytics -- so auth.py can stay focused on authentication/registration.

Every route here reuses the existing auth primitives from routes/auth.py
(get_current_user, require_role) instead of building a second RBAC
mechanism.
"""

from collections import Counter, defaultdict
from statistics import mean

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, Prediction, User
from routes.auth import require_role
from schemas import PlatformAnalyticsResponse

router = APIRouter()


@router.get("/admin/analytics", response_model=PlatformAnalyticsResponse)
def get_platform_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["administrator"])),
):
    """
    Return platform-wide analytics, aggregated across ALL users.

    Security (identical pattern to GET /admin/users):
      1. No/invalid JWT -> 401, raised inside get_current_user before this
         function body runs.
      2. Valid JWT but role != "administrator" -> 403, raised by
         require_role(["administrator"]) before any query below runs.
      3. Only calculated aggregates are returned -- no individual user
         emails, no password hashes, no per-prediction image paths.

    Every number below comes from a real query against PostgreSQL
    (User, Inventory, Prediction tables). Where an average would be
    misleading with zero real data points (e.g. average circularity
    score when no prediction has one yet), the field is returned as
    null rather than a fake 0 -- the frontend is expected to render
    that as an explicit empty state, not a bogus "0".
    """
    users = db.query(User).all()
    inventory_items = db.query(Inventory).all()
    predictions = db.query(Prediction).all()

    # --- Users ---
    total_users = len(users)
    role_counts = Counter(u.role for u in users)
    users_by_role = [
        {"role": role, "count": count} for role, count in role_counts.most_common()
    ]

    # --- Inventory (already platform-wide; GET /inventory has never been
    # scoped to a single user, unlike predictions/history) ---
    total_inventory_items = len(inventory_items)
    total_textile_quantity = round(
        sum(item.quantity or 0 for item in inventory_items), 2
    )
    fabric_counts = Counter(
        item.fabric_type for item in inventory_items if item.fabric_type
    )
    fabric_distribution = [
        {"fabric_type": fabric, "count": count}
        for fabric, count in fabric_counts.most_common()
    ]

    # --- Predictions (platform-wide). GET /dashboard/stats in predict.py
    # deliberately filters by Prediction.user_id == current_user.id --
    # that's correct for a regular user's own dashboard, but means there
    # was previously no way to see totals across every user. This query
    # intentionally has no user_id filter. ---
    total_predictions = len(predictions)

    waste_category_counts = Counter(
        p.waste_category for p in predictions if p.waste_category
    )
    waste_category_distribution = [
        {"waste_category": category, "count": count}
        for category, count in waste_category_counts.most_common()
    ]

    recyclability_counts = Counter(
        p.recyclability for p in predictions if p.recyclability
    )
    recyclability_distribution = [
        {"recyclability": value, "count": count}
        for value, count in recyclability_counts.most_common()
    ]

    circularity_scores = [
        p.circularity_score for p in predictions if p.circularity_score is not None
    ]
    average_circularity_score = (
        round(mean(circularity_scores), 2) if circularity_scores else None
    )

    # Platform-wide average AI prediction confidence, mirroring the
    # per-user calculation in predict.py's get_dashboard_stats (same
    # "null when no data" rule -- never a fake 0).
    confidences = [p.confidence for p in predictions if p.confidence is not None]
    average_confidence = round(mean(confidences), 2) if confidences else None

    # Daily prediction activity trend, platform-wide -- same
    # group-by-day approach already used (per-user) in
    # predict.py's get_dashboard_stats, just without the user_id filter.
    daily_counts: dict = defaultdict(lambda: {"day": "", "count": 0})
    for prediction in predictions:
        if not prediction.created_at:
            continue
        day_key = prediction.created_at.strftime("%Y-%m-%d")
        day_label = prediction.created_at.strftime("%b %d")
        daily_counts[day_key]["day"] = day_label
        daily_counts[day_key]["count"] += 1

    prediction_trend = [daily_counts[day_key] for day_key in sorted(daily_counts.keys())]

    return {
        "total_users": total_users,
        "users_by_role": users_by_role,
        "total_inventory_items": total_inventory_items,
        "total_textile_quantity": total_textile_quantity,
        "fabric_distribution": fabric_distribution,
        "total_predictions": total_predictions,
        "waste_category_distribution": waste_category_distribution,
        "recyclability_distribution": recyclability_distribution,
        "average_circularity_score": average_circularity_score,
        "average_confidence": average_confidence,
        "prediction_trend": prediction_trend,
    }
