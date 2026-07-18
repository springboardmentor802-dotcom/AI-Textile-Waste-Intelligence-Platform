from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil
import uuid

from app.services.model_service import predict_image
from app.services.recommendation_service import get_recommendation


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


UPLOAD_DIR = Path("temp_uploads")

UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/")
async def predict_textile(file: UploadFile = File(...)):

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


    return {
        "status": "success",
        "fabric_prediction": {
            "class": prediction["predicted_class"],
            "confidence": prediction["confidence"]
        },
        "material_analysis": recommendation
    }