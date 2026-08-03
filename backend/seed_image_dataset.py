import os
import sys
import random
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import sessionmaker, declarative_base

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# 1. Exact PostgreSQL Database Configuration using your credentials
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5432/textile_waste_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Table Schema Model Definition
class CircularityDataset(Base):
    __tablename__ = "circularity_dataset"

    id = Column(Integer, primary_key=True, index=True)
    material_type = Column(String, nullable=False)
    material_condition = Column(String, nullable=False)
    waste_weight_kg = Column(Float, nullable=False)
    recyclability_score = Column(Float, nullable=False)
    image_path = Column(String, nullable=True)

# Create table if it doesn't exist in PostgreSQL
Base.metadata.create_all(bind=engine)

# 3. Dataset Directory Path
DATASET_DIR = os.path.join(BASE_DIR, "datasets", "contaminated dataset", "Dataset")

# Mapping rules for defect folders
DEFECT_RULES = {
    "defect free": {"condition": "Excellent", "score": 95.0, "fabric": "Cotton"},
    "Broken stitch": {"condition": "Good", "score": 80.0, "fabric": "Denim"},
    "Needle mark": {"condition": "Good", "score": 82.0, "fabric": "Cotton Blend"},
    "Pinched fabric": {"condition": "Fair", "score": 75.0, "fabric": "Wool"},
    "horizontal": {"condition": "Fair", "score": 70.0, "fabric": "Polyester"},
    "lines": {"condition": "Fair", "score": 72.0, "fabric": "Polyester"},
    "hole": {"condition": "Poor", "score": 45.0, "fabric": "Cotton"},
    "stain": {"condition": "Contaminated", "score": 30.0, "fabric": "Mixed Synthetic"}
}

def seed_dataset_to_postgres():
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Error: Dataset path not found at: {DATASET_DIR}")
        return

    db = SessionLocal()
    inserted_count = 0

    print("🚀 Connecting to PostgreSQL and scanning image folders...")

    try:
        for folder_name in os.listdir(DATASET_DIR):
            folder_path = os.path.join(DATASET_DIR, folder_name)

            if os.path.isdir(folder_path):
                rule = DEFECT_RULES.get(folder_name, {"condition": "Fair", "score": 60.0, "fabric": "Cotton Blend"})

                for image_filename in os.listdir(folder_path):
                    if image_filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        image_relative_path = f"datasets/contaminated dataset/Dataset/{folder_name}/{image_filename}"

                        record = CircularityDataset(
                            material_type=rule["fabric"],
                            material_condition=f"{folder_name} ({rule['condition']})",
                            waste_weight_kg=round(random.uniform(5.0, 50.0), 1),
                            recyclability_score=rule["score"],
                            image_path=image_relative_path
                        )

                        db.add(record)
                        inserted_count += 1

                        if inserted_count % 500 == 0:
                            db.commit()
                            print(f"✅ Successfully inserted {inserted_count} records...")

        db.commit()
        print(f"\n🎉 SUCCESS! Total {inserted_count} image metadata entries imported into PostgreSQL database ('textile_waste_db').")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during database seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_dataset_to_postgres()