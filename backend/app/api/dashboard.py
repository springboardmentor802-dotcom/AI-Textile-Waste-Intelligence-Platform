from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.textile_inventory import TextileInventory
from app.models.user import User
from app.models.waste_upload import WasteUpload
from app.utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Role Based Dashboard"],
)


# ==========================================================
# ROLE DISPLAY NAMES
# ==========================================================

ROLE_DISPLAY_NAMES = {
    "Admin": "Administrator",
    "Industry": "Textile Manufacturer",
    "Recycler": "Recycling Facility Operator",
    "NGO": "Sustainability Manager",
}


# ==========================================================
# HELPERS
# ==========================================================

def safe_number(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def average(values):
    cleaned = [
        safe_number(value)
        for value in values
        if value is not None
    ]

    if not cleaned:
        return 0

    return round(
        sum(cleaned) / len(cleaned),
        2,
    )


def count_values(values):
    cleaned = [
        str(value).strip()
        for value in values
        if value is not None
        and str(value).strip()
    ]

    return dict(
        Counter(cleaned)
    )


# ==========================================================
# ROLE BASED DASHBOARD
# ==========================================================

@router.get("/")
def get_role_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    role = current_user["role"]
    user_id = current_user["user_id"]

    # ======================================================
    # DATA SCOPE BY ROLE
    # ======================================================
    #
    # Admin:
    #     Platform-wide data
    #
    # NGO / Sustainability Manager:
    #     Platform-wide sustainability data
    #
    # Recycler:
    #     Platform-wide recycling workload
    #
    # Industry / Manufacturer:
    #     Only uploads created by that user
    # ======================================================

    if role in [
        "Admin",
        "NGO",
        "Recycler",
    ]:

        uploads = (
            db.query(WasteUpload)
            .all()
        )

    else:

        uploads = (
            db.query(WasteUpload)
            .filter(
                WasteUpload.uploaded_by
                ==
                user_id
            )
            .all()
        )

    # Inventory is platform-level operational data.
    inventory = (
        db.query(TextileInventory)
        .all()
    )

    # ======================================================
    # COMMON METRICS
    # ======================================================

    total_weight = round(
        sum(
            safe_number(
                item.weight_kg
            )
            for item in uploads
        ),
        2,
    )

    completed_assessments = sum(
        1
        for item in uploads
        if str(
            item.assessment_status
            or ""
        ).strip().lower()
        ==
        "completed"
    )

    manual_review_required = sum(
        1
        for item in uploads
        if bool(
            item.requires_manual_review
        )
    )

    reusable_items = sum(
        1
        for item in uploads
        if bool(
            item.reusable
        )
    )

    recyclable_items = sum(
        1
        for item in uploads
        if item.recycling_method
        and str(
            item.recycling_method
        ).strip()
    )

    average_sustainability_score = average(
        [
            item.sustainability_score
            for item in uploads
        ]
    )

    average_reuse_score = average(
        [
            item.reuse_score
            for item in uploads
        ]
    )

    average_recovery_score = average(
        [
            item.recovery_score
            for item in uploads
        ]
    )

    materials = count_values(
        [
            item.material
            for item in uploads
        ]
    )

    recovery_categories = count_values(
        [
            item.recovery_category
            for item in uploads
        ]
    )

    recycling_methods = count_values(
        [
            item.recycling_method
            for item in uploads
        ]
    )

    circularity_levels = count_values(
        [
            item.circularity_level
            for item in uploads
        ]
    )

    conditions = count_values(
        [
            item.condition
            for item in uploads
        ]
    )

    contamination_levels = count_values(
        [
            item.contamination_status
            for item in uploads
        ]
    )

    common = {
        "total_analyses":
            len(uploads),

        "total_weight_kg":
            total_weight,

        "completed_assessments":
            completed_assessments,

        "manual_review_required":
            manual_review_required,

        "reusable_items":
            reusable_items,

        "recyclable_items":
            recyclable_items,

        "average_sustainability_score":
            average_sustainability_score,

        "average_reuse_score":
            average_reuse_score,

        "average_recovery_score":
            average_recovery_score,

        "materials":
            materials,

        "recovery_categories":
            recovery_categories,

        "recycling_methods":
            recycling_methods,

        "circularity_levels":
            circularity_levels,

        "conditions":
            conditions,

        "contamination_levels":
            contamination_levels,
    }

    # ======================================================
    # ADMIN DASHBOARD
    # ======================================================

    if role == "Admin":

        users = (
            db.query(User)
            .all()
        )

        role_distribution = count_values(
            [
                user.role
                for user in users
            ]
        )

        inventory_weight = round(
            sum(
                safe_number(
                    item.waste_weight
                )
                for item in inventory
            ),
            2,
        )

        return {
            "role":
                role,

            "display_role":
                ROLE_DISPLAY_NAMES.get(
                    role,
                    role,
                ),

            "dashboard_type":
                "admin",

            "common":
                common,

            "admin": {
                "total_users":
                    len(users),

                "total_inventory_batches":
                    len(inventory),

                "total_inventory_weight_kg":
                    inventory_weight,

                "total_platform_uploads":
                    len(uploads),

                "role_distribution":
                    role_distribution,
            },
        }

    # ======================================================
    # TEXTILE MANUFACTURER DASHBOARD
    # ======================================================

    if role == "Industry":

        high_recovery_items = sum(
            1
            for item in uploads
            if safe_number(
                item.recovery_score
            ) >= 70
        )

        high_sustainability_items = sum(
            1
            for item in uploads
            if safe_number(
                item.sustainability_score
            ) >= 70
        )

        return {
            "role":
                role,

            "display_role":
                ROLE_DISPLAY_NAMES.get(
                    role,
                    role,
                ),

            "dashboard_type":
                "manufacturer",

            "common":
                common,

            "manufacturer": {
                "production_waste_kg":
                    total_weight,

                "material_distribution":
                    materials,

                "condition_distribution":
                    conditions,

                "recovery_distribution":
                    recovery_categories,

                "high_recovery_items":
                    high_recovery_items,

                "high_sustainability_items":
                    high_sustainability_items,

                "average_sustainability_score":
                    average_sustainability_score,
            },
        }

    # ======================================================
    # RECYCLING FACILITY OPERATOR DASHBOARD
    # ======================================================

    if role == "Recycler":

        high_recovery_opportunities = sum(
            1
            for item in uploads
            if safe_number(
                item.recovery_score
            ) >= 70
        )

        mechanical_recycling = sum(
            1
            for item in uploads
            if str(
                item.recycling_method
                or ""
            ).strip().lower()
            ==
            "mechanical recycling"
        )

        chemical_recycling = sum(
            1
            for item in uploads
            if str(
                item.recycling_method
                or ""
            ).strip().lower()
            ==
            "chemical recycling"
        )

        reusable_recovery = sum(
            1
            for item in uploads
            if str(
                item.recovery_category
                or ""
            ).strip().lower()
            ==
            "reuse"
        )

        return {
            "role":
                role,

            "display_role":
                ROLE_DISPLAY_NAMES.get(
                    role,
                    role,
                ),

            "dashboard_type":
                "recycler",

            "common":
                common,

            "recycler": {
                "recovery_opportunities":
                    high_recovery_opportunities,

                "mechanical_recycling":
                    mechanical_recycling,

                "chemical_recycling":
                    chemical_recycling,

                "reuse_opportunities":
                    reusable_recovery,

                "recycling_methods":
                    recycling_methods,

                "recovery_categories":
                    recovery_categories,

                "average_recovery_score":
                    average_recovery_score,

                "manual_review_queue":
                    manual_review_required,
            },
        }

    # ======================================================
    # SUSTAINABILITY MANAGER DASHBOARD
    # ======================================================

    if role == "NGO":

        high_sustainability_assessments = sum(
            1
            for item in uploads
            if safe_number(
                item.sustainability_score
            ) >= 70
        )

        low_sustainability_assessments = sum(
            1
            for item in uploads
            if (
                item.sustainability_score
                is not None
                and safe_number(
                    item.sustainability_score
                ) < 40
            )
        )

        scored_assessments = sum(
            1
            for item in uploads
            if item.sustainability_score
            is not None
        )

        return {
            "role":
                role,

            "display_role":
                ROLE_DISPLAY_NAMES.get(
                    role,
                    role,
                ),

            "dashboard_type":
                "sustainability",

            "common":
                common,

            "sustainability": {
                "scored_assessments":
                    scored_assessments,

                "high_sustainability_assessments":
                    high_sustainability_assessments,

                "low_sustainability_assessments":
                    low_sustainability_assessments,

                "average_sustainability_score":
                    average_sustainability_score,

                "average_recovery_score":
                    average_recovery_score,

                "circularity_levels":
                    circularity_levels,

                "recovery_categories":
                    recovery_categories,

                "material_distribution":
                    materials,

                "contamination_distribution":
                    contamination_levels,
            },
        }

    # ======================================================
    # UNKNOWN ROLE FALLBACK
    # ======================================================

    return {
        "role":
            role,

        "display_role":
            ROLE_DISPLAY_NAMES.get(
                role,
                role,
            ),

        "dashboard_type":
            "basic",

        "common":
            common,
    }