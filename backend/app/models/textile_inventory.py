from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database import Base



class TextileInventory(Base):

    __tablename__ = "textile_inventory"



    textile_id = Column(
        Integer,
        primary_key=True,
        index=True
    )



    # Batch Reference

    batch_id = Column(
        String(50),
        unique=True,
        nullable=False
    )



    # Material Profile

    material_profile = Column(
        String(100)
    )



    # Waste Origin

    waste_origin = Column(
        String(100)
    )



    # Condition Assessment

    condition_grade = Column(
        String(20)
    )



    # AI / Business Decision

    recovery_potential = Column(
        String(50)
    )



    # Workflow Tracking

    processing_status = Column(
        String(50)
    )



    # Quantity Information

    waste_weight = Column(
        Float
    )



    # Record Creation

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )