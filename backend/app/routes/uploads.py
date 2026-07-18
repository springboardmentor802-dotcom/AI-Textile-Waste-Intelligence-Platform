from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.waste_upload import WasteUpload

from app.utils.auth_dependency import get_current_user
from app.utils.role_dependency import require_role


router = APIRouter(
    prefix="/uploads",
    tags=["Waste Uploads"]
)



class WasteUploadCreate(BaseModel):

    image_path: str

    predicted_class: str

    confidence: float

    uploaded_by: int

    material: str | None = None

    material_type: str | None = None

    recycling_method: str | None = None

    environmental_impact: str | None = None

    biodegradable: bool | None = None

    reusable: bool | None = None




# ==========================
# GET UPLOADS
# ==========================

@router.get("/")
def get_uploads(

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)

):

    uploads = db.query(WasteUpload).all()

    return uploads





# ==========================
# CREATE UPLOAD
# ==========================

@router.post("/")
def create_upload(

    upload: WasteUploadCreate,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        require_role(
            [
                "Admin",
                "Industry",
                "Recycler"
            ]
        )
    )

):


    new_upload = WasteUpload(

        image_path=upload.image_path,

        predicted_class=upload.predicted_class,

        confidence=upload.confidence,

        uploaded_by=upload.uploaded_by,


        material=upload.material,

        material_type=upload.material_type,

        recycling_method=upload.recycling_method,

        environmental_impact=upload.environmental_impact,

        biodegradable=upload.biodegradable,

        reusable=upload.reusable

    )


    db.add(new_upload)

    db.commit()

    db.refresh(new_upload)


    return new_upload