from pydantic import BaseModel


class InventoryCreate(BaseModel):
    waste_type: str
    fabric_type: str
    quantity: float
    unit: str
    location: str
    status: str


class InventoryResponse(InventoryCreate):
    id: int

    class Config:
        from_attributes = True