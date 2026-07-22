"""
Textile Image Analysis Router

Currently implemented:
  - POST /analysis/material-recognition  (Material Recognition CNN)
  - GET  /analysis/status                (Model health check)

Future modules (not yet implemented):
  - Color Analysis
  - Texture Analysis
  - Pattern Analysis
  - Damage Detection (YOLOv8)
  - Contamination Detection (YOLOv8)
"""

import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.middleware.auth_middleware import get_current_active_user
from app.models.user import User
from app.services.ml_service import (
    predict_material,
    is_model_loaded,
    MODEL_PATH,
    MATERIAL_CLASSES,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Textile Image Analysis"])

# Accepted image MIME types
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/bmp",
}

# Maximum upload size: 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


def _validate_uploaded_file(file: UploadFile) -> None:
    """
    Validate content type of the uploaded file.
    Raises HTTPException 415 if the file is not an accepted image type.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Accepted formats: JPEG, PNG, WEBP, BMP."
            ),
        )


@router.post("/material-recognition")
async def recognize_material(
    file: UploadFile = File(
        ...,
        description="Textile fabric image. Accepted formats: JPEG, PNG, WEBP, BMP. Max size: 10 MB.",
    ),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload a textile fabric image and receive a material classification prediction.

    The model classifies fabric into one of 18 categories:
    Acrylic, Blended, Chenille, Corduroy, Cotton, Crepe, Denim,
    Fleece, Leather, Linen, Nylon, Polyester, Satin, Silk,
    Terrycloth, Velvet, Viscose, Wool.

    Returns:
    - predicted_material: The most likely fabric material
    - confidence: Confidence percentage (0 to 100)
    - all_predictions: Full ranked list of all 18 materials with scores
    """
    # Step 1: Validate file type
    _validate_uploaded_file(file)

    # Step 2: Read file bytes
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}",
        )

    # Step 3: Validate file size
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds the 10 MB limit.",
        )

    # Step 4: Run prediction
    try:
        result = predict_material(image_bytes)
    except RuntimeError as e:
        # Model not loaded
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML service unavailable: {str(e)}",
        )
    except ValueError as e:
        # Image could not be preprocessed
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image could not be processed: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error during material recognition: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during analysis.",
        )

    # Step 5: Attach request metadata and return
    result["filename"] = file.filename
    result["content_type"] = file.content_type
    result["analyzed_by"] = current_user.email

    logger.info(
        f"Material recognition: '{result['predicted_material']}' "
        f"({result['confidence']}%) — file: {file.filename} — user: {current_user.email}"
    )

    return result


@router.get("/status")
async def get_analysis_service_status(
    current_user: User = Depends(get_current_active_user),
):
    """
    Check whether the ML model is loaded and the analysis service is ready.

    Use this endpoint immediately after server startup to verify:
    - The model file was found
    - The model loaded into memory successfully
    - The class labels are correctly configured
    """
    model_ready = is_model_loaded()
    model_file_exists = MODEL_PATH.exists()

    return {
        "service": "Textile Image Analysis Engine",
        "overall_status": "ready" if model_ready else "unavailable",
        "material_recognition": {
            "status": "ready" if model_ready else "unavailable",
            "model_file": "fabric_material_model.keras",
            "model_path": str(MODEL_PATH),
            "model_file_exists_on_disk": model_file_exists,
            "model_loaded_in_memory": model_ready,
            "input_size": "224 x 224",
            "classes_count": len(MATERIAL_CLASSES),
            "class_labels": MATERIAL_CLASSES,
        },
        "upcoming_modules": [
            "Color Analysis",
            "Texture Analysis",
            "Pattern Analysis",
            "Damage Detection (YOLOv8)",
            "Contamination Detection (YOLOv8)",
        ],
    }