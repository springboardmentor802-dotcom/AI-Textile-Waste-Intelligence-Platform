from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.waste_upload import WasteUpload
from app.utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/uploads",
    tags=["Waste Uploads"]
)


class WasteUploadCreate(BaseModel):
    image_path: str
    predicted_class: str
    confidence: float
    uploaded_by: int



@router.get("/")
def get_uploads(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    uploads = db.query(WasteUpload).all()

    return uploads



@router.post("/")
def create_upload(
    upload: WasteUploadCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    new_upload = WasteUpload(

        image_path=upload.image_path,

        predicted_class=upload.predicted_class,

        confidence=upload.confidence,

        uploaded_by=upload.uploaded_by
    )


    db.add(new_upload)

    db.commit()

    db.refresh(new_upload)


    return new_upload