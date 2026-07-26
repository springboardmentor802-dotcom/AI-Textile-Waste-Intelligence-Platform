"""
Textile Image Analysis Router

Endpoints:
  POST /analysis/material-recognition     — Material recognition only
  POST /analysis/full-analysis            — Complete pipeline
  POST /analysis/bulk-upload              — Bulk analysis (up to 10 images)
  GET  /analysis/report/{session_id}/pdf  — Download PDF report
  GET  /analysis/status                   — Service health check
  GET  /analysis/dashboard-stats          — Dashboard backend support
"""

import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.middleware.auth_middleware import get_current_active_user
from app.models.user import User
from app.services.ml_service import (
    predict_material, is_model_loaded, MODEL_PATH, MATERIAL_CLASSES,
)
from app.services.yolo_service import is_yolo_loaded, YOLO_MODEL_PATH
from app.services.analysis_pipeline import run_full_pipeline
from app.services.waste_classification_engine import classify_textile_waste
from app.services.report_service import generate_report_data, generate_pdf_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Textile Image Analysis"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp",
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
MAX_BULK_FILES = 10

# In-memory report cache for PDF download (keyed by session_id)
# In production, replace with Redis or database storage
_report_cache: dict = {}


def _validate_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, WEBP, or BMP.",
        )


async def _read_and_validate(file: UploadFile) -> bytes:
    _validate_file(file)
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit.")
    return image_bytes


# ------------------------------------------------------------------ #
# Endpoint 1: Material Recognition Only
# ------------------------------------------------------------------ #
@router.post("/material-recognition")
async def recognize_material(
    file: UploadFile = File(..., description="Textile image. JPEG/PNG/WEBP/BMP, max 10 MB."),
    current_user: User = Depends(get_current_active_user),
):
    """Predict fabric material type from an uploaded image."""
    image_bytes = await _read_and_validate(file)
    try:
        result = predict_material(image_bytes)
        result["filename"] = file.filename
        result["analyzed_by"] = current_user.email
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Material recognition error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis failed.")


# ------------------------------------------------------------------ #
# Endpoint 2: Full Analysis Pipeline
# ------------------------------------------------------------------ #
@router.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(..., description="Textile image. JPEG/PNG/WEBP/BMP, max 10 MB."),
    current_user: User = Depends(get_current_active_user),
):
    """
    Run the complete textile analysis pipeline and return a unified result.
    Includes: Material Recognition, Defect Detection, Color/Texture/Pattern Analysis,
    Waste Categorization, Recyclability Assessment, Sustainability Intelligence, Scoring.
    """
    image_bytes = await _read_and_validate(file)
    try:
        pipeline_result = run_full_pipeline(image_bytes, filename=file.filename)
        waste_classification = classify_textile_waste(pipeline_result)
        report_data = generate_report_data(pipeline_result, waste_classification)

        # Cache report for PDF download
        session_id = str(uuid.uuid4())
        _report_cache[session_id] = report_data

        return {
            "session_id": session_id,
            "filename": file.filename,
            "analyzed_by": current_user.email,
            "pipeline_result": pipeline_result,
            "waste_classification": waste_classification,
            "report_summary": report_data,
            "pdf_download_url": f"/analysis/report/{session_id}/pdf",
        }

    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Full analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Full analysis failed.")


# ------------------------------------------------------------------ #
# Endpoint 3: PDF Download
# ------------------------------------------------------------------ #
@router.get("/report/{session_id}/pdf")
async def download_pdf_report(
    session_id: str,
    current_user: User = Depends(get_current_active_user),
):
    """Download a PDF report for a previously analyzed image."""
    report_data = _report_cache.get(session_id)
    if not report_data:
        raise HTTPException(
            status_code=404,
            detail="Report not found. Run /analysis/full-analysis first.",
        )
    try:
        pdf_bytes = generate_pdf_report(report_data, filename=session_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="textile_report_{session_id[:8]}.pdf"'
            },
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------------------------------------------------------ #
# Endpoint 4: Bulk Upload
# ------------------------------------------------------------------ #
@router.post("/bulk-upload")
async def bulk_upload(
    files: List[UploadFile] = File(..., description="Up to 10 textile images."),
    current_user: User = Depends(get_current_active_user),
):
    """
    Analyze up to 10 textile images simultaneously.
    Each image is processed independently.
    Returns results and PDF download URLs for each image.
    """
    if len(files) > MAX_BULK_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_BULK_FILES} files allowed per bulk upload.",
        )
    if len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    results = []
    for file in files:
        item = {"filename": file.filename, "status": "success"}
        try:
            image_bytes = await _read_and_validate(file)
            pipeline_result = run_full_pipeline(image_bytes, filename=file.filename)
            waste_classification = classify_textile_waste(pipeline_result)
            report_data = generate_report_data(pipeline_result, waste_classification)

            session_id = str(uuid.uuid4())
            _report_cache[session_id] = report_data

            item["session_id"] = session_id
            item["material"] = pipeline_result["material_recognition"].get("predicted_material")
            item["confidence"] = pipeline_result["material_recognition"].get("confidence")
            item["condition"] = pipeline_result["defect_detection"].get("condition")
            item["waste_category"] = pipeline_result["waste_categorization"].get("waste_category")
            item["circularity_score"] = pipeline_result["waste_scores"].get("overall_circularity_score")
            item["pdf_download_url"] = f"/analysis/report/{session_id}/pdf"

        except HTTPException as e:
            item["status"] = "error"
            item["error"] = e.detail
        except Exception as e:
            item["status"] = "error"
            item["error"] = str(e)
            logger.error(f"Bulk upload error for {file.filename}: {e}", exc_info=True)

        results.append(item)

    successful = sum(1 for r in results if r["status"] == "success")
    return {
        "total_uploaded": len(files),
        "successful": successful,
        "failed": len(files) - successful,
        "results": results,
        "analyzed_by": current_user.email,
    }


# ------------------------------------------------------------------ #
# Endpoint 5: Dashboard Stats
# ------------------------------------------------------------------ #
@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
):
    """
    Provide backend statistics for dashboard consumption.
    Returns waste inventory summary, recycling opportunities,
    processing analytics, and recovery statistics.
    """
    cached_reports = list(_report_cache.values())
    total_analyzed = len(cached_reports)

    # Aggregate from cache
    categories = {}
    materials = {}
    total_circularity = 0
    total_co2 = 0.0

    for report in cached_reports:
        # Waste categories
        cat = report.get("waste_assessment", {}).get("waste_category", "Unknown")
        categories[cat] = categories.get(cat, 0) + 1

        # Materials
        mat = report.get("material_analysis", {}).get("material_type", "Unknown")
        materials[mat] = materials.get(mat, 0) + 1

        # Scores
        total_circularity += report.get("scores", {}).get("overall_circularity_score", 0)

        # Sustainability
        co2 = report.get("sustainability_report", {}).get(
            "carbon_footprint", {}
        ).get("co2_saved_kg", 0)
        total_co2 += co2

    avg_circularity = round(total_circularity / total_analyzed, 1) if total_analyzed > 0 else 0

    return {
        "waste_inventory": {
            "total_analyzed": total_analyzed,
            "by_category": categories,
            "by_material": materials,
        },
        "recycling_opportunities": {
            "recyclable_count": categories.get("Recyclable", 0),
            "reusable_count": categories.get("Reusable", 0),
            "upcyclable_count": categories.get("Upcyclable", 0),
        },
        "processing_analytics": {
            "average_circularity_score": avg_circularity,
            "sessions_in_cache": total_analyzed,
        },
        "recovery_statistics": {
            "total_co2_saved_kg": round(total_co2, 2),
        },
        "service_status": {
            "material_recognition": "ready" if is_model_loaded() else "unavailable",
            "defect_detection": "ready" if is_yolo_loaded() else "unavailable",
            "opencv_modules": "ready",
        },
    }


# ------------------------------------------------------------------ #
# Endpoint 6: Analysis Service Status
# ------------------------------------------------------------------ #
@router.get("/status")
async def get_analysis_service_status(
    current_user: User = Depends(get_current_active_user),
):
    """Check whether all ML models are loaded and services are ready."""
    model_ready = is_model_loaded()
    yolo_ready = is_yolo_loaded()

    return {
        "service": "Textile Image Analysis Engine",
        "overall_status": "ready" if (model_ready and yolo_ready) else "partial",
        "material_recognition": {
            "status": "ready" if model_ready else "unavailable",
            "model_file": "fabric_material_model.keras",
            "model_path_exists": MODEL_PATH.exists(),
            "model_loaded": model_ready,
            "classes": len(MATERIAL_CLASSES),
            "class_labels": MATERIAL_CLASSES,
        },
        "defect_detection": {
            "status": "ready" if yolo_ready else "unavailable",
            "model_file": "best.pt",
            "model_path_exists": YOLO_MODEL_PATH.exists(),
            "model_loaded": yolo_ready,
        },
        "opencv_modules": {
            "color_analysis": "ready",
            "texture_analysis": "ready",
            "pattern_analysis": "ready",
        },
        "upcoming_modules": [
            "Advanced Color Profiling",
            "Fiber Composition Estimation",
            "Real-time Batch Processing",
        ],
    }