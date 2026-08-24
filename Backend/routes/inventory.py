from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Inventory, User
from schemas import InventoryCreate, InventoryUpdate, InventoryResponse
from routes.auth import get_current_user
from services.notification_service import (
    INVENTORY_WARNING_THRESHOLD_KG,
    create_notification,
)

router = APIRouter()


def _inventory_query_for_user(db: Session, current_user: User):
    """Scope inventory access to the logged-in user, except Administrator."""
    query = db.query(Inventory)
    if current_user.role != "administrator":
        query = query.filter(Inventory.user_id == current_user.id)
    return query


def _generate_batch_id(db: Session) -> str:
    """Generate the next globally unique Batch ID in the B-1, B-2... format."""
    existing_ids = db.query(Inventory.batch_id).all()
    max_number = 0

    for (batch_id,) in existing_ids:
        if not batch_id:
            continue

        value = str(batch_id).strip()

        # New format: B-123
        if value.upper().startswith("B-"):
            suffix = value[2:]
            if suffix.isdigit():
                max_number = max(max_number, int(suffix))
                continue

        # Preserve compatibility with old numeric IDs such as "1" or "999".
        if value.isdigit():
            max_number = max(max_number, int(value))

    next_number = max_number + 1

    while db.query(Inventory).filter(
        Inventory.batch_id == f"B-{next_number}"
    ).first():
        next_number += 1

    return f"B-{next_number}"


@router.post("/inventory", response_model=InventoryResponse)
def create_inventory(
    request: InventoryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    batch_id = _generate_batch_id(db)

    new_item = Inventory(
        user_id=current_user.id,
        batch_id=batch_id,
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

    # --- Alert & Notification System ---
    # Only create notifications AFTER the inventory row is successfully
    # committed, so a failed create never generates a false alert.

    # A. Waste Collection Recorded (always fires for a new batch)
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Waste Collection Recorded",
        message=(
            f"Waste batch {new_item.batch_id} containing "
            f"{new_item.fabric_type} has been added to inventory."
        ),
        notification_type="waste_collection",
        severity="info",
        related_entity_type="inventory",
        related_entity_id=new_item.id,
        background_tasks=background_tasks,
    )

    # D. Inventory Warning (only when this batch's own quantity meets
    # the configured threshold - see notification_service.py for why
    # the check is per-batch rather than a running total). This only
    # runs once, at creation time, so it cannot duplicate on refresh.
    if new_item.quantity >= INVENTORY_WARNING_THRESHOLD_KG:
        create_notification(
            db=db,
            user_id=current_user.id,
            title="Inventory Warning",
            message=(
                f"Inventory quantity for batch {new_item.batch_id} "
                f"({new_item.fabric_type}) has reached the configured "
                f"warning level of {INVENTORY_WARNING_THRESHOLD_KG:g} kg."
            ),
            notification_type="inventory_warning",
            severity="warning",
            related_entity_type="inventory",
            related_entity_id=new_item.id,
            background_tasks=background_tasks,
        )

    return new_item


@router.get("/inventory", response_model=list[InventoryResponse])
def list_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _inventory_query_for_user(db, current_user).order_by(Inventory.id.desc()).all()


@router.put("/inventory/{item_id}", response_model=InventoryResponse)
def update_inventory(
    item_id: int,
    request: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        _inventory_query_for_user(db, current_user)
        .filter(Inventory.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found or you do not have access to it",
        )

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
    current_user: User = Depends(get_current_user),
):
    item = (
        _inventory_query_for_user(db, current_user)
        .filter(Inventory.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found or you do not have access to it",
        )

    batch_id = item.batch_id
    db.delete(item)
    db.commit()

    return {"message": f"Batch {batch_id} deleted successfully"}