from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class Inventory(Base):
    __tablename__ = "inventory"
    
    image_path = Column(String, nullable=True)

    prediction = Column(String, nullable=True)

    id = Column(Integer, primary_key=True, index=True)

    waste_type = Column(String, nullable=False)

    fabric_type = Column(String, nullable=False)

    quantity = Column(Float, nullable=False)

    unit = Column(String, default="Kg")

    location = Column(String, nullable=False)

    status = Column(String, default="Collected")

    created_at = Column(DateTime(timezone=True), server_default=func.now())