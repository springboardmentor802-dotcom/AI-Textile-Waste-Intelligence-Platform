from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste_upload import WasteUpload

router = APIRouter(
    prefix="/uploads",
    tags=["Waste Uploads"]
)


@router.get("/")
def get_uploads(db: Session = Depends(get_db)):
    uploads = db.query(WasteUpload).all()
    return uploads