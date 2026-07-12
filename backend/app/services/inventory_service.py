from sqlalchemy.orm import Session

from app.models.inventory import Inventory


def add_inventory(db: Session, data):

    waste = Inventory(
        waste_type=data.waste_type,
        fabric_type=data.fabric_type,
        quantity=data.quantity,
        unit=data.unit,
        location=data.location,
        status=data.status,
    )

    db.add(waste)
    db.commit()
    db.refresh(waste)

    return waste
def get_all_inventory(db: Session):
    return db.query(Inventory).all()
def delete_inventory(db: Session, inventory_id: int):

    waste = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not waste:
        return None

    db.delete(waste)
    db.commit()

    return waste
def update_inventory(db: Session, inventory_id: int, data):

    waste = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not waste:
        return None

    waste.waste_type = data.waste_type
    waste.fabric_type = data.fabric_type
    waste.quantity = data.quantity
    waste.unit = data.unit
    waste.location = data.location
    waste.status = data.status

    db.commit()
    db.refresh(waste)

    return waste