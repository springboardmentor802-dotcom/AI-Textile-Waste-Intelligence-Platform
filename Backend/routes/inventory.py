from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory
from schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from routes.auth import get_current_user
from models import User

router = APIRouter()


@router.post("/inventory", response_model=InventoryResponse)
def create_inventory(
    request: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Inventory).filter(Inventory.batch_id == request.batch_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Batch ID already exists")

    new_item = Inventory(
        user_id=current_user.id,
        batch_id=request.batch_id,
        fabric_type=request.fabric_type,
        source=request.source,
        quantity=request.quantity,
        color=request.color,
        condition=request.condition,
        collection_date=request.collection_date,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.get("/inventory", response_model=list[InventoryResponse])
def list_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Inventory).all()


@router.put("/inventory/{item_id}", response_model=InventoryResponse)
def update_inventory(
    item_id: int,
    request: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/inventory/{item_id}")
def delete_inventory(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    db.delete(item)
    db.commit()
    return {"message": f"Batch {item.batch_id} deleted successfully"}