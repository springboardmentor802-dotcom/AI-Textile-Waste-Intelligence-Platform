from fastapi import APIRouter, UploadFile
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ml_engine"))
from serve import analyze_image

router = APIRouter()

@router.post("/api/inventory/analyze")
async def analyze(file: UploadFile):
    result = analyze_image(await file.read())
    return result