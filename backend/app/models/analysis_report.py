from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class AnalysisReport(Base):
    """
    Stores generated analysis reports.
    """

    __tablename__ = "analysis_reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    textile_waste_id = Column(
        Integer,
        ForeignKey(
            "textile_waste.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
    )

    report_name = Column(
        String(255),
        nullable=False,
    )

    report_path = Column(
        String(500),
        nullable=False,
    )

    report_type = Column(
        String(50),
        default="PDF",
    )

    generated_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    generated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    textile_waste = relationship(
        "TextileWaste",
        back_populates="analysis_report",
    )

    user = relationship(
        "User",
    )