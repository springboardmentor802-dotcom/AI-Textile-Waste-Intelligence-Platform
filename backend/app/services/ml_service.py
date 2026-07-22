"""
Material Recognition Service
Loads the trained Keras CNN model once at startup and provides
prediction functionality for fabric material classification.

Model location: ml_models/saved_models/fabric_material_model.keras
(at the project root, outside the backend folder)
"""

import numpy as np
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
# Class labels
# Must match the exact alphabetical order that Keras ImageDataGenerator
# assigned during training (flow_from_directory sorts folders A-Z).
# To verify: print(train_generator.class_indices) in your Colab notebook.
# ------------------------------------------------------------------ #
MATERIAL_CLASSES = [
    "Acrylic",
    "Blended",
    "Chenille",
    "Corduroy",
    "Cotton",
    "Crepe",
    "Denim",
    "Fleece",
    "Leather",
    "Linen",
    "Nylon",
    "Polyester",
    "Satin",
    "Silk",
    "Terrycloth",
    "Velvet",
    "Viscose",
    "Wool",
]

# ------------------------------------------------------------------ #
# Model configuration
# ------------------------------------------------------------------ #
IMAGE_SIZE = (224, 224)

# Navigate from this file's location up to the project root, then into ml_models
# backend/app/services/ml_service.py
#   → parent = backend/app/services/
#   → parent.parent = backend/app/
#   → parent.parent.parent = backend/
#   → parent.parent.parent.parent = textile-waste-platform/  (project root)
#   → then ml_models/saved_models/fabric_material_model.keras
_THIS_FILE = Path(__file__).resolve()
_PROJECT_ROOT = _THIS_FILE.parent.parent.parent.parent
MODEL_PATH = _PROJECT_ROOT / "ml_models" / "saved_models" / "fabric_material_model.keras"

# ------------------------------------------------------------------ #
# Global model instance — loaded once at startup, reused per request
# ------------------------------------------------------------------ #
_model = None


def load_model() -> None:
    """
    Load the Keras model into memory.
    Called once during FastAPI application startup event.
    Does not crash the server if the model file is missing —
    instead logs a clear warning. The /analysis/status endpoint
    will report the model as unavailable in that case.
    """
    global _model

    logger.info(f"Looking for model at: {MODEL_PATH}")

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at: {MODEL_PATH}\n"
            f"Please place fabric_material_model.keras in:\n"
            f"  ml_models/saved_models/fabric_material_model.keras\n"
            f"(at the project root, not inside the backend folder)"
        )

    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(str(MODEL_PATH))
        logger.info(
            f"Material recognition model loaded successfully. "
            f"Input shape: {_model.input_shape}"
        )
    except Exception as e:
        logger.error(f"Failed to load Keras model: {e}")
        raise RuntimeError(f"Failed to load material recognition model: {str(e)}")


def get_model():
    """
    Return the loaded model instance.
    Raises RuntimeError if load_model() has not been called yet.
    """
    if _model is None:
        raise RuntimeError(
            "ML model is not loaded. "
            "Ensure load_model() was called during application startup."
        )
    return _model


def is_model_loaded() -> bool:
    """Return True if the model is currently loaded in memory."""
    return _model is not None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess raw image bytes to match the training pipeline exactly.

    Training pipeline used:
    - ImageDataGenerator(rescale=1./255)
    - target_size=(224, 224)
    - Images converted to RGB

    Steps:
    1. Decode bytes → PIL Image
    2. Convert to RGB (handles RGBA, grayscale, palette modes)
    3. Resize to 224 × 224
    4. Normalize pixel values to [0, 1] (divide by 255)
    5. Add batch dimension: (224, 224, 3) → (1, 224, 224, 3)

    Args:
        image_bytes: Raw bytes from the uploaded image file.

    Returns:
        numpy array of shape (1, 224, 224, 3), dtype float32.

    Raises:
        ValueError: If the image cannot be decoded or processed.
    """
    from PIL import Image
    import io

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize(IMAGE_SIZE, Image.LANCZOS)
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        return image_array
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {str(e)}")


def predict_material(image_bytes: bytes) -> dict:
    """
    Run fabric material recognition on uploaded image bytes.

    Args:
        image_bytes: Raw bytes from the uploaded image file.

    Returns:
        dict with keys:
        - status: "success"
        - predicted_material: Top predicted class name
        - confidence: Confidence percentage rounded to 2 decimal places
        - confidence_raw: Raw float confidence (0.0 to 1.0)
        - all_predictions: All 18 classes sorted by confidence descending
        - model_version: Version string
        - classes_count: Total number of classes

    Raises:
        ValueError: If image preprocessing fails.
        RuntimeError: If model is not loaded.
    """
    model = get_model()

    # Preprocess image to match training pipeline
    processed = preprocess_image(image_bytes)

    # Run inference — verbose=0 suppresses progress bar output
    raw_predictions = model.predict(processed, verbose=0)

    # raw_predictions shape: (1, 18)
    scores = raw_predictions[0]

    # Top prediction
    top_index = int(np.argmax(scores))
    top_label = MATERIAL_CLASSES[top_index]
    top_confidence = float(scores[top_index])

    # All predictions sorted by confidence descending
    all_predictions = sorted(
        [
            {
                "material": MATERIAL_CLASSES[i],
                "confidence": round(float(scores[i]) * 100, 2),
            }
            for i in range(len(MATERIAL_CLASSES))
        ],
        key=lambda x: x["confidence"],
        reverse=True,
    )

    return {
        "status": "success",
        "predicted_material": top_label,
        "confidence": round(top_confidence * 100, 2),
        "confidence_raw": round(top_confidence, 6),
        "all_predictions": all_predictions,
        "model_version": "1.0.0",
        "classes_count": len(MATERIAL_CLASSES),
    }