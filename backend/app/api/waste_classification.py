from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ml.predict import predict_image
from ml.predict_defect import predict_defect
from app.services.waste_service import classify_waste

router = APIRouter(
    prefix="/waste",
    tags=["Waste Classification"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/classify")
async def classify(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Material Prediction
    class_id, fabric, material_confidence = predict_image(file_path)

    # Defect Prediction
    defect_prediction, defect_confidence = predict_defect(file_path)

    # Business Rules
    waste = classify_waste(
        material=fabric["material"],
        defect=defect_prediction,
        recyclability=fabric["recyclability"],
        reuse=fabric["reuse"],
    )

    confidence = round(
        (material_confidence + defect_confidence) / 2,
        2
    )

    return {
        "status": "success",
        "material": fabric["material"],
        "surface": fabric["surface"],
        "defect": defect_prediction,
        "condition": waste["condition"],
        "waste_category": waste["waste_category"],
        "recyclability": waste["recyclability"],
        "reuse_potential": waste["reuse_potential"],
        "processing_recommendation": waste["processing_recommendation"],
        "priority": waste["priority"],
        "confidence": confidence,
    }