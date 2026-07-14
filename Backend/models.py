from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")

    inventory = relationship("Inventory", back_populates="owner")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    batch_id = Column(String, unique=True, index=True, nullable=False)
    fabric_type = Column(String, nullable=False)
    source = Column(String)
    quantity = Column(Float, nullable=False)
    color = Column(String)
    condition = Column(String)
    collection_date = Column(Date)

    owner = relationship("User", back_populates="inventory")