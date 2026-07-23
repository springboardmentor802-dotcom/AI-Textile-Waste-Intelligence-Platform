from fastapi import APIRouter, Depends, HTTPException

from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
)

from app.services.inventory_service import (
    create_inventory,
    get_all_inventory,
    get_inventory_by_id,
    update_inventory,
    delete_inventory,
)

from app.middleware.role_checker import require_role

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.post("/")
async def create_inventory_route(
    inventory: InventoryCreate,
    current_user=Depends(require_role("administrator")),
):
    return await create_inventory(inventory.model_dump())


@router.get("/")
async def get_inventory_route(
    current_user=Depends(require_role("administrator")),
):
    return await get_all_inventory()


@router.get("/{inventory_id}")
async def get_inventory_by_id_route(
    inventory_id: str,
    current_user=Depends(require_role("administrator")),
):
    item = await get_inventory_by_id(inventory_id)

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found",
        )

    return item


@router.put("/{inventory_id}")
async def update_inventory_route(
    inventory_id: str,
    inventory: InventoryUpdate,
    current_user=Depends(require_role("administrator")),
):
    item = await update_inventory(
        inventory_id,
        inventory.model_dump(exclude_unset=True),
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found",
        )

    return item


@router.delete("/{inventory_id}")
async def delete_inventory_route(
    inventory_id: str,
    current_user=Depends(require_role("administrator")),
):
    deleted = await delete_inventory(inventory_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Inventory not found",
        )

    return {
        "message": "Inventory deleted successfully"
    }