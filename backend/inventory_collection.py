from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import inventory_collection
from datetime import datetime

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

class InventoryItem(BaseModel):
    item_name: str
    material_type: str
    weight_kg: float
    status: str = "Pending"
    created_at: str = str(datetime.now())

@router.post("/add")
async def add_item(item: InventoryItem):
    try:
        new_item = item.dict()
        result = await inventory_collection.insert_one(new_item)
        return {"message": "Item added successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_items():
    items = []
    cursor = inventory_collection.find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        items.append(document)
    return items