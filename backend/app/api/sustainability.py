from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ml.predict import predict_image
from ml.predict_defect import predict_defect
from app.services.sustainability_service import generate_sustainability

router = APIRouter(
    prefix="/sustainability",
    tags=["Sustainability Intelligence"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/analyze")
async def analyze_sustainability(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    class_id, fabric, material_confidence = predict_image(file_path)
    defect_prediction, defect_confidence = predict_defect(file_path)

    sustainability = generate_sustainability(
        material=fabric["material"],
        defect=defect_prediction
    )

    confidence = round((material_confidence + defect_confidence) / 2, 2)

    return {
        "status": "success",
        "material": fabric["material"],
        "surface": fabric["surface"],
        "defect": defect_prediction,
        "confidence": confidence,
        **sustainability
    }