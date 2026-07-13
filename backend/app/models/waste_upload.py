from sqlalchemy import Column, Integer, String, Float, DateTime
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

    uploaded_by = Column(
        Integer
    )

    upload_date = Column(
        DateTime,
        default=datetime.utcnow
    )