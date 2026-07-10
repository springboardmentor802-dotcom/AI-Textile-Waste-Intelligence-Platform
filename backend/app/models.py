import enum
from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from app.database import Base

# Strict roles definition for Textile Waste Platform
class UserRole(str, enum.Enum):
    RECYCLING_OPERATOR = "Recycling_Operator"
    SUSTAINABILITY_MANAGER = "Sustainability_Manager"
    MANUFACTURER = "Manufacturer"
    ADMIN = "Admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MANUFACTURER, nullable=False)

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base

# Section 2 ke specifications ke mutabik Enums
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

# Main Inventory Table Definition for SQL
class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Linked to Users table
    batch_id = Column(String, unique=True, index=True, nullable=False)
    fabric_type = Column(SQLEnum(FabricTypeEnum), nullable=False)
    source = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    color = Column(String, nullable=False)
    condition = Column(SQLEnum(ConditionEnum), nullable=False)
    collection_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.pending, nullable=False)

    # Relationship setup
    owner = relationship("User", back_populates="inventory_items")