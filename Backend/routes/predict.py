from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from PIL import Image
import numpy as np
import tensorflow as tf
import json
import io

from routes.auth import get_current_user
from models import User

router = APIRouter()

# Load the model and labels once, when the server starts (not on every request)
MODEL_PATH = "model/fabric_classifier.keras"
LABELS_PATH = "model/class_labels.json"

model = tf.keras.models.load_model(MODEL_PATH)

with open(LABELS_PATH, "r") as f:
    class_labels = json.load(f)  # e.g. {"0": "Blended", "1": "Cotton", ...}

IMG_SIZE = (224, 224)

# Simple mapping from material -> waste category & recyclability
# (a reasonable starting point; can be refined with real domain input later)
MATERIAL_INFO = {
    "Cotton":    {"waste_category": "Natural Fiber Waste", "recyclability": "High",
                  "recommendation": "Suitable for textile recycling or composting."},
    "Wool":      {"waste_category": "Natural Fiber Waste", "recyclability": "High",
                  "recommendation": "Suitable for textile recycling or reuse."},
    "Silk":      {"waste_category": "Natural Fiber Waste", "recyclability": "Medium",
                  "recommendation": "Recyclable via specialized natural fiber processors."},
    "Denim":     {"waste_category": "Natural Fiber Waste", "recyclability": "High",
                  "recommendation": "Good candidate for fiber recycling or upcycling."},
    "Polyester": {"waste_category": "Synthetic Fiber Waste", "recyclability": "Medium",
                  "recommendation": "Recyclable via chemical/mechanical polyester recycling."},
    "Blended":   {"waste_category": "Mixed Fiber Waste", "recyclability": "Low",
                  "recommendation": "Blended fibers are harder to recycle; consider downcycling."},
}


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)  # model expects a batch dimension
    return arr


@router.post("/predict")
async def predict_fabric(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file")

    image_bytes = await file.read()

    try:
        processed = preprocess_image(image_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process the uploaded image")

    predictions = model.predict(processed)[0]  # array of 6 probabilities
    predicted_index = int(np.argmax(predictions))
    predicted_label = class_labels[str(predicted_index)]
    confidence = float(predictions[predicted_index]) * 100

    info = MATERIAL_INFO.get(predicted_label, {
        "waste_category": "Unknown",
        "recyclability": "Unknown",
        "recommendation": "Unable to determine recommendation."
    })

    return {
        "material": predicted_label,
        "confidence": round(confidence, 1),
        "waste_category": info["waste_category"],
        "recyclability": info["recyclability"],
        "recommendation": info["recommendation"]
    }