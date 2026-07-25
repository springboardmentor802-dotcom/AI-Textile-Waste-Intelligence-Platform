from datetime import datetime, date
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import inventory_collection, waste_batches_collection

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

VALID_CONDITIONS = [
    "Recyclable",
    "Reusable",
    "Repairable",
    "Upcyclable",
    "Compostable",
    "Hazardous",
]

class WasteBatch(BaseModel):
    fabric_type: str
    source: str
    quantity_kg: float = Field(gt=0)
    color: Optional[str] = None
    condition: str = "Recyclable"
    collection_date: str = Field(default_factory=lambda: date.today().isoformat())
    notes: Optional[str] = None

    def validated_condition(self) -> str:
        return self.condition if self.condition in VALID_CONDITIONS else "Recyclable"

class WasteBatchUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity_kg: Optional[float] = Field(default=None, gt=0)
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[str] = None
    notes: Optional[str] = None

def _serialize_batch(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    doc["batch_id"] = doc["_id"]
    return doc

def _resolve_batch_id(batch_id: str):
    if not batch_id or not batch_id.strip():
        raise HTTPException(status_code=400, detail="Invalid batch id.")
    try:
        return ObjectId(batch_id)
    except (InvalidId, TypeError):
        return batch_id

@router.post("/batches")
async def create_batch(batch: WasteBatch):
    try:
        payload = batch.dict()
        payload["condition"] = batch.validated_condition()
        payload["created_at"] = datetime.utcnow().isoformat()
        payload["updated_at"] = payload["created_at"]
        result = await waste_batches_collection.insert_one(payload)
        return {"message": "Batch registered successfully", "batch_id": str(result.inserted_id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/batches/monitoring")
async def get_batch_monitoring():
    batches = [doc async for doc in waste_batches_collection.find({})]

    total_batches = len(batches)
    total_quantity_kg = round(sum(b.get("quantity_kg", 0) for b in batches), 2)

    def _breakdown(field: str) -> list[dict]:
        groups: dict[str, dict] = {}
        for b in batches:
            key = b.get(field) or "Unspecified"
            g = groups.setdefault(key, {"label": key, "batch_count": 0, "quantity_kg": 0.0})
            g["batch_count"] += 1
            g["quantity_kg"] += b.get("quantity_kg", 0)

        rows = []
        for g in groups.values():
            g["quantity_kg"] = round(g["quantity_kg"], 2)
            g["percentage_of_volume"] = (
                round((g["quantity_kg"] / total_quantity_kg) * 100, 1) if total_quantity_kg else 0.0
            )
            rows.append(g)
        return sorted(rows, key=lambda r: r["quantity_kg"], reverse=True)

    return {
        "total_batches": total_batches,
        "total_quantity_kg": total_quantity_kg,
        "by_condition": _breakdown("condition"),
        "by_fabric_type": _breakdown("fabric_type"),
        "by_source": _breakdown("source"),
    }

@router.get("/batches/reduction-strategy")
async def get_reduction_strategy():
    monitoring = await get_batch_monitoring()
    total_quantity_kg = monitoring["total_quantity_kg"]

    strategies: list[str] = []

    if monitoring["total_batches"] == 0:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "total_quantity_kg": 0,
            "strategies": [
                "No batches registered yet -- register waste batches to start generating "
                "reduction strategy insights."
            ],
        }

    condition_map = {row["label"]: row for row in monitoring["by_condition"]}

    hazardous = condition_map.get("Hazardous")
    if hazardous and hazardous["percentage_of_volume"] >= 15:
        strategies.append(
            f"{hazardous['percentage_of_volume']}% of volume is Hazardous -- investigate "
            f"contamination sources at collection points before it grows further."
        )

    reusable = condition_map.get("Reusable", {"percentage_of_volume": 0})
    repairable = condition_map.get("Repairable", {"percentage_of_volume": 0})
    reuse_share = reusable["percentage_of_volume"] + repairable["percentage_of_volume"]
    if reuse_share >= 30:
        strategies.append(
            f"{round(reuse_share, 1)}% of volume is Reusable or Repairable -- prioritize a "
            f"donation/resale/repair pipeline for these batches before routing anything to "
            f"recycling, to capture the most value out of the material."
        )

    compostable = condition_map.get("Compostable")
    if compostable and compostable["percentage_of_volume"] >= 10:
        strategies.append(
            f"{compostable['percentage_of_volume']}% of volume is Compostable -- set up a "
            f"dedicated compost stream so natural fibers don't get bundled with synthetics."
        )

    if monitoring["by_fabric_type"]:
        top_fabric = monitoring["by_fabric_type"][0]
        if top_fabric["percentage_of_volume"] >= 40:
            strategies.append(
                f"{top_fabric['label']} makes up {top_fabric['percentage_of_volume']}% of "
                f"total volume -- consolidate it into dedicated bulk batches for more "
                f"efficient single-material recycling runs."
            )

    if monitoring["by_source"]:
        top_source = monitoring["by_source"][0]
        if top_source["percentage_of_volume"] >= 50:
            strategies.append(
                f"Over half of incoming volume comes from '{top_source['label']}' -- consider "
                f"a source-specific sorting workflow to speed up intake."
            )

    if not strategies:
        strategies.append(
            "Waste distribution currently looks balanced across conditions and sources -- "
            "no urgent reduction actions flagged. Keep monitoring as volume grows."
        )

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "total_quantity_kg": total_quantity_kg,
        "strategies": strategies,
    }

@router.get("/batches")
async def list_batches(
    fabric_type: Optional[str] = Query(default=None),
    condition: Optional[str] = Query(default=None),
    source: Optional[str] = Query(default=None),
):
    query = {}
    if fabric_type:
        query["fabric_type"] = fabric_type
    if condition:
        query["condition"] = condition
    if source:
        query["source"] = source

    batches = []
    cursor = waste_batches_collection.find(query).sort("created_at", -1)
    async for document in cursor:
        batches.append(_serialize_batch(document))
    return batches

@router.get("/batches/{batch_id}")
async def get_batch(batch_id: str):
    doc = await waste_batches_collection.find_one({"_id": _resolve_batch_id(batch_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return _serialize_batch(doc)

@router.patch("/batches/{batch_id}")
async def update_batch(batch_id: str, update: WasteBatchUpdate):
    resolved_id = _resolve_batch_id(batch_id)

    changes = {k: v for k, v in update.dict().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    if "condition" in changes and changes["condition"] not in VALID_CONDITIONS:
        changes["condition"] = "Recyclable"

    changes["updated_at"] = datetime.utcnow().isoformat()

    result = await waste_batches_collection.update_one({"_id": resolved_id}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found.")

    doc = await waste_batches_collection.find_one({"_id": resolved_id})
    return _serialize_batch(doc)

@router.delete("/batches/{batch_id}")
async def delete_batch(batch_id: str):
    resolved_id = _resolve_batch_id(batch_id)
    result = await waste_batches_collection.delete_one({"_id": resolved_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found.")
    return {"message": "Batch deleted successfully", "batch_id": batch_id}