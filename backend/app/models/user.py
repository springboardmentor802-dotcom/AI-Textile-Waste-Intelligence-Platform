from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime

from datetime import datetime
from sqlalchemy.orm import relationship

from app.database.base import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)






manufacturer = relationship(
    "Manufacturer",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan"
)