from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class FabricType(str, enum.Enum):
    cotton = "Cotton"
    polyester = "Polyester"
    wool = "Wool"
    silk = "Silk"
    linen = "Linen"
    denim = "Denim"
    nylon = "Nylon"
    rayon = "Rayon"
    acrylic = "Acrylic"
    mixed = "Mixed Fabrics"


class Condition(str, enum.Enum):
    good = "Good"
    fair = "Fair"
    poor = "Poor"


class TextileBatch(Base):
    __tablename__ = "textile_batches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(String(50), unique=True, index=True, nullable=False)
    fabric_type = Column(SQLEnum(FabricType), nullable=False)
    source = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    color = Column(String(100), nullable=False)
    condition = Column(SQLEnum(Condition), nullable=False)
    collection_date = Column(Date, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # ML fields — placeholder for future milestone integration
    # These will be populated by ML models in Milestone 2+
    ml_fabric_classification = Column(String(100), nullable=True)
    ml_recyclability_score = Column(Float, nullable=True)
    ml_circularity_score = Column(Float, nullable=True)
    ml_waste_category = Column(String(100), nullable=True)
    ml_recommendation = Column(String(500), nullable=True)
    ml_analyzed = Column(String(10), default="pending", nullable=True)

    def __repr__(self):
        return f"<TextileBatch batch_id={self.batch_id} fabric={self.fabric_type}>"