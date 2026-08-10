"""
Sustainability Intelligence Router
Provides aggregated sustainability analytics from the analysis_results PostgreSQL table.

All endpoints require authentication.
Data is sourced entirely from persisted AnalysisResult records — no in-memory cache.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc, extract

from app.database import get_db
from app.middleware.auth_middleware import get_current_active_user
from app.models.user import User
from app.models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sustainability", tags=["Sustainability Intelligence"])


# ------------------------------------------------------------------ #
# GET /sustainability/overview
# ------------------------------------------------------------------ #
@router.get("/overview")
async def get_sustainability_overview(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Aggregated sustainability KPIs across all analyses in the database.
    Returns: totals, averages, and distribution breakdowns.
    """
    total = db.query(AnalysisResult).count()

    if total == 0:
        return {
            "total_analyses": 0,
            "message": "No analysis records found. Run analyses to populate this data.",
            "avg_sustainability_score": None,
            "avg_circularity_score": None,
            "avg_recyclability_score": None,
            "avg_reuse_score": None,
            "avg_material_recovery_score": None,
            "total_co2_saved_kg": 0,
            "total_water_saved_liters": 0,
            "waste_category_distribution": {},
            "sustainability_rating_distribution": {},
            "circularity_category_distribution": {},
        }

    def avg_col(col):
        result = db.query(sqlfunc.avg(col)).filter(col.isnot(None)).scalar()
        return round(float(result), 2) if result else None

    def sum_col(col):
        result = db.query(sqlfunc.sum(col)).filter(col.isnot(None)).scalar()
        return round(float(result), 2) if result else 0.0

    def distribution(col):
        rows = (
            db.query(col, sqlfunc.count(AnalysisResult.id))
            .filter(col.isnot(None))
            .group_by(col)
            .all()
        )
        return {row[0]: row[1] for row in rows}

    return {
        "total_analyses": total,
        "avg_sustainability_score": avg_col(AnalysisResult.sustainability_score),
        "avg_circularity_score": avg_col(AnalysisResult.overall_circularity_score),
        "avg_recyclability_score": avg_col(AnalysisResult.recyclability_score),
        "avg_reuse_score": avg_col(AnalysisResult.reuse_score),
        "avg_material_recovery_score": avg_col(AnalysisResult.material_recovery_score),
        "total_co2_saved_kg": sum_col(AnalysisResult.co2_saved_kg),
        "total_water_saved_liters": sum_col(AnalysisResult.water_saved_liters),
        "waste_category_distribution": distribution(AnalysisResult.waste_category),
        "sustainability_rating_distribution": distribution(AnalysisResult.sustainability_rating),
        "circularity_category_distribution": distribution(AnalysisResult.circularity_category),
    }


# ------------------------------------------------------------------ #
# GET /sustainability/by-material
# ------------------------------------------------------------------ #
@router.get("/by-material")
async def get_sustainability_by_material(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Sustainability metrics grouped by predicted material type.
    Allows comparison of which materials perform best across analyses.
    """
    rows = (
        db.query(
            AnalysisResult.predicted_material,
            sqlfunc.count(AnalysisResult.id).label("analysis_count"),
            sqlfunc.avg(AnalysisResult.sustainability_score).label("avg_sustainability_score"),
            sqlfunc.avg(AnalysisResult.overall_circularity_score).label("avg_circularity_score"),
            sqlfunc.avg(AnalysisResult.recyclability_score).label("avg_recyclability_score"),
            sqlfunc.avg(AnalysisResult.material_recovery_score).label("avg_recovery_score"),
            sqlfunc.sum(AnalysisResult.co2_saved_kg).label("total_co2_saved_kg"),
            sqlfunc.sum(AnalysisResult.water_saved_liters).label("total_water_saved_liters"),
        )
        .filter(AnalysisResult.predicted_material.isnot(None))
        .group_by(AnalysisResult.predicted_material)
        .order_by(sqlfunc.count(AnalysisResult.id).desc())
        .all()
    )

    def r(val):
        return round(float(val), 2) if val is not None else None

    return {
        "total_materials_analyzed": len(rows),
        "materials": [
            {
                "material": row.predicted_material,
                "analysis_count": row.analysis_count,
                "avg_sustainability_score": r(row.avg_sustainability_score),
                "avg_circularity_score": r(row.avg_circularity_score),
                "avg_recyclability_score": r(row.avg_recyclability_score),
                "avg_recovery_score": r(row.avg_recovery_score),
                "total_co2_saved_kg": r(row.total_co2_saved_kg),
                "total_water_saved_liters": r(row.total_water_saved_liters),
            }
            for row in rows
        ],
    }


# ------------------------------------------------------------------ #
# GET /sustainability/by-category
# ------------------------------------------------------------------ #
@router.get("/by-category")
async def get_sustainability_by_category(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Analysis results aggregated by waste category.
    Returns count, percentage, and average scores per category.
    """
    total = db.query(AnalysisResult).count()

    rows = (
        db.query(
            AnalysisResult.waste_category,
            sqlfunc.count(AnalysisResult.id).label("count"),
            sqlfunc.avg(AnalysisResult.overall_circularity_score).label("avg_circularity"),
            sqlfunc.avg(AnalysisResult.recyclability_score).label("avg_recyclability"),
            sqlfunc.sum(AnalysisResult.co2_saved_kg).label("total_co2"),
        )
        .filter(AnalysisResult.waste_category.isnot(None))
        .group_by(AnalysisResult.waste_category)
        .order_by(sqlfunc.count(AnalysisResult.id).desc())
        .all()
    )

    def r(val):
        return round(float(val), 2) if val is not None else None

    return {
        "total_analyses": total,
        "categories": [
            {
                "category": row.waste_category,
                "count": row.count,
                "percentage": round((row.count / total * 100), 1) if total > 0 else 0,
                "avg_circularity_score": r(row.avg_circularity),
                "avg_recyclability_score": r(row.avg_recyclability),
                "total_co2_saved_kg": r(row.total_co2),
            }
            for row in rows
        ],
    }


# ------------------------------------------------------------------ #
# GET /sustainability/recent
# ------------------------------------------------------------------ #
@router.get("/recent")
async def get_recent_analyses(
    limit: int = Query(default=10, ge=1, le=50, description="Number of recent records to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Return the most recent analysis records from PostgreSQL.
    Useful for dashboard activity feeds.
    """
    records = (
        db.query(AnalysisResult)
        .order_by(AnalysisResult.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "count": len(records),
        "records": [
            {
                "id": r.id,
                "session_id": r.session_id,
                "filename": r.filename,
                "analyzed_by_email": r.analyzed_by_email,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "predicted_material": r.predicted_material,
                "material_confidence": r.material_confidence,
                "condition": r.condition,
                "waste_category": r.waste_category,
                "overall_circularity_score": r.overall_circularity_score,
                "sustainability_score": r.sustainability_score,
                "co2_saved_kg": r.co2_saved_kg,
                "primary_recycling_strategy": r.primary_recycling_strategy,
            }
            for r in records
        ],
    }


# ------------------------------------------------------------------ #
# GET /sustainability/environmental-impact
# ------------------------------------------------------------------ #
@router.get("/environmental-impact")
async def get_environmental_impact(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Aggregated environmental impact metrics from all analyses.
    Includes monthly breakdown using created_at timestamps.
    """
    total = db.query(AnalysisResult).count()

    total_co2 = db.query(sqlfunc.sum(AnalysisResult.co2_saved_kg)).filter(
        AnalysisResult.co2_saved_kg.isnot(None)
    ).scalar() or 0.0

    total_water = db.query(sqlfunc.sum(AnalysisResult.water_saved_liters)).filter(
        AnalysisResult.water_saved_liters.isnot(None)
    ).scalar() or 0.0

    avg_co2 = round(float(total_co2) / total, 4) if total > 0 else 0.0
    avg_water = round(float(total_water) / total, 2) if total > 0 else 0.0

    # Monthly breakdown using PostgreSQL date_trunc
    monthly_rows = (
        db.query(
            sqlfunc.date_trunc("month", AnalysisResult.created_at).label("month"),
            sqlfunc.count(AnalysisResult.id).label("analysis_count"),
            sqlfunc.sum(AnalysisResult.co2_saved_kg).label("co2_saved"),
            sqlfunc.sum(AnalysisResult.water_saved_liters).label("water_saved"),
            sqlfunc.avg(AnalysisResult.overall_circularity_score).label("avg_circularity"),
        )
        .filter(AnalysisResult.created_at.isnot(None))
        .group_by(sqlfunc.date_trunc("month", AnalysisResult.created_at))
        .order_by(sqlfunc.date_trunc("month", AnalysisResult.created_at).asc())
        .all()
    )

    def r(val):
        return round(float(val), 2) if val is not None else 0.0

    monthly = [
        {
            "month": row.month.strftime("%Y-%m") if row.month else None,
            "analysis_count": row.analysis_count,
            "co2_saved_kg": r(row.co2_saved),
            "water_saved_liters": r(row.water_saved),
            "avg_circularity_score": r(row.avg_circularity),
        }
        for row in monthly_rows
    ]

    return {
        "total_analyses": total,
        "total_co2_saved_kg": round(float(total_co2), 2),
        "avg_co2_saved_per_analysis": avg_co2,
        "total_water_saved_liters": round(float(total_water), 2),
        "avg_water_saved_per_analysis": avg_water,
        "monthly_breakdown": monthly,
    }


# ------------------------------------------------------------------ #
# GET /sustainability/circular-economy
# ------------------------------------------------------------------ #
@router.get("/circular-economy")
async def get_circular_economy_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Circular economy analytics aggregated from all analysis records.
    Uses the existing scoring_service outputs stored in the database.
    """
    total = db.query(AnalysisResult).count()

    def avg_col(col):
        result = db.query(sqlfunc.avg(col)).filter(col.isnot(None)).scalar()
        return round(float(result), 2) if result else None

    def distribution(col):
        rows = (
            db.query(col, sqlfunc.count(AnalysisResult.id))
            .filter(col.isnot(None))
            .group_by(col)
            .all()
        )
        return {row[0]: row[1] for row in rows}

    # Material-wise circularity
    material_rows = (
        db.query(
            AnalysisResult.predicted_material,
            sqlfunc.count(AnalysisResult.id).label("count"),
            sqlfunc.avg(AnalysisResult.overall_circularity_score).label("avg_circularity"),
            sqlfunc.avg(AnalysisResult.recyclability_score).label("avg_recyclability"),
        )
        .filter(AnalysisResult.predicted_material.isnot(None))
        .group_by(AnalysisResult.predicted_material)
        .order_by(sqlfunc.avg(AnalysisResult.overall_circularity_score).desc())
        .all()
    )

    # Category-wise circularity
    category_rows = (
        db.query(
            AnalysisResult.waste_category,
            sqlfunc.count(AnalysisResult.id).label("count"),
            sqlfunc.avg(AnalysisResult.overall_circularity_score).label("avg_circularity"),
        )
        .filter(AnalysisResult.waste_category.isnot(None))
        .group_by(AnalysisResult.waste_category)
        .order_by(sqlfunc.avg(AnalysisResult.overall_circularity_score).desc())
        .all()
    )

    def r(val):
        return round(float(val), 2) if val is not None else None

    return {
        "total_analyses": total,
        "avg_overall_circularity_score": avg_col(AnalysisResult.overall_circularity_score),
        "avg_recyclability_score": avg_col(AnalysisResult.recyclability_score),
        "avg_reuse_score": avg_col(AnalysisResult.reuse_score),
        "avg_material_recovery_score": avg_col(AnalysisResult.material_recovery_score),
        "avg_sustainability_score": avg_col(AnalysisResult.sustainability_score),
        "circularity_category_distribution": distribution(AnalysisResult.circularity_category),
        "material_circularity": [
            {
                "material": row.predicted_material,
                "count": row.count,
                "avg_circularity_score": r(row.avg_circularity),
                "avg_recyclability_score": r(row.avg_recyclability),
            }
            for row in material_rows
        ],
        "category_circularity": [
            {
                "category": row.waste_category,
                "count": row.count,
                "avg_circularity_score": r(row.avg_circularity),
            }
            for row in category_rows
        ],
    }