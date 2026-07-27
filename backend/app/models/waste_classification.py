from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class WasteClassification(Base):
    """
    Stores waste categorization and recyclability assessment
    results for a textile waste item.
    """

    __tablename__ = "waste_classification"

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

    waste_category = Column(
        String(100),
        nullable=False
    )
    # Examples:
    # Fabric Scrap
    # Post Consumer Waste
    # Post Industrial Waste
    # Mixed Textile Waste
    # Garment Waste

    waste_condition = Column(
        String(100),
        nullable=True
    )
    # Examples:
    # New
    # Used
    # Damaged
    # Contaminated

    recyclability_score = Column(
        Float,
        nullable=False
    )
    # Example:
    # 0 - 100

    recyclable = Column(
        Boolean,
        default=True,
        nullable=False
    )

    recommended_recycling_method = Column(
        String(150),
        nullable=True
    )
    # Examples:
    # Mechanical Recycling
    # Chemical Recycling
    # Upcycling
    # Downcycling
    # Energy Recovery

    disposal_method = Column(
        String(150),
        nullable=True
    )
    # Used if the waste cannot be recycled.

    carbon_saving_estimate = Column(
        Float,
        nullable=True
    )
    # Estimated CO₂ savings (kg)

    sustainability_score = Column(
        Float,
        nullable=True
    )
    # Example:
    # 0 - 100

    remarks = Column(
        Text,
        nullable=True
    )

    model_name = Column(
        String(100),
        nullable=False
    )

    model_version = Column(
        String(50),
        nullable=False
    )

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

    # -----------------------------------
    # Relationships
    # -----------------------------------

    textile_waste = relationship(
        "TextileWaste",
        back_populates="waste_classifications"
    )

    recommendations = relationship(
        "Recommendation",
        back_populates="waste_classification",
        cascade="all, delete-orphan"
    )