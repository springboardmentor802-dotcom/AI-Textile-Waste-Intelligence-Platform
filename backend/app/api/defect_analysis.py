from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ml.predict_defect import predict_defect

router = APIRouter(prefix="/defect", tags=["Defect Analysis"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/predict")
async def predict_defect_api(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    prediction, confidence = predict_defect(file_path)

    return {
        "status": "success",
        "prediction": prediction,
        "confidence": round(confidence, 2)
    }