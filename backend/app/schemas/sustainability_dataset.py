from pydantic import BaseModel
from typing import Optional


class SustainabilityDatasetBase(BaseModel):

    brand_id: str
    brand_name: str
    country: Optional[str] = None
    year: Optional[int] = None

    sustainability_rating: Optional[str] = None

    material_type: Optional[str] = None

    eco_friendly_manufacturing: Optional[str] = None

    carbon_footprint_mt: Optional[float] = None

    water_usage_liters: Optional[float] = None

    waste_production_kg: Optional[float] = None

    recycling_programs: Optional[str] = None

    product_lines: Optional[int] = None

    average_price_usd: Optional[float] = None

    market_trend: Optional[str] = None

    certifications: Optional[str] = None


class SustainabilityDatasetCreate(
    SustainabilityDatasetBase
):
    pass


class SustainabilityDatasetResponse(
    SustainabilityDatasetBase
):

    id: int

    class Config:
        from_attributes = True


class SustainabilityDatasetList(BaseModel):

    dataset: list[SustainabilityDatasetResponse]