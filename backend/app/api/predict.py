from fastapi import APIRouter, File, UploadFile
from typing import List
from PIL import Image

from app.ml.model_loader import load_model
from app.ml.predictor import predict

router = APIRouter()

MODEL = None


@router.on_event("startup")
def startup():

    global MODEL

    try:
        MODEL = load_model("models/fabric_classifier.pth")

    except Exception:
        MODEL = None


@router.post("/predict")
async def predict_fabric(file: UploadFile = File(...)):

    if MODEL is None:
        return {
            "success": False,
            "message": "Model not loaded."
        }

    image = Image.open(file.file)

    return predict(MODEL, image)

@router.post("/predict-multiple")
async def predict_multiple(files: List[UploadFile] = File(...)):

    if MODEL is None:
        return {
            "success": False,
            "message": "Model not loaded."
        }

    reports = []

    for file in files:

        image = Image.open(file.file)

        report = predict(MODEL, image)

        reports.append(report)

    return reports