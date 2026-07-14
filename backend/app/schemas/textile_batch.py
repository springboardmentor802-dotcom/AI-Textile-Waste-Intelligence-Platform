from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from datetime import date, datetime
from app.models.textile_batch import FabricType, Condition


class TextileBatchCreate(BaseModel):
    batch_id: str
    fabric_type: FabricType
    source: str
    quantity: float
    color: str
    condition: Condition
    collection_date: date

    @field_validator("batch_id")
    @classmethod
    def batch_id_must_not_be_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Batch ID must not be empty")
        if len(v) > 50:
            raise ValueError("Batch ID must not exceed 50 characters")
        return v

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("source")
    @classmethod
    def source_must_not_be_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Source must not be empty")
        return v

    @field_validator("color")
    @classmethod
    def color_must_not_be_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Color must not be empty")
        return v


class TextileBatchUpdate(BaseModel):
    fabric_type: Optional[FabricType] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[Condition] = None
    collection_date: Optional[date] = None

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v


class TextileBatchResponse(BaseModel):
    id: int
    batch_id: str
    fabric_type: FabricType
    source: str
    quantity: float
    color: str
    condition: Condition
    collection_date: date
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    ml_fabric_classification: Optional[str] = None
    ml_recyclability_score: Optional[float] = None
    ml_circularity_score: Optional[float] = None
    ml_waste_category: Optional[str] = None
    ml_recommendation: Optional[str] = None
    ml_analyzed: Optional[str] = None

    class Config:
        from_attributes = True


class TextileBatchListResponse(BaseModel):
    total: int
    items: list[TextileBatchResponse]