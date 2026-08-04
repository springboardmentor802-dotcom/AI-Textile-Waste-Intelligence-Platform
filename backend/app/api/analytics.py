from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste_upload import WasteUpload

from services.dataset_analytics_service import (
    get_complete_dataset_analytics,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
):
    """
    Existing application analytics based on uploaded
    textile waste records stored in the database.
    """

    uploads = db.query(
        WasteUpload
    ).all()

    total_uploads = len(
        uploads
    )

    material_count = {}

    impact_count = {}

    recyclable_count = 0

    for item in uploads:

        if item.material:

            material_count[
                item.material
            ] = (
                material_count.get(
                    item.material,
                    0,
                )
                + 1
            )

        if item.environmental_impact:

            impact_count[
                item.environmental_impact
            ] = (
                impact_count.get(
                    item.environmental_impact,
                    0,
                )
                + 1
            )

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
        "total_uploads": total_uploads,
        "materials": material_count,
        "environmental_impact": impact_count,
        "recyclable_percentage": recyclable_percentage,
    }


@router.get("/dataset")
def get_dataset_analytics():
    """
    Analytics generated from the synthetic
    sustainability dataset.
    """

    return get_complete_dataset_analytics()