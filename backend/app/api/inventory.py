from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import (
    get_db,
    get_current_user,
    get_current_admin
)

from app.models.user import User
from app.models.manufacturer import Manufacturer
from app.models.inventory import Inventory

from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
    InventoryListResponse
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)




@router.post(
    "",
    response_model=InventoryResponse
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    manufacturer = db.query(
        Manufacturer
    ).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    new_inventory = Inventory(
        manufacturer_id=manufacturer.id,
        textile_name=inventory.textile_name,
        textile_type=inventory.textile_type,
        material=inventory.material,
        color=inventory.color,
        quantity=inventory.quantity,
        unit=inventory.unit,
        waste_type=inventory.waste_type,
        quality=inventory.quality,
        location=inventory.location,
        description=inventory.description
    )

    db.add(new_inventory)

    db.commit()

    db.refresh(new_inventory)

    return new_inventory






@router.get(
    "/my",
    response_model=InventoryListResponse
)
def get_my_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    manufacturer = db.query(
        Manufacturer
    ).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    inventory_items = db.query(
        Inventory
    ).filter(
        Inventory.manufacturer_id == manufacturer.id
    ).all()

    return {
        "inventory": inventory_items
    }




@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def get_inventory_by_id(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    inventory = db.query(
        Inventory
    ).filter(
        Inventory.id == inventory_id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found."
        )

    return inventory



@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    manufacturer = db.query(
        Manufacturer
    ).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    inventory = db.query(
        Inventory
    ).filter(
        Inventory.id == inventory_id,
        Inventory.manufacturer_id == manufacturer.id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found."
        )

    inventory.textile_name = inventory_data.textile_name
    inventory.textile_type = inventory_data.textile_type
    inventory.material = inventory_data.material
    inventory.color = inventory_data.color
    inventory.quantity = inventory_data.quantity
    inventory.unit = inventory_data.unit
    inventory.waste_type = inventory_data.waste_type
    inventory.quality = inventory_data.quality
    inventory.location = inventory_data.location
    inventory.description = inventory_data.description

    db.commit()
    db.refresh(inventory)

    return inventory






@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    manufacturer = db.query(
        Manufacturer
    ).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    inventory = db.query(
        Inventory
    ).filter(
        Inventory.id == inventory_id,
        Inventory.manufacturer_id == manufacturer.id
    ).first()

    if inventory is None:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found."
        )

    db.delete(inventory)
    db.commit()

    return {
        "message": "Inventory deleted successfully."
    }