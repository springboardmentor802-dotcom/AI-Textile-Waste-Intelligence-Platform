from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.base import Base


class Manufacturer(Base):

    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    company_name = Column(String, nullable=False)

    gst_number = Column(String, unique=True)

    industry_type = Column(String)

    address = Column(String)

    city = Column(String)

    state = Column(String)

    pincode = Column(String)

    contact_person = Column(String)

    phone = Column(String)

    website = Column(String)

    description = Column(String)

    is_verified = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )





user = relationship(
    "User",
    back_populates="manufacturer"
)

inventory = relationship(
    "Inventory",
    back_populates="manufacturer",
    cascade="all, delete-orphan"
)