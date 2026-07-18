from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste_upload import WasteUpload


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db)
):

    uploads = db.query(WasteUpload).all()


    total_uploads = len(uploads)


    material_count = {}

    impact_count = {}

    recyclable_count = 0



    for item in uploads:


        # Material count

        if item.material:

            material_count[item.material] = (
                material_count.get(item.material,0)+1
            )



        # Environmental impact

        if item.environmental_impact:

            impact_count[item.environmental_impact] = (
                impact_count.get(item.environmental_impact,0)+1
            )



        # Recycling percentage

        if item.recycling_method:

            recyclable_count += 1




    recyclable_percentage = 0

    if total_uploads > 0:

        recyclable_percentage = round(
            (recyclable_count / total_uploads) * 100,
            2
        )



    return {


        "total_uploads":
        total_uploads,


        "materials":
        material_count,


        "environmental_impact":
        impact_count,


        "recyclable_percentage":
        recyclable_percentage

    }