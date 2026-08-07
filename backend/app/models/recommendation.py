from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base


class Recommendation(Base):
    """
    Stores AI-generated or rule-based recommendations
    for a classified textile waste item.
    """

    __tablename__ = "recommendations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    waste_classification_id = Column(
        Integer,
        ForeignKey("waste_classification.id", ondelete="CASCADE"),
        nullable=False
    )

    recommendation_title = Column(
        String(150),
        nullable=False
    )

    recommendation_description = Column(
        Text,
        nullable=False
    )

    recommended_action = Column(
        String(150),
        nullable=False
    )
    # Examples:
    # Recycle
    # Reuse
    # Donate
    # Upcycle
    # Dispose

    recommended_recycler = Column(
        String(255),
        nullable=True
    )
    # Placeholder for now.
    # Later this will become a foreign key to the recycler table.

    recycling_priority = Column(
        String(50),
        nullable=False,
        default="Medium"
    )
    # Low
    # Medium
    # High
    # Critical

    estimated_processing_cost = Column(
        Float,
        nullable=True
    )

    estimated_carbon_reduction = Column(
        Float,
        nullable=True
    )
    # Estimated CO₂ reduction in kg

    estimated_recovery_percentage = Column(
        Float,
        nullable=True
    )
    # Example: 92.5%

    ai_generated = Column(
        Boolean,
        nullable=False,
        default=False
    )

    recommendation_source = Column(
        String(100),
        nullable=False,
        default="Rule Engine"
    )
    # Examples:
    # Rule Engine
    # TensorFlow Model
    # PyTorch Model
    # LLM

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

    waste_classification = relationship(
        "WasteClassification",
        back_populates="recommendations"
    )

    