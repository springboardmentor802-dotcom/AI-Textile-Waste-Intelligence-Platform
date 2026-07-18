from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.textile_inventory import TextileInventory

from app.utils.auth_dependency import get_current_user
from app.utils.role_dependency import require_role


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


# ============================
# GET ALL INVENTORY
# Allowed: All Roles
# ============================

@router.get("/")
def get_inventory(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    items = db.query(TextileInventory).all()

    return items



# ============================
# ADD INVENTORY
# Allowed: Admin, Industry
# ============================

@router.post("/")
def add_inventory(
    item: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_role(["Admin", "Industry"])
    )
):

    new_item = TextileInventory(

        material_type=item["material"],

        fabric_type=item["type"],

        quantity=item["weight"],

        condition_status=item["status"],

        uploaded_by=current_user.get("user_id", 1)

    )


    db.add(new_item)

    db.commit()

    db.refresh(new_item)


    return new_item




# ============================
# DELETE INVENTORY
# Allowed: Admin only
# ============================

@router.delete("/{item_id}")
def delete_inventory(

    item_id: int,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        require_role(["Admin"])
    )

):

    item = db.query(TextileInventory).filter(
        TextileInventory.textile_id == item_id
    ).first()


    if not item:

        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )


    db.delete(item)

    db.commit()


    return {
        "message": "Inventory deleted successfully"
    }




# ============================
# UPDATE INVENTORY
# Allowed: Admin, Industry
# ============================

@router.put("/{item_id}")
def update_inventory(

    item_id: int,

    item: dict,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        require_role(["Admin", "Industry"])
    )

):


    inventory = db.query(TextileInventory).filter(
        TextileInventory.textile_id == item_id
    ).first()



    if not inventory:

        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )



    inventory.material_type = item["material"]

    inventory.fabric_type = item["type"]

    inventory.quantity = item["weight"]

    inventory.condition_status = item["status"]



    db.commit()

    db.refresh(inventory)


    return inventory