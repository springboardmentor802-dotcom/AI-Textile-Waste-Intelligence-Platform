from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.textile_service import analyze_textile

router = APIRouter(
    prefix="/textile",
    tags=["AI Textile Intelligence"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = analyze_textile(file_path)

    return {
        "status": "success",
        "data": result
    }