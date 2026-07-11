from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.textile_inventory import TextileInventory

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.get("/")
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(TextileInventory).all()
    return items