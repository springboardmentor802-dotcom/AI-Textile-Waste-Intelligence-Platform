from sqlalchemy import (
    Column,
    Integer,
    String,
    Float
)

from app.database.base import Base


class SustainabilityDataset(Base):

    __tablename__ = "sustainability_dataset"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    brand_id = Column(
        String(50),
        unique=True,
        nullable=False
    )

    brand_name = Column(
        String(150),
        nullable=False
    )

    country = Column(
        String(100)
    )

    year = Column(
        Integer
    )

    sustainability_rating = Column(
        String(20)
    )

    material_type = Column(
        String(100)
    )

    eco_friendly_manufacturing = Column(
        String(50)
    )

    carbon_footprint_mt = Column(
        Float
    )

    water_usage_liters = Column(
        Float
    )

    waste_production_kg = Column(
        Float
    )

    recycling_programs = Column(
        String(50)
    )

    product_lines = Column(
        Integer
    )

    average_price_usd = Column(
        Float
    )

    market_trend = Column(
        String(100)
    )

    certifications = Column(
        String(255)
    )