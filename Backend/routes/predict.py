import io
import json
import os

import numpy as np
import tensorflow as tf
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image

from routes.auth import get_current_user

router = APIRouter()

# --- Paths (robust regardless of the working directory uvicorn is run from) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "fabric_classifier.keras")
LABELS_PATH = os.path.join(BASE_DIR, "..", "model", "class_labels.json")

IMG_SIZE = (224, 224)
MAX_FILE_SIZE_MB = 10

# --- Load model + labels ONCE at import time (not per-request) ---
model = tf.keras.models.load_model(MODEL_PATH)

with open(LABELS_PATH) as f:
    idx_to_class = json.load(f)  # e.g. {"0": "Blended", "1": "Cotton", ...}

# --- Waste / recyclability lookup table ---

MATERIAL_INFO = {
    "Cotton": {
        "waste_category": "Natural Fiber Waste",
        "recyclability": "High",
        "recommendation": "Suitable for textile recycling or composting.",
    },
    "Blended": {
        "waste_category": "Mixed Fiber Waste",
        "recyclability": "Moderate",
        "recommendation": "Recyclability depends on the exact fiber mix; check for fiber-separation options before recycling.",
    },
    "Polyester": {
        "waste_category": "Synthetic Fiber Waste",
        "recyclability": "Moderate",
        "recommendation": "Suitable for mechanical or chemical recycling into new polyester fiber.",
    },
    "Denim": {
        "waste_category": "Natural Fiber Waste (Heavy Cotton)",
        "recyclability": "High",
        "recommendation": "Good candidate for fiber-to-fiber recycling or upcycling.",
    },
    "Wool": {
        "waste_category": "Natural Fiber Waste (Animal)",
        "recyclability": "High",
        "recommendation": "Suitable for shoddy wool recycling or composting (biodegradable).",
    },
   
    "Nylon": {
        "waste_category": "Synthetic Fiber Waste",
        "recyclability": "Moderate",
        "recommendation": "Recyclable via specialized nylon regeneration processes; not curbside recyclable.",
    },
    "Silk": {
        "waste_category": "Natural Fiber Waste (Protein)",
        "recyclability": "Low",
        "recommendation": "Limited recycling infrastructure available; prefer reuse or donation.",
    },
    "Viscose": {
        "waste_category": "Semi-Synthetic Fiber Waste",
        "recyclability": "Moderate",
        "recommendation": "Biodegradable under industrial composting; check local textile recycling programs.",
    },
    "Fleece": {
        "waste_category": "Synthetic Fiber Waste",
        "recyclability": "Moderate",
        "recommendation": "Often made from recycled polyester already; suitable for further polyester recycling streams.",
    },
    "Terrycloth": {
        "waste_category": "Natural Fiber Waste (Cotton Loop Pile)",
        "recyclability": "High",
        "recommendation": "Suitable for textile recycling or repurposing (e.g. cleaning rags) before recycling.",
    },
}


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)
    array = np.array(image, dtype=np.float32)
    array = np.expand_dims(array, axis=0)  # add batch dimension
    return array


@router.post("/predict")
async def predict_fabric_type(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large (max {MAX_FILE_SIZE_MB}MB).")

    try:
        processed = preprocess_image(contents)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image file.")

    predictions = model.predict(processed, verbose=0)[0]

    # Top-3, sorted by confidence descending
    top_3_idx = np.argsort(predictions)[::-1][:3]
    top_3_predictions = [
        {
            "material": idx_to_class[str(idx)],
            "confidence": round(float(predictions[idx]) * 100, 2),
        }
        for idx in top_3_idx
    ]

    predicted_index = int(top_3_idx[0])
    material = idx_to_class[str(predicted_index)]
    confidence = top_3_predictions[0]["confidence"]

    info = MATERIAL_INFO.get(
        material,
        {
            "waste_category": "Unknown",
            "recyclability": "Unknown",
            "recommendation": "No recommendation available for this material yet.",
        },
    )

    return {
        "material": material,
        "confidence": confidence,
        "waste_category": info["waste_category"],
        "recyclability": info["recyclability"],
        "recommendation": info["recommendation"],
        "top_3_predictions": top_3_predictions,
    }