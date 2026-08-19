from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
)

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    # --------------------------------
    # PRIMARY KEY
    # --------------------------------

    notification_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------
    # NOTIFICATION OWNER
    # --------------------------------

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    # --------------------------------
    # NOTIFICATION INFORMATION
    # --------------------------------

    notification_type = Column(
        String(50),
        nullable=False
    )

    title = Column(
        String(150),
        nullable=False
    )

    message = Column(
        String(500),
        nullable=False
    )

    severity = Column(
        String(20),
        default="info",
        nullable=False
    )

    # --------------------------------
    # RELATED PLATFORM RECORD
    # --------------------------------

    related_entity_type = Column(
        String(50),
        nullable=True
    )

    related_entity_id = Column(
        Integer,
        nullable=True
    )

    # --------------------------------
    # READ STATUS
    # --------------------------------

    is_read = Column(
        Boolean,
        default=False,
        nullable=False
    )

    read_at = Column(
        DateTime,
        nullable=True
    )

    # --------------------------------
    # TIMESTAMP
    # --------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )