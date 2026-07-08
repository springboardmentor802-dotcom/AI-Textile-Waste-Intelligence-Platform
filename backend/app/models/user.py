from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


# Define the allowed roles as an enum
# This prevents any invalid role from being stored
class UserRole(str, enum.Enum):
    recycling_operator = "recycling_operator"
    sustainability_manager = "sustainability_manager"
    textile_manufacturer = "textile_manufacturer"
    admin = "admin"


class User(Base):
    # This is the actual table name in PostgreSQL
    __tablename__ = "users"

    # Columns
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"