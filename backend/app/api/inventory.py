from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.inventory_schema import (
    InventoryCreate,
    InventoryResponse,
)
from app.services.inventory_service import (
    add_inventory,
    get_all_inventory,
    delete_inventory,
    update_inventory
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post(
    "/add",
    response_model=InventoryResponse
)
@router.get(
    "/all",
    response_model=list[InventoryResponse]
)
def get_inventory(
    db: Session = Depends(get_db),
):
    return get_all_inventory(db)

@router.delete("/delete/{inventory_id}")
def delete_inventory_api(
    inventory_id: int,
    db: Session = Depends(get_db),
):
    result = delete_inventory(db, inventory_id)

    if not result:
        return {"message": "Inventory not found"}

    return {"message": "Deleted Successfully"}

@router.put(
    "/update/{inventory_id}",
    response_model=InventoryResponse
)
def update_inventory_api(
    inventory_id: int,
    data: InventoryCreate,
    db: Session = Depends(get_db),
):
    return update_inventory(db, inventory_id, data)

def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
):
    return add_inventory(db, data)