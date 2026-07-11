from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.sql import func

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True, index=True)
    waste_type = Column(String(100))
    recommendation = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())