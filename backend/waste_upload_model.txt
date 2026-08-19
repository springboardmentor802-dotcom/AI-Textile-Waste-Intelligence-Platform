from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
)

from app.database import Base


class WasteUpload(Base):

    __tablename__ = "waste_uploads"

    upload_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    weight_kg = Column(
        Float,
        default=0
    )

    image_path = Column(
        String(255)
    )

    predicted_class = Column(
        String(100)
    )

    confidence = Column(
        Float
    )

    # --------------------------------
    # MATERIAL INTELLIGENCE
    # --------------------------------

    material = Column(
        String(100)
    )

    material_type = Column(
        String(100)
    )

    recycling_method = Column(
        String(150)
    )

    environmental_impact = Column(
        String(150)
    )

    biodegradable = Column(
        Boolean,
        default=False
    )

    reusable = Column(
        Boolean,
        default=False
    )

    # --------------------------------
    # CONDITION ANALYSIS
    # --------------------------------

    defect_status = Column(
        String(50),
        default="Not Assessed"
    )

    defect_severity = Column(
        String(50),
        default="Unknown"
    )

    contamination_status = Column(
        String(50),
        default="Not Assessed"
    )

    condition = Column(
        String(50),
        default="Unknown"
    )

    # --------------------------------
    # CIRCULAR DECISION ENGINE
    # --------------------------------

    final_decision = Column(
        String(150)
    )

    recovery_path = Column(
        String(150)
    )

    recovery_category = Column(
        String(100)
    )

    decision_rule = Column(
        String(150)
    )

    decision_priority = Column(
        Integer
    )

    material_known = Column(
        Boolean,
        default=True
    )

    # --------------------------------
    # SUSTAINABILITY ASSESSMENT
    # --------------------------------

    sustainability_score = Column(
        Float,
        nullable=True
    )

    reuse_score = Column(
        Float,
        nullable=True
    )

    recovery_score = Column(
        Float,
        nullable=True
    )

    circularity_level = Column(
        String(50)
    )

    assessment_status = Column(
        String(100)
    )

    requires_manual_review = Column(
        Boolean,
        default=False
    )

    # --------------------------------
    # OWNERSHIP AND TIMESTAMP
    # --------------------------------

    uploaded_by = Column(
        Integer
    )

    upload_date = Column(
        DateTime,
        default=datetime.utcnow
    )