from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class TextileWaste(Base):
    """
    Stores uploaded textile waste items.

    Each record represents one uploaded textile image that will
    undergo AI-powered material recognition and waste classification.
    """

    __tablename__ = "textile_waste"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    inventory_id = Column(
        Integer,
        ForeignKey("inventory.id"),
        nullable=False
    )

    image_path = Column(
        String(500),
        nullable=False
    )

    textile_name = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    analysis_status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # -----------------------------
    # Relationships
    # -----------------------------

    inventory = relationship(
        "Inventory",
        back_populates="textile_waste_items"
    )

    user = relationship(
        "User",
        back_populates="uploaded_textile_waste"
    )

    material_classification = relationship(
    "MaterialClassification",
    back_populates="textile_waste",
    uselist=False,
    cascade="all, delete-orphan"
)

    waste_classification = relationship(
    "WasteClassification",
    back_populates="textile_waste",
    uselist=False,
    cascade="all, delete-orphan"
)
    
    analysis_report = relationship(
    "AnalysisReport",
    back_populates="textile_waste",
    uselist=False,
    cascade="all, delete-orphan",
)

    