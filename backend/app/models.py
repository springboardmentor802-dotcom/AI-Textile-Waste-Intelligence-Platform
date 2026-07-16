import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    role = Column(String, nullable=False)  # Administrator, Recycling Facility Operator, Sustainability Manager, Textile Manufacturer
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    batches = relationship("WasteBatch", back_populates="creator")

class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True, nullable=False)  # Human-readable ID like TXT-2026-0001
    fabric_type = Column(String, nullable=False)  # Cotton, Polyester, Wool, Silk, Linen, Denim, Nylon, Rayon, Acrylic, Mixed Fabrics
    source = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # kg, lbs, tons
    color = Column(String, nullable=False)
    condition = Column(String, nullable=False)  # Clean, Damaged, Contaminated, Wet
    collection_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # Pending, Sorting, Processing, Recycled, Disposed
    notes = Column(Text, nullable=True)
    
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="batches")
    image_analysis = relationship("ImageAnalysis", uselist=False, back_populates="batch", cascade="all, delete-orphan")

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # TIPS, DeepFashion, etc.
    description = Column(Text, nullable=True)
    source_url = Column(String, nullable=True)
    format = Column(String, nullable=False)  # e.g., Images, CSV, JSON
    num_records = Column(Integer, default=0)
    status = Column(String, default="Placeholder")  # Placeholder, Seeded, Ingested
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    records = relationship("SampleDatasetRecord", back_populates="dataset", cascade="all, delete-orphan")

class SampleDatasetRecord(Base):
    __tablename__ = "sample_dataset_records"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("dataset_metadata.id"), nullable=False)
    label = Column(String, nullable=False)  # e.g., Cotton 100%, Denim, Polyester Blend
    image_url_placeholder = Column(String, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON formatted metadata about the sample (e.g. recyclability score, fiber blend details)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    dataset = relationship("DatasetMetadata", back_populates="records")

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("waste_batches.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String, nullable=False)  # Local relative path inside static uploads directory
    
    # Visual Features extracted
    fabric_texture = Column(String, nullable=True)  # Knitted, Woven, Non-woven
    fabric_pattern = Column(String, nullable=True)  # Solid, Striped, Printed, Textured
    fabric_color = Column(String, nullable=True)    # Primary detected color (hex or name)
    damage_detection = Column(String, nullable=True) # Description or None
    contamination_detection = Column(String, nullable=True) # Description or None

    # Material Classification
    predicted_fabric_type = Column(String, nullable=True) # Primary fabric type
    fiber_composition = Column(String, nullable=True)     # e.g., "70% Cotton, 30% Polyester"
    blend_identification = Column(String, nullable=True) # Single, Blend
    material_quality = Column(String, nullable=True)     # Premium, Good, Fair, Poor

    # Waste Categorization
    predicted_waste_category = Column(String, nullable=True) # Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous Textile Waste

    # Scoring & Circularity Assessment
    recyclability_score = Column(Float, default=0.0)
    reuse_score = Column(Float, default=0.0)
    sustainability_score = Column(Float, default=0.0)
    material_recovery_score = Column(Float, default=0.0)
    circularity_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship back to WasteBatch
    batch = relationship("WasteBatch", back_populates="image_analysis")

