from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Inventory(Base):

    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    manufacturer_id = Column(
        Integer,
        ForeignKey("manufacturers.id"),
        nullable=False
    )

    textile_name = Column(
        String,
        nullable=False
    )

    textile_type = Column(
        String,
        nullable=False
    )

    material = Column(
        String,
        nullable=False
    )

    color = Column(
        String
    )

    quantity = Column(
        Float,
        nullable=False
    )

    unit = Column(
        String,
        nullable=False
    )

    waste_type = Column(
        String,
        nullable=False
    )

    quality = Column(
        String
    )

    location = Column(
        String
    )

    description = Column(
        Text
    )

    status = Column(
        String,
        default="Available"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    manufacturer = relationship(
        "Manufacturer",
        back_populates="inventory"
    )
    textile_waste_items = relationship(
    "TextileWaste",
    back_populates="inventory",
    cascade="all, delete-orphan"
)