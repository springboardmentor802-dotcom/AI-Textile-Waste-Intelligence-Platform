import io
import json
import logging
import os
import uuid
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean
from typing import Any, Dict

import numpy as np
import tensorflow as tf
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import Prediction
from routes.auth import get_current_user

# --- Milestone 3: Sustainability Intelligence integration ---
from knowledge_base.loader import get_material
from services.sustainability_engine import generate_sustainability_report

# --- Alert & Notification System integration ---
from services.notification_service import create_notification
from services.waste_scoring_engine import CATEGORY_EXCELLENT, CATEGORY_HIGH

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Paths (robust regardless of the working directory uvicorn is run from) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = Path(BASE_DIR).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

FABRIC_MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "best_fabric_model.keras")
DEFECT_MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "best_defect_model.keras")

LABELS_PATH = os.path.join(BASE_DIR, "..", "model", "class_labels.json")

IMG_SIZE = (224, 224)
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# --- Milestone 3: sustainability pipeline defaults ---
# TODO: source real per-item weight once batch/inventory weight capture exists.
DEFAULT_ITEM_WEIGHT_KG = 1.0
# Fallback condition score for any defect label not present in CONDITION_SCORE
# (keeps this distinct from waste_scoring_engine.DEFAULT_CONDITION_SCORE, which
# is a different fallback used when scores are entirely unavailable).
UNKNOWN_DEFECT_CONDITION_SCORE = 80
FALLBACK_RECOMMENDATION_TEXT = "No recommendation available - manual review required."

# --- Load model + labels ONCE at import time (not per-request) ---
# Failures here should crash app startup (fail fast) rather than surface as
# a confusing per-request 500 later - we only add logging for diagnosability.
try:
    fabric_model = tf.keras.models.load_model(FABRIC_MODEL_PATH)
    defect_model = tf.keras.models.load_model(DEFECT_MODEL_PATH)

    with open(LABELS_PATH) as f:
        idx_to_class = json.load(f)

    logger.info("Loaded fabric class labels: %s", idx_to_class)
    logger.info("Number of fabric classes: %d", len(idx_to_class))
except Exception:
    logger.critical("Failed to load ML models or class labels at startup.", exc_info=True)
    raise

# Defect class labels
DEFECT_CLASSES = [
    "Vertical",
    "defect free",
    "hole",
    "horizontal",
    "lines",
    "stain",
]

# --- Milestone 3: Defect severity -> Material Condition score mapping ---
# Feeds the "material_condition" input of the Waste Scoring Engine's
# Circularity Score formula (previously a fixed 80.0 placeholder).
# Keys are lowercased to match `defect_name.lower()` at call time.
CONDITION_SCORE = {
    "defect free": 95,
    "stain": 85,
    "lines": 80,
    "vertical": 70,
    "horizontal": 70,
    "hole": 50,
}


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Decode raw image bytes into a model-ready input array.

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        A (1, H, W, 3) float32 array, resized to IMG_SIZE, with a batch
        dimension prepended.

    Raises:
        UnidentifiedImageError: If PIL cannot identify the image format.
        OSError: If the image data is truncated/corrupted.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(IMG_SIZE)
    array = np.array(image, dtype=np.float32)
    array = np.expand_dims(array, axis=0)  # add batch dimension
    return array


