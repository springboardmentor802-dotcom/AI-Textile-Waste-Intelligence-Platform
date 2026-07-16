from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    organization: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: str = "Textile Manufacturer"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed_roles = [
            "Administrator",
            "Recycling Facility Operator",
            "Sustainability Manager",
            "Textile Manufacturer"
        ]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    password: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed_roles = [
            "Administrator",
            "Recycling Facility Operator",
            "Sustainability Manager",
            "Textile Manufacturer"
        ]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        return v

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- AUTH SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- WASTE BATCH SCHEMAS ---
class WasteBatchBase(BaseModel):
    fabric_type: str
    source: str
    quantity: float = Field(..., gt=0, description="Quantity must be greater than 0")
    unit: str
    color: str
    condition: str
    collection_date: date
    status: str = "Pending"
    notes: Optional[str] = None

    @field_validator("fabric_type")
    @classmethod
    def validate_fabric(cls, v):
        allowed = ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"]
        if v not in allowed:
            raise ValueError(f"Fabric type must be one of {allowed}")
        return v

    @field_validator("condition")
    @classmethod
    def validate_condition(cls, v):
        allowed = ["Clean", "Damaged", "Contaminated", "Wet"]
        if v not in allowed:
            raise ValueError(f"Condition must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        allowed = ["Pending", "Sorting", "Processing", "Recycled", "Disposed"]
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v):
        allowed = ["kg", "lbs", "tons"]
        if v not in allowed:
            raise ValueError(f"Unit must be one of {allowed}")
        return v

class WasteBatchCreate(WasteBatchBase):
    image_analysis_in: Optional[ImageAnalysisBase] = None

class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# --- IMAGE ANALYSIS SCHEMAS ---
class ImageAnalysisBase(BaseModel):
    image_path: str
    fabric_texture: Optional[str] = None
    fabric_pattern: Optional[str] = None
    fabric_color: Optional[str] = None
    damage_detection: Optional[str] = None
    contamination_detection: Optional[str] = None
    predicted_fabric_type: Optional[str] = None
    fiber_composition: Optional[str] = None
    blend_identification: Optional[str] = None
    material_quality: Optional[str] = None
    predicted_waste_category: Optional[str] = None
    recyclability_score: float = 0.0
    reuse_score: float = 0.0
    sustainability_score: float = 0.0
    material_recovery_score: float = 0.0
    circularity_score: float = 0.0

class ImageAnalysisResponse(ImageAnalysisBase):
    id: int
    batch_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class WasteBatchResponse(WasteBatchBase):
    id: int
    batch_id: str
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    image_analysis: Optional[ImageAnalysisResponse] = None

    class Config:
        from_attributes = True

# --- DASHBOARD SCHEMAS ---
class ConditionSummary(BaseModel):
    condition: str
    count: int
    total_quantity: float

class StatusSummary(BaseModel):
    status: str
    count: int
    total_quantity: float

class InventorySummary(BaseModel):
    total_batches: int
    total_quantity: float  # Normalized to kg for aggregation, or simplified sum
    batches_by_condition: List[ConditionSummary]
    batches_by_status: List[StatusSummary]
    recent_collections: List[WasteBatchResponse]
    attention_needed_batches: List[WasteBatchResponse]  # e.g., low-condition (damaged/contaminated) and pending

# --- DATASET SCHEMAS ---
class SampleRecordResponse(BaseModel):
    id: int
    dataset_id: int
    label: str
    image_url_placeholder: Optional[str] = None
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    format: str
    num_records: int
    status: str
    records: List[SampleRecordResponse] = []

    class Config:
        from_attributes = True
