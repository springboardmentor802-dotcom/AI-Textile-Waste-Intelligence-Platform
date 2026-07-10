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