@router.post("/predict")
async def predict_fabric_type(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Classify an uploaded textile image and return a full sustainability report.

    Pipeline:
        1. Validate and persist the uploaded image.
        2. Run fabric classification and defect detection (TensorFlow).
        3. Look up the predicted fabric's Material Knowledge Base entry.
        4. Generate the Milestone 3 sustainability report (environmental
           impact, recycling recommendations, circularity score).
        5. Persist the prediction and return the combined response.

    Raises:
        HTTPException: 400 for invalid/oversized/corrupt input images;
            500 for internal model, knowledge base, sustainability, or
            database failures.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()

    # Check file size
    if len(contents) > MAX_FILE_SIZE_BYTES:
        size_mb = len(contents) / (1024 * 1024)
        logger.warning("Rejected upload: %.2fMB exceeds %dMB limit.", size_mb, MAX_FILE_SIZE_MB)
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {MAX_FILE_SIZE_MB}MB)."
        )

    # Save uploaded image
    file_extension = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as image_file:
        image_file.write(contents)

    image_path = f"uploads/{filename}"

    # Preprocess image
    try:
        processed = preprocess_image(contents)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        logger.warning("Image preprocessing failed for upload %s: %s", filename, exc)
        raise HTTPException(
            status_code=400,
            detail="Could not process image file."
        ) from exc

    # Fabric Prediction
   
    try:
        fabric_predictions = fabric_model.predict(processed, verbose=0)[0]
    except Exception as exc:
        # TensorFlow inference doesn't expose a narrow, stable exception
        # hierarchy to catch selectively - we log the full traceback for
        # diagnostics and surface a generic, user-safe 500 instead of
        # leaking internal model details to the client.
        logger.exception("Fabric model inference failed for upload %s.", filename)
        raise HTTPException(status_code=500, detail="Fabric prediction failed.") from exc

    fabric_top3_idx = np.argsort(fabric_predictions)[::-1][:3]

    top_3_predictions = [
        {
            "material": idx_to_class[str(idx)],
            "confidence": round(float(fabric_predictions[idx]) * 100, 2),
        }
        for idx in fabric_top3_idx
    ]

    predicted_index = int(fabric_top3_idx[0])
    material = idx_to_class[str(predicted_index)]
    confidence = top_3_predictions[0]["confidence"]

    # Defect Prediction
    
    try:
        defect_predictions = defect_model.predict(processed, verbose=0)[0]
    except Exception as exc:
        logger.exception("Defect model inference failed for upload %s.", filename)
        raise HTTPException(status_code=500, detail="Defect prediction failed.") from exc

    defect_index = int(np.argmax(defect_predictions))
    defect_name = DEFECT_CLASSES[defect_index]
    defect_confidence = round(
        float(defect_predictions[defect_index]) * 100,
        2
    )

    # Material Information (Milestone 3)

    try:
        material_info = get_material(material)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e    

    # Derive the item's physical condition score from the defect
    # prediction, feeding the Waste Scoring Engine's Circularity Score
    # formula instead of the previous fixed 80.0 placeholder.
    condition_score = CONDITION_SCORE.get(defect_name.lower(), UNKNOWN_DEFECT_CONDITION_SCORE)
    logger.info(
        "Prediction: material=%s defect=%s condition_score=%d",
        material, defect_name, condition_score,
    )

    # Run the full Milestone 3 pipeline (Environmental Impact,
    # Recycling Recommendation, and Waste Scoring engines) via the
    # Sustainability Intelligence orchestrator.
    try:
        sustainability_report = generate_sustainability_report(
            material=material_info,
            weight_kg=DEFAULT_ITEM_WEIGHT_KG,
            condition_score=condition_score,
        )
    except Exception as exc:
        logger.exception("Sustainability report generation failed for '%s'.", material)
        raise HTTPException(
            status_code=500,
            detail="Unable to generate sustainability report."
        ) from exc

    # Save Prediction
   
    recommendation_text = (
        sustainability_report["recommendations"].get("primary_method")
        or FALLBACK_RECOMMENDATION_TEXT
    )

    prediction = Prediction(
        user_id=current_user.id,
        material=material,
        confidence=confidence,
        # Milestone 3: sourced from the Material Knowledge Base /
        # Sustainability Engine instead of the old MATERIAL_INFO dict.
        waste_category=material_info.waste_category,
        recyclability=material_info.recyclability_type,
        recommendation=recommendation_text,
        image_path=image_path,
        # Milestone 4: persist the numeric sustainability outputs so the
        # Dashboard can compute historical analytics (average circularity
        # score, environmental summary) without re-running the pipeline.
        circularity_score=sustainability_report["waste_scoring"].get("circularity_score"),
        environmental_impact=sustainability_report["environmental_impact"],
    )

    try:
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to save prediction for user_id=%s.", current_user.id)
        raise HTTPException(
            status_code=500,
            detail="Failed to save prediction results."
        ) from exc

    # --- Alert & Notification System ---
    # Only create notifications AFTER the prediction row is successfully
    # committed above, and only on a genuinely successful prediction -
    # any exception before this point (bad image, model failure, DB
    # failure) already returned/raised and never reaches here.

    # A. AI Prediction Completed
    create_notification(
        db=db,
        user_id=current_user.id,
        title="AI Prediction Completed",
        message="Textile material classification has been completed successfully.",
        notification_type="ai_prediction",
        severity="success",
        related_entity_type="prediction",
        related_entity_id=prediction.id,
        background_tasks=background_tasks,
    )

    # C. Recycling Opportunity
    # Reuses the existing Waste Scoring Engine's own category thresholds
    # (CATEGORY_HIGH / CATEGORY_EXCELLENT) rather than inventing a new
    # scoring rule - if this prediction's circularity_category is one of
    # those two documented high-recovery tiers, it's a recycling
    # opportunity.
    circularity_category = sustainability_report.get("waste_scoring", {}).get(
        "circularity_category"
    )
    if circularity_category in (CATEGORY_HIGH, CATEGORY_EXCELLENT):
        create_notification(
            db=db,
            user_id=current_user.id,
            title="Recycling Opportunity",
            message=(
                f"High recovery potential detected for {material}. "
                "Review the recommended recycling strategy."
            ),
            notification_type="recycling_opportunity",
            severity="success",
            related_entity_type="prediction",
            related_entity_id=prediction.id,
            background_tasks=background_tasks,
        )

    # Response (Milestone 3)

    return {
        "material": material,
        "confidence": confidence,

        "defect": defect_name,
        "defect_confidence": defect_confidence,

        # Expose the curated material/recovery fields at the top level too.
        # These are already used for persistence above and are consumed by
        # the Prediction page and PDF export.
        "waste_category": material_info.waste_category,
        "recyclability": material_info.recyclability_type,
        "recommendation": recommendation_text,

        "top_3_predictions": top_3_predictions,

        "sustainability": sustainability_report,
    }


