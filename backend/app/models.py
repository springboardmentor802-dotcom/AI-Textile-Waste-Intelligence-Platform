import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    RECYCLING_OPERATOR = "RECYCLING_OPERATOR"
    SUSTAINABILITY_MANAGER = "SUSTAINABILITY_MANAGER"
    MANUFACTURER = "MANUFACTURER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MANUFACTURER, nullable=False)

    inventory_items = relationship("Inventory", back_populates="owner", cascade="all, delete-orphan")
    scan_logs = relationship("ScanLog", back_populates="user", cascade="all, delete-orphan")


class FabricTypeEnum(str, enum.Enum):
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

class ConditionEnum(str, enum.Enum):
    excellent = "Excellent"
    good = "Good"
    fair = "Fair"
    poor = "Poor"
    contaminated = "Contaminated"

class StatusEnum(str, enum.Enum):
    pending = "Pending"
    in_transit = "In-Transit"
    processed = "Processed"
    diverted = "Diverted"

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    batch_id = Column(String, unique=True, index=True, nullable=False)
    fabric_type = Column(SQLEnum(FabricTypeEnum), nullable=False)
    source = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    color = Column(String, nullable=False)
    condition = Column(SQLEnum(ConditionEnum), nullable=False)
    collection_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.pending, nullable=False)

    owner = relationship("User", back_populates="inventory_items")


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    scan_code = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)
    fabric_type = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=False)
    co2_saved = Column(Float, nullable=False)
    water_saved = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="scan_logs")


class CircularityDataset(Base):
    __tablename__ = "circularity_dataset"

    id = Column(Integer, primary_key=True, index=True)
    material_type = Column(String, nullable=False)
    material_condition = Column(String, nullable=False)
    waste_weight_kg = Column(Float, nullable=False)
    recyclability_score = Column(Float, nullable=False)
    image_path = Column(String, nullable=True)