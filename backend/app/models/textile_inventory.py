from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func

from app.database import Base


class TextileInventory(Base):
    __tablename__ = "textile_inventory"

    textile_id = Column(Integer, primary_key=True, index=True)
    material_type = Column(String(100))
    fabric_type = Column(String(100))
    quantity = Column(Float)
    color = Column(String(50))
    condition_status = Column(String(50))
    uploaded_by = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(TIMESTAMP, server_default=func.now())