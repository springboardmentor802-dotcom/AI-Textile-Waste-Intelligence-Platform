from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Date,
    DateTime,
    Float,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    # Role-based access control
    role = Column(
        String,
        nullable=False,
        default="recycling_facility_operator",
    )

    inventory = relationship("Inventory", back_populates="owner")
    predictions = relationship("Prediction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


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


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    material = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    waste_category = Column(String, nullable=False)
    recyclability = Column(String, nullable=False)
    recommendation = Column(String, nullable=False)

    image_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Milestone 4: Dashboard / sustainability analytics
    # These are nullable because older prediction records
    # may not have sustainability data.
    circularity_score = Column(Float, nullable=True)
    environmental_impact = Column(JSON, nullable=True)

    user = relationship("User", back_populates="predictions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    # Notifications always belong to a single user. Platform
    # announcements are fanned out as one row per recipient (see
    # services/notification_service.py) rather than a null user_id,
    # so every read/mark-as-read/delete query can keep the same
    # simple "WHERE user_id = current_user.id" ownership check used
    # everywhere else in this project (Inventory, Prediction).
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    message = Column(String, nullable=False)

    # waste_collection | recycling_opportunity | sustainability_milestone
    # | inventory_warning | platform_announcement | ai_prediction
    notification_type = Column(String, nullable=False)

    # info | success | warning | critical
    severity = Column(String, nullable=False, default="info")

    is_read = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Optional link back to the record that triggered this notification
    # (e.g. related_entity_type="inventory", related_entity_id=<Inventory.id>).
    # Nullable because not every notification (e.g. platform_announcement)
    # is tied to a specific row.
    related_entity_type = Column(String, nullable=True)
    related_entity_id = Column(Integer, nullable=True)

    user = relationship("User", back_populates="notifications")