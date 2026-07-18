from fastapi import APIRouter, UploadFile, File, Depends
from pathlib import Path
import shutil
import uuid

from sqlalchemy.orm import Session

from app.services.model_service import predict_image
from app.services.recommendation_service import get_recommendation

from app.database import get_db
from app.models.waste_upload import WasteUpload


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


UPLOAD_DIR = Path("temp_uploads")

UPLOAD_DIR.mkdir(exist_ok=True)



@router.post("/")
async def predict_textile(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):


    # Create temporary file name
    file_name = f"{uuid.uuid4()}_{file.filename}"

    file_path = UPLOAD_DIR / file_name



    # Save uploaded image
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )



    # AI Prediction
    prediction = predict_image(file_path)



    # Recommendation
    recommendation = get_recommendation(
        prediction["predicted_class"]
    )



    # Save result into database

    upload_record = WasteUpload(

        image_path=str(file_path),

        predicted_class=
        prediction["predicted_class"],

        confidence=
        prediction["confidence"],


        material=
        recommendation["material"],


        material_type=
        recommendation["type"],


        recycling_method=
recommendation["recyclable_method"],


        environmental_impact=
        recommendation["environmental_impact"],


        biodegradable=
        recommendation["biodegradable"],


        reusable=
        recommendation["reusable"],


        uploaded_by=1

    )



    db.add(upload_record)

    db.commit()

    db.refresh(upload_record)



    return {

        "status": "success",

        "upload_id":
        upload_record.upload_id,


        "fabric_prediction": {

            "class":
            prediction["predicted_class"],

            "confidence":
            prediction["confidence"]

        },


        "material_analysis":
        recommendation

    }