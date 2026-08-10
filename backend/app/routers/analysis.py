"""
Textile Image Analysis Router

Endpoints:
  POST /analysis/material-recognition     — Material recognition only
  POST /analysis/full-analysis            — Complete pipeline + DB persistence
  POST /analysis/bulk-upload              — Bulk analysis (up to 10 images)
  GET  /analysis/report/{session_id}/pdf  — Download PDF report
  GET  /analysis/status                   — Service health check
  GET  /analysis/dashboard-stats          — Dashboard stats (now queries PostgreSQL)
"""

import logging
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc

from app.database import get_db
from app.middleware.auth_middleware import get_current_active_user
from app.models.user import User
from app.models.analysis_result import AnalysisResult
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

# In-memory report cache — kept for PDF download session support
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


def _save_analysis_to_db(
    db: Session,
    session_id: str,
    filename: str,
    current_user: User,
    pipeline_result: dict,
    waste_classification: dict,
) -> None:
    """
    Extract scalar and JSON values from the pipeline result and persist
    them to the analysis_results table.
    This runs after the existing in-memory cache write so it never
    blocks or breaks the existing PDF/report flow.
    """
    try:
        mat = pipeline_result.get("material_recognition", {})
        defect = pipeline_result.get("defect_detection", {})
        waste_cat = pipeline_result.get("waste_categorization", {})
        recyclability = pipeline_result.get("recyclability_assessment", {})
        scores = pipeline_result.get("waste_scores", {})
        sustainability = pipeline_result.get("sustainability_intelligence", {})
        color = pipeline_result.get("color_analysis", {})
        texture = pipeline_result.get("texture_analysis", {})
        pattern = pipeline_result.get("pattern_analysis", {})

        carbon = sustainability.get("carbon_footprint_estimation", {})
        water = sustainability.get("water_savings", {})
        diversion = sustainability.get("waste_diversion_analysis", {})
        circular = sustainability.get("circular_economy_analysis", {})
        bench = sustainability.get("sustainability_benchmarking", {})

        record = AnalysisResult(
            session_id=session_id,
            filename=filename,
            analyzed_by=current_user.id,
            analyzed_by_email=current_user.email,

            # Material
            predicted_material=mat.get("predicted_material"),
            material_confidence=mat.get("confidence"),

            # Defects
            condition=defect.get("condition"),
            defect_count=defect.get("defect_count", 0),
            has_defects=defect.get("has_defects", False),

            # Waste
            waste_category=waste_cat.get("waste_category"),
            waste_justification=waste_cat.get("justification"),

            # Recycling
            primary_recycling_strategy=recyclability.get("primary_recycling_strategy"),
            reuse_potential=recyclability.get("reuse_potential"),
            reuse_opportunity=recyclability.get("reuse_opportunity"),
            upcycling_suggestion=recyclability.get("upcycling_suggestion"),
            material_recovery_recommendation=recyclability.get("material_recovery_recommendation"),
            recycling_options=recyclability.get("recycling_options"),

            # Scores
            recyclability_score=scores.get("recyclability_score"),
            reuse_score=scores.get("reuse_score"),
            sustainability_score=scores.get("sustainability_score"),
            material_recovery_score=scores.get("material_recovery_score"),
            overall_circularity_score=scores.get("overall_circularity_score"),
            circularity_category=scores.get("circularity_category"),
            score_breakdown=scores.get("score_breakdown"),

            # Sustainability
            co2_saved_kg=carbon.get("co2_saved_kg"),
            water_saved_liters=float(water.get("liters_saved", 0)) if water.get("liters_saved") else None,
            diversion_rate=diversion.get("diversion_rate"),
            circular_economy_score=float(circular.get("score", 0)) if circular.get("score") else None,
            sustainability_rating=bench.get("rating"),

            # Visual analysis (JSON)
            color_analysis=color if color else None,
            texture_analysis=texture if texture else None,
            pattern_analysis=pattern if pattern else None,

            # Final classification outputs
            disposal_recommendation=waste_classification.get("disposal_recommendation"),
            final_recommendation=waste_classification.get("final_recommendation"),
            contamination_recommendation=waste_classification.get("contamination_reduction_recommendation"),
        )

        db.add(record)
        db.commit()
        logger.info(f"Analysis result saved to DB: session_id={session_id}, material={mat.get('predicted_material')}")

    except Exception as e:
        db.rollback()
        # Log but do not raise — DB failure must not break the API response
        logger.error(f"Failed to save analysis result to DB: {e}", exc_info=True)


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
# Endpoint 2: Full Analysis Pipeline (with DB persistence)
# ------------------------------------------------------------------ #
@router.post("/full-analysis")
async def full_analysis(
    file: UploadFile = File(..., description="Textile image. JPEG/PNG/WEBP/BMP, max 10 MB."),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Run the complete textile analysis pipeline and persist results to PostgreSQL.

    Flow:
    1. Existing full pipeline runs (unchanged)
    2. Results cached in _report_cache (unchanged — PDF depends on this)
    3. NEW: Key metrics saved to analysis_results table in PostgreSQL
    4. Existing API response returned (unchanged)
    """
    image_bytes = await _read_and_validate(file)
    try:
        pipeline_result = run_full_pipeline(image_bytes, filename=file.filename)
        waste_classification = classify_textile_waste(pipeline_result)
        report_data = generate_report_data(pipeline_result, waste_classification)

        session_id = str(uuid.uuid4())

        # Step 1: Keep existing in-memory cache (PDF depends on this)
        _report_cache[session_id] = report_data

        # Step 2: NEW — persist to PostgreSQL
        _save_analysis_to_db(
            db=db,
            session_id=session_id,
            filename=file.filename or "",
            current_user=current_user,
            pipeline_result=pipeline_result,
            waste_classification=waste_classification,
        )

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
# Endpoint 3: PDF Download (unchanged)
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
# Endpoint 4: Bulk Upload (with DB persistence per image)
# ------------------------------------------------------------------ #
@router.post("/bulk-upload")
async def bulk_upload(
    files: List[UploadFile] = File(..., description="Up to 10 textile images."),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Analyze up to 10 textile images simultaneously. Each is persisted to PostgreSQL."""
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

            # Persist to DB
            _save_analysis_to_db(
                db=db,
                session_id=session_id,
                filename=file.filename or "",
                current_user=current_user,
                pipeline_result=pipeline_result,
                waste_classification=waste_classification,
            )

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
# Endpoint 5: Dashboard Stats (now queries PostgreSQL)
# ------------------------------------------------------------------ #
@router.get("/dashboard-stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Dashboard statistics now sourced from PostgreSQL analysis_results table.
    Falls back gracefully to zeros if no records exist yet.
    Maintains the same response structure as before so existing frontend code is not broken.
    """
    from app.models.textile_batch import TextileBatch

    total_analyzed = db.query(AnalysisResult).count()

    # Category distribution
    category_rows = (
        db.query(AnalysisResult.waste_category, sqlfunc.count(AnalysisResult.id))
        .filter(AnalysisResult.waste_category.isnot(None))
        .group_by(AnalysisResult.waste_category)
        .all()
    )
    by_category = {row[0]: row[1] for row in category_rows}

    # Material distribution
    material_rows = (
        db.query(AnalysisResult.predicted_material, sqlfunc.count(AnalysisResult.id))
        .filter(AnalysisResult.predicted_material.isnot(None))
        .group_by(AnalysisResult.predicted_material)
        .all()
    )
    by_material = {row[0]: row[1] for row in material_rows}

    # Average circularity score
    avg_circularity = (
        db.query(sqlfunc.avg(AnalysisResult.overall_circularity_score))
        .filter(AnalysisResult.overall_circularity_score.isnot(None))
        .scalar()
    )

    # Total CO2 saved
    total_co2 = (
        db.query(sqlfunc.sum(AnalysisResult.co2_saved_kg))
        .filter(AnalysisResult.co2_saved_kg.isnot(None))
        .scalar()
    )

    # Inventory count from TextileBatch table
    total_batches = db.query(TextileBatch).count()

    return {
        "waste_inventory": {
            "total_analyzed": total_analyzed,
            "total_batches_in_inventory": total_batches,
            "by_category": by_category,
            "by_material": by_material,
        },
        "recycling_opportunities": {
            "recyclable_count": by_category.get("Recyclable", 0),
            "reusable_count": by_category.get("Reusable", 0),
            "upcyclable_count": by_category.get("Upcyclable", 0),
            "repairable_count": by_category.get("Repairable", 0),
        },
        "processing_analytics": {
            "average_circularity_score": round(float(avg_circularity), 2) if avg_circularity else 0,
            "total_analyses_in_database": total_analyzed,
        },
        "recovery_statistics": {
            "total_co2_saved_kg": round(float(total_co2), 2) if total_co2 else 0,
        },
        "service_status": {
            "material_recognition": "ready" if is_model_loaded() else "unavailable",
            "defect_detection": "ready" if is_yolo_loaded() else "unavailable",
            "opencv_modules": "ready",
        },
    }


# ------------------------------------------------------------------ #
# Endpoint 6: Analysis Service Status (unchanged)
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
    }