@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Return real, historical prediction analytics for the authenticated user.

    All data comes directly from that user's `Prediction` rows - no
    dummy/placeholder values. Fields sourced from the sustainability
    pipeline (`circularity_score`, `environmental_impact`) may be
    partially or fully unavailable for predictions made before Milestone
    4's schema change; those rows are simply excluded from the relevant
    averages/summaries rather than being backfilled.

    Security: query is filtered by `Prediction.user_id == current_user.id`
    - no other user's data is ever read or returned.
    """
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .all()
    )

    total_predictions = len(predictions)

    empty_environmental_summary = {
        "total_co2_saved_kg": None,
        "total_water_saved_liters": None,
        "total_energy_saved_mj": None,
        "total_landfill_diversion_kg": None,
        "average_environmental_score": None,
        "predictions_with_environmental_data": 0,
    }

    if total_predictions == 0:
        return {
            "total_predictions": 0,
            "most_predicted_fabric": None,
            "average_confidence": None,
            "average_circularity_score": None,
            "fabric_distribution": [],
            "waste_category_distribution": [],
            "sustainability_environmental_summary": empty_environmental_summary,
        }

    material_counts = Counter(p.material for p in predictions)
    waste_category_counts = Counter(p.waste_category for p in predictions)

    most_predicted_fabric = material_counts.most_common(1)[0][0]
    average_confidence = round(mean(p.confidence for p in predictions), 2)

    circularity_scores = [
        p.circularity_score for p in predictions if p.circularity_score is not None
    ]
    average_circularity_score = (
        round(mean(circularity_scores), 2) if circularity_scores else None
    )

    fabric_distribution = [
        {"material": material, "count": count}
        for material, count in material_counts.most_common()
    ]
    waste_category_distribution = [
        {"waste_category": category, "count": count}
        for category, count in waste_category_counts.most_common()
    ]

        # ---------------------------------------------------------
    # Monthly sustainability trends
    # ---------------------------------------------------------

    daily_data = defaultdict(lambda: {
        "circularity_scores": [],
        "co2_saved": [],
        "landfill_diversion": [],
    })

    for prediction in predictions:
        if not prediction.created_at:
            continue

        day_key = prediction.created_at.strftime("%Y-%m-%d")
        day_label = prediction.created_at.strftime("%b %d")

        daily_data[day_key]["day"] = day_label

        # Circularity Score
        if prediction.circularity_score is not None:
            daily_data[day_key]["circularity_scores"].append(
                prediction.circularity_score
            )

        # Environmental Impact
        if prediction.environmental_impact:
            co2 = prediction.environmental_impact.get(
                "estimated_co2_saved_kg"
            )

            landfill = prediction.environmental_impact.get(
                "estimated_landfill_diversion_kg"
            )

            if co2 is not None:
                daily_data[day_key]["co2_saved"].append(co2)

            if landfill is not None:
                daily_data[day_key]["landfill_diversion"].append(
                    landfill
                )

    sustainability_trend = []

    for day_key in sorted(daily_data.keys()):
        data = daily_data[day_key]

        sustainability_trend.append({
            "day": data["day"],

            "circularity_score": (
                round(mean(data["circularity_scores"]), 2)
                if data["circularity_scores"]
                else None
            ),

            "co2_saved_kg": (
                round(sum(data["co2_saved"]), 3)
                if data["co2_saved"]
                else None
            ),

            "landfill_diversion_kg": (
                round(sum(data["landfill_diversion"]), 3)
                if data["landfill_diversion"]
                else None
            ),
        })

    env_records = [p.environmental_impact for p in predictions if p.environmental_impact]

    def _sum_field(field: str):
        values = [r.get(field) for r in env_records if r.get(field) is not None]
        return round(sum(values), 3) if values else None

    def _avg_field(field: str):
        values = [r.get(field) for r in env_records if r.get(field) is not None]
        return round(mean(values), 2) if values else None

    sustainability_environmental_summary = {
        "total_co2_saved_kg": _sum_field("estimated_co2_saved_kg"),
        "total_water_saved_liters": _sum_field("estimated_water_saved_liters"),
        "total_energy_saved_mj": _sum_field("estimated_energy_saved_mj"),
        "total_landfill_diversion_kg": _sum_field("estimated_landfill_diversion_kg"),
        "average_environmental_score": _avg_field("environmental_score"),
        "predictions_with_environmental_data": len(env_records),
    }

    return {
        "total_predictions": total_predictions,
        "most_predicted_fabric": most_predicted_fabric,
        "average_confidence": average_confidence,
        "average_circularity_score": average_circularity_score,
        "fabric_distribution": fabric_distribution,
        "waste_category_distribution": waste_category_distribution,
        "sustainability_environmental_summary": sustainability_environmental_summary,
        "sustainability_trend": sustainability_trend,
    }