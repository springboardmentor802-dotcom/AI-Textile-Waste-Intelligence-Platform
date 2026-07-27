from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class MaterialClassification(Base):
    """
    Stores AI material recognition results for an uploaded textile image.
    """

    __tablename__ = "material_classification"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    textile_waste_id = Column(
        Integer,
        ForeignKey("textile_waste.id", ondelete="CASCADE"),
        nullable=False
    )

    predicted_material = Column(
        String(100),
        nullable=False
    )

    confidence_score = Column(
        Float,
        nullable=False
    )

    material_type = Column(
        String(100),
        nullable=False
    )
    # Examples:
    # Natural Fibre
    # Synthetic Fibre
    # Semi-Synthetic Fibre
    # Blended Fibre

    fibre_composition = Column(
        String(255),
        nullable=True
    )
    # Examples:
    # 100% Cotton
    # 80% Cotton, 20% Polyester

    model_name = Column(
        String(100),
        nullable=False
    )

    model_version = Column(
        String(50),
        nullable=False
    )

    processing_time = Column(
        Float,
        nullable=True
    )
    # Time taken for prediction (seconds)

    classified_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
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

    # ----------------------------------
    # Relationships
    # ----------------------------------

    textile_waste = relationship(
        "TextileWaste",
        back_populates="material_classifications"
    )