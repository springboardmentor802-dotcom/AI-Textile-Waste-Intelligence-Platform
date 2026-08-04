from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.textile_inventory import TextileInventory

from app.schemas.inventory import InventoryCreate

from app.utils.auth_dependency import get_current_user
from app.utils.role_dependency import require_role



router = APIRouter(

    prefix="/inventory",

    tags=["Inventory"]

)





# ============================
# GET ALL BATCHES
# ============================

@router.get("/")
def get_inventory(

    db: Session = Depends(get_db),

    current_user: dict = Depends(get_current_user)

):

    return db.query(TextileInventory).all()







# ============================
# ADD NEW BATCH
# ============================

@router.post("/")
def add_inventory(

    item: InventoryCreate,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        require_role(["Admin","Industry"])
    )

):


    new_batch = TextileInventory(


        batch_id=item.batch_id,


        material_profile=item.material_profile,


        waste_origin=item.waste_origin,


        condition_grade=item.condition_grade,


        recovery_potential=item.recovery_potential,


        processing_status=item.processing_status,


        waste_weight=item.waste_weight

    )



    db.add(new_batch)

    db.commit()

    db.refresh(new_batch)



    return new_batch







# ============================
# DELETE BATCH
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

            detail="Batch not found"

        )



    db.delete(item)

    db.commit()



    return {

        "message":
        "Batch deleted successfully"

    }









# ============================
# UPDATE BATCH
# ============================

@router.put("/{item_id}")
def update_inventory(

    item_id: int,

    item: InventoryCreate,

    db: Session = Depends(get_db),

    current_user: dict = Depends(
        require_role(["Admin","Industry"])
    )

):


    batch = db.query(TextileInventory).filter(

        TextileInventory.textile_id == item_id

    ).first()



    if not batch:

        raise HTTPException(

            status_code=404,

            detail="Batch not found"

        )



    batch.batch_id = item.batch_id


    batch.material_profile = item.material_profile


    batch.waste_origin = item.waste_origin


    batch.condition_grade = item.condition_grade


    batch.recovery_potential = item.recovery_potential


    batch.processing_status = item.processing_status


    batch.waste_weight = item.waste_weight



    db.commit()

    db.refresh(batch)



    return batch