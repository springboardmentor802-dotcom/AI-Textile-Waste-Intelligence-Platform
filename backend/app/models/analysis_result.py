"""
AnalysisResult Model
Persists the key outputs of every successful full-analysis run to PostgreSQL.
This is the foundation for all Milestone 3 sustainability dashboards and APIs.

Design decisions:
- Scalar metrics stored as individual Float/String columns for fast aggregation.
- Complex nested structures (color, texture, pattern, score breakdown) stored as JSON
  because they are only read whole, never filtered on individual sub-fields.
- session_id links this record back to the in-memory _report_cache for PDF downloads.
- analyzed_by is a nullable FK to users.id — nullable so the table does not break
  if a user is later deleted.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    # ------------------------------------------------------------------ #
    # Identification
    # ------------------------------------------------------------------ #
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(36), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=True)
    analyzed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    analyzed_by_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ------------------------------------------------------------------ #
    # Material Recognition
    # ------------------------------------------------------------------ #
    predicted_material = Column(String(100), nullable=True)
    material_confidence = Column(Float, nullable=True)   # 0–100 percent

    # ------------------------------------------------------------------ #
    # Defect Detection
    # ------------------------------------------------------------------ #
    condition = Column(String(20), nullable=True)        # Good / Fair / Poor
    defect_count = Column(Integer, default=0)
    has_defects = Column(Boolean, default=False)

    # ------------------------------------------------------------------ #
    # Waste Classification
    # ------------------------------------------------------------------ #
    waste_category = Column(String(50), nullable=True)   # Reusable / Recyclable / etc.
    waste_justification = Column(Text, nullable=True)

    # ------------------------------------------------------------------ #
    # Recycling Recommendations
    # ------------------------------------------------------------------ #
    primary_recycling_strategy = Column(String(100), nullable=True)
    reuse_potential = Column(String(20), nullable=True)   # High / Medium / Low
    reuse_opportunity = Column(Text, nullable=True)
    upcycling_suggestion = Column(Text, nullable=True)
    material_recovery_recommendation = Column(Text, nullable=True)
    recycling_options = Column(JSONB, nullable=True)      # list of strategy names

    # ------------------------------------------------------------------ #
    # Waste Scores  (0–100 for all)
    # ------------------------------------------------------------------ #
    recyclability_score = Column(Float, nullable=True)
    reuse_score = Column(Float, nullable=True)
    sustainability_score = Column(Float, nullable=True)
    material_recovery_score = Column(Float, nullable=True)
    overall_circularity_score = Column(Float, nullable=True)
    circularity_category = Column(String(100), nullable=True)
    score_breakdown = Column(JSONB, nullable=True)         # full component breakdown

    # ------------------------------------------------------------------ #
    # Sustainability / Environmental Metrics
    # ------------------------------------------------------------------ #
    co2_saved_kg = Column(Float, nullable=True)
    water_saved_liters = Column(Float, nullable=True)
    diversion_rate = Column(String(20), nullable=True)     # e.g. "90-100%"
    circular_economy_score = Column(Float, nullable=True)
    sustainability_rating = Column(String(20), nullable=True)  # Excellent / Good / Fair / Poor

    # ------------------------------------------------------------------ #
    # OpenCV Visual Analysis (stored as JSON — read whole, never filtered)
    # ------------------------------------------------------------------ #
    color_analysis = Column(JSONB, nullable=True)
    texture_analysis = Column(JSONB, nullable=True)
    pattern_analysis = Column(JSONB, nullable=True)

    # ------------------------------------------------------------------ #
    # Full Classification Output
    # ------------------------------------------------------------------ #
    disposal_recommendation = Column(Text, nullable=True)
    final_recommendation = Column(Text, nullable=True)
    contamination_recommendation = Column(Text, nullable=True)

    def __repr__(self):
        return (
            f"<AnalysisResult id={self.id} "
            f"material={self.predicted_material} "
            f"circularity={self.overall_circularity_score}>"
        )