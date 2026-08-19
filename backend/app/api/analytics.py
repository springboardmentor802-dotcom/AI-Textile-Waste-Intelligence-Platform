from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.waste_upload import (
    WasteUpload,
)

from app.utils.role_dependency import (
    require_role,
)

from services.dataset_analytics_service import (
    get_complete_dataset_analytics,
)


router = APIRouter(
    prefix="/analytics",
    tags=[
        "Analytics"
    ],
)


# ==========================================================
# ALLOWED ANALYTICS ROLES
# ==========================================================
#
# Frontend RBAC:
#
# Admin -> Analytics
# NGO   -> Analytics
#
# Industry  -> blocked
# Recycler  -> blocked
#
# Keeping this here makes backend permissions match
# frontend permissions.
# ==========================================================

ANALYTICS_ROLES = [
    "ADMIN",
    "NGO",
]


# ==========================================================
# APPLICATION ANALYTICS
# ==========================================================

@router.get("/")
def get_analytics(
    db: Session = Depends(
        get_db
    ),

    current_user: dict = Depends(
        require_role(
            ANALYTICS_ROLES
        )
    ),
):
    """
    Analytics calculated from textile waste
    records stored in the application database.

    Allowed:
    - Admin
    - NGO
    """

    uploads = (
        db.query(
            WasteUpload
        )
        .all()
    )

    total_uploads = len(
        uploads
    )

    material_count = {}

    impact_count = {}

    recyclable_count = 0

    for item in uploads:

        # ------------------------------------------
        # MATERIAL DISTRIBUTION
        # ------------------------------------------

        if item.material:

            material = (
                item.material
            )

            material_count[
                material
            ] = (
                material_count.get(
                    material,
                    0,
                )
                + 1
            )

        # ------------------------------------------
        # ENVIRONMENTAL IMPACT
        # ------------------------------------------

        if (
            item.environmental_impact
        ):

            impact = (
                item.environmental_impact
            )

            impact_count[
                impact
            ] = (
                impact_count.get(
                    impact,
                    0,
                )
                + 1
            )

        # ------------------------------------------
        # RECYCLABILITY
        # ------------------------------------------

        if item.recycling_method in [
            "Mechanical Recycling",
            "Chemical Recycling",
            "Reuse",
        ]:
            recyclable_count += 1

    recyclable_percentage = 0

    if total_uploads > 0:

        recyclable_percentage = round(
            (
                recyclable_count
                / total_uploads
            )
            * 100,
            2,
        )

    return {
        "total_uploads":
            total_uploads,

        "materials":
            material_count,

        "environmental_impact":
            impact_count,

        "recyclable_percentage":
            recyclable_percentage,

        "accessed_by": {
            "username":
                current_user[
                    "username"
                ],

            "role":
                current_user[
                    "role"
                ],
        },
    }


# ==========================================================
# SYNTHETIC DATASET ANALYTICS
# ==========================================================

@router.get("/dataset")
def get_dataset_analytics(
    current_user: dict = Depends(
        require_role(
            ANALYTICS_ROLES
        )
    ),
):
    """
    Analytics generated from the synthetic
    sustainability dataset.

    Allowed:
    - Admin
    - NGO
    """

    return (
        get_complete_dataset_analytics()
    )