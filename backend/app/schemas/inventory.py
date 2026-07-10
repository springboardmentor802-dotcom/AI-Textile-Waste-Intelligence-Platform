from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InventoryBase(BaseModel):

    textile_name: str
    textile_type: str
    material: str

    color: Optional[str] = None

    quantity: float

    unit: str

    waste_type: str

    quality: Optional[str] = None

    location: Optional[str] = None

    description: Optional[str] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    pass


class InventoryResponse(InventoryBase):

    id: int

    manufacturer_id: int

    status: str

    created_at: datetime

    class Config:
        from_attributes = True


class InventoryListResponse(BaseModel):

    inventory: list[InventoryResponse]