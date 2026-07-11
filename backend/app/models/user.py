from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    phone_number = Column(String(15), unique=True, nullable=False)

    company_name = Column(String(150), nullable=False)

    role = Column(String(50), nullable=False)

    password_hash = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )