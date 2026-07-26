"""
YOLOv8 Defect Detection Service
Loads best.pt once at startup and runs defect detection on textile images.
"""

import numpy as np
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Path to the YOLOv8 model at project root
_THIS_FILE = Path(__file__).resolve()
_PROJECT_ROOT = _THIS_FILE.parent.parent.parent.parent
YOLO_MODEL_PATH = _PROJECT_ROOT / "ml_models" / "saved_models" / "best.pt"

_yolo_model = None


def load_yolo_model() -> None:
    """
    Load the YOLOv8 model into memory at startup.
    """
    global _yolo_model

    if not YOLO_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"YOLOv8 model not found at: {YOLO_MODEL_PATH}\n"
            f"Place best.pt in ml_models/saved_models/best.pt"
        )

    try:
        from ultralytics import YOLO
        _yolo_model = YOLO(str(YOLO_MODEL_PATH))
        logger.info(f"YOLOv8 defect detection model loaded from {YOLO_MODEL_PATH}")
    except Exception as e:
        raise RuntimeError(f"Failed to load YOLOv8 model: {str(e)}")


def is_yolo_loaded() -> bool:
    return _yolo_model is not None


def detect_defects(image_bytes: bytes) -> dict:
    """
    Run YOLOv8 defect detection on uploaded image bytes.

    Args:
        image_bytes: Raw image bytes

    Returns:
        dict with defects list, defect_count, has_defects, condition
    """
    if _yolo_model is None:
        raise RuntimeError("YOLOv8 model is not loaded.")

    import cv2
    from PIL import Image
    import io

    try:
        # Decode image
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image_pil)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Run YOLO inference
        results = _yolo_model(image_bgr, verbose=False)

        defects = []
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                defect = {
                    "class_id": int(box.cls[0]),
                    "class_name": result.names[int(box.cls[0])],
                    "confidence": round(float(box.conf[0]) * 100, 2),
                    "bbox": [
                        round(float(box.xyxy[0][0]), 2),
                        round(float(box.xyxy[0][1]), 2),
                        round(float(box.xyxy[0][2]), 2),
                        round(float(box.xyxy[0][3]), 2),
                    ],
                }
                defects.append(defect)

        has_defects = len(defects) > 0

        # Determine material condition based on defects
        if not has_defects:
            condition = "Good"
        elif len(defects) <= 2:
            condition = "Fair"
        else:
            condition = "Poor"

        return {
            "defects": defects,
            "defect_count": len(defects),
            "has_defects": has_defects,
            "condition": condition,
        }

    except Exception as e:
        logger.error(f"Defect detection failed: {e}")
        return {
            "defects": [],
            "defect_count": 0,
            "has_defects": False,
            "condition": "Unknown",
            "error": str(e),
        }