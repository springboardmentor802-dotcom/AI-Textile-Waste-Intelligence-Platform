from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class InventoryCreate(BaseModel):
    batch_id: str = Field(..., min_length=3)
    fabric_type: str
    source: str
    quantity: float
    unit: str = "kg"
    color: str
    condition: str
    collection_date: datetime
    location: str
    status: str = "Pending"


class InventoryUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[datetime] = None
    location: Optional[str] = None
    status: Optional[str] = None