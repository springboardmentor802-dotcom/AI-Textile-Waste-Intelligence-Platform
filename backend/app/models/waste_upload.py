from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func

from app.database import Base


class WasteUpload(Base):
    __tablename__ = "waste_uploads"

    upload_id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String(255))
    predicted_class = Column(String(100))
    confidence = Column(Float)
    uploaded_by = Column(Integer, ForeignKey("users.user_id"))
    upload_date = Column(TIMESTAMP, server_default=func.now())