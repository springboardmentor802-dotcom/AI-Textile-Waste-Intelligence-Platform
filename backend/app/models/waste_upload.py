from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database import Base


class WasteUpload(Base):

    __tablename__ = "waste_uploads"

    upload_id = Column(
        Integer,
        primary_key=True,
        index=True
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
        String(100)
    )

    biodegradable = Column(
        Boolean
    )

    reusable = Column(
        Boolean
    )

    # -----------------------------
    # NEW DECISION ENGINE FIELDS
    # -----------------------------

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
        String(50)
    )

    final_decision = Column(
        String(100)
    )

    # -----------------------------

    uploaded_by = Column(
        Integer
    )

    upload_date = Column(
        DateTime,
        default=datetime.utcnow
    )