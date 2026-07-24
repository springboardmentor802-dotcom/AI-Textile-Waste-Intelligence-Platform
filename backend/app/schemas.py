from pydantic import BaseModel, EmailStr
from app.models import UserRole

# Schemas for API Input (Requests)
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schemas for API Output (Responses)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models import FabricTypeEnum, ConditionEnum, StatusEnum

# 1. Schema for Waste Registration Input Validation
class InventoryCreate(BaseModel):
    batch_id: str = Field(..., description="Unique Waste Batch ID")
    fabric_type: FabricTypeEnum
    source: str = Field(..., description="Waste source tracking (e.g., Production Scrap)")
    quantity: float = Field(..., gte=0.0, description="Quantity in Kg")
    color: str
    condition: ConditionEnum
    collection_date: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True

# 2. Schema for Inventory Updates (All fields optional for dynamic PUT requests)
class InventoryUpdate(BaseModel):
    fabric_type: Optional[FabricTypeEnum] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[ConditionEnum] = None
    status: Optional[StatusEnum] = None

    class Config:
        use_enum_values = True
from pydantic import BaseModel
from typing import Optional, List

# Circularity Assessment Inputs
class MaterialAssessmentInput(BaseModel):
    material_type: str
    material_condition: str
    reuse_potential: str
    environmental_benefit: str
    processing_feasibility: str
    waste_weight_kg: float

# Individual Prediction Breakdown
class AssessmentResult(BaseModel):
    score: float
    category: str

# API Full Response format
class SustainabilityReportResponse(BaseModel):
    status: str
    batch_details: MaterialAssessmentInput
    metrics: AssessmentResult
    co2_savings_estimated_kg: float
    water_savings_estimated_liters: float