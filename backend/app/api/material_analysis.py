from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ml.predict import predict_image

router = APIRouter(prefix="/material", tags=["Material Analysis"])

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/predict")
async def predict_material(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    predicted_class, fabric, confidence = predict_image(file_path)

    return {
        "status": "success",
        "class_id": predicted_class,
        "surface": fabric["surface"],
        "material": fabric["material"],
        "recyclability": fabric["recyclability"],
        "reuse": fabric["reuse"],
        "confidence": round(confidence, 2)
    }