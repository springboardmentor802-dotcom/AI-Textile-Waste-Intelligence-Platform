"""
Pydantic schemas for AnalysisResult API responses.
"""

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class AnalysisResultResponse(BaseModel):
    id: int
    session_id: str
    filename: Optional[str] = None
    analyzed_by: Optional[int] = None
    analyzed_by_email: Optional[str] = None
    created_at: Optional[datetime] = None

    # Material
    predicted_material: Optional[str] = None
    material_confidence: Optional[float] = None

    # Defects
    condition: Optional[str] = None
    defect_count: Optional[int] = None
    has_defects: Optional[bool] = None

    # Waste
    waste_category: Optional[str] = None
    waste_justification: Optional[str] = None

    # Recycling
    primary_recycling_strategy: Optional[str] = None
    reuse_potential: Optional[str] = None
    recycling_options: Optional[Any] = None

    # Scores
    recyclability_score: Optional[float] = None
    reuse_score: Optional[float] = None
    sustainability_score: Optional[float] = None
    material_recovery_score: Optional[float] = None
    overall_circularity_score: Optional[float] = None
    circularity_category: Optional[str] = None
    score_breakdown: Optional[Any] = None

    # Sustainability
    co2_saved_kg: Optional[float] = None
    water_saved_liters: Optional[float] = None
    diversion_rate: Optional[str] = None
    circular_economy_score: Optional[float] = None
    sustainability_rating: Optional[str] = None

    # Recommendations
    disposal_recommendation: Optional[str] = None
    final_recommendation: Optional[str] = None

    class Config:
        from_attributes = True


class SustainabilityOverview(BaseModel):
    total_analyses: int
    avg_sustainability_score: Optional[float] = None
    avg_circularity_score: Optional[float] = None
    avg_recyclability_score: Optional[float] = None
    avg_reuse_score: Optional[float] = None
    avg_material_recovery_score: Optional[float] = None
    total_co2_saved_kg: Optional[float] = None
    total_water_saved_liters: Optional[float] = None
    avg_diversion_rate_description: Optional[str] = None
    waste_category_distribution: dict
    sustainability_rating_distribution: dict


class MaterialSustainabilityStats(BaseModel):
    material: str
    analysis_count: int
    avg_sustainability_score: Optional[float] = None
    avg_circularity_score: Optional[float] = None
    avg_recyclability_score: Optional[float] = None
    total_co2_saved_kg: Optional[float] = None
    total_water_saved_liters: Optional[float] = None
    avg_recovery_score: Optional[float] = None


class CategoryStats(BaseModel):
    category: str
    count: int
    percentage: float
    avg_circularity_score: Optional[float] = None
    avg_recyclability_score: Optional[float] = None


class EnvironmentalImpactResponse(BaseModel):
    total_analyses: int
    total_co2_saved_kg: float
    avg_co2_saved_per_analysis: float
    total_water_saved_liters: float
    avg_water_saved_per_analysis: float
    monthly_breakdown: List[dict]


class CircularEconomyResponse(BaseModel):
    total_analyses: int
    avg_circularity_score: Optional[float] = None
    avg_recyclability_score: Optional[float] = None
    avg_reuse_score: Optional[float] = None
    avg_material_recovery_score: Optional[float] = None
    avg_sustainability_score: Optional[float] = None
    circularity_category_distribution: dict
    material_circularity: List[dict]
    category_circularity: List[dict]


class RecommendationSummaryResponse(BaseModel):
    total_analyses: int
    strategy_distribution: dict
    most_common_strategy: Optional[str] = None
    reuse_potential_distribution: dict
    waste_category_distribution: dict