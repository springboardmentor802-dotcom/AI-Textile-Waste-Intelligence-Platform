import pandas as pd

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.sustainability_dataset import SustainabilityDataset


CSV_FILE = "dataset/sustainable_fashion_dataset.csv"


def import_dataset():

    db: Session = SessionLocal()

    df = pd.read_csv(CSV_FILE)

    inserted = 0
    skipped = 0

    for _, row in df.iterrows():

        existing = db.query(
            SustainabilityDataset
        ).filter(
            SustainabilityDataset.brand_id == str(row["Brand_ID"])
        ).first()

        if existing:
            skipped += 1
            continue

        item = SustainabilityDataset(

            brand_id=str(row["Brand_ID"]),

            brand_name=row["Brand_Name"],

            country=row["Country"],

            year=int(row["Year"]),

            sustainability_rating=row["Sustainability_Rating"],

            material_type=row["Material_Type"],

            eco_friendly_manufacturing=row["Eco_Friendly_Manufacturing"],

            carbon_footprint_mt=float(row["Carbon_Footprint_MT"]),

            water_usage_liters=float(row["Water_Usage_Liters"]),

            waste_production_kg=float(row["Waste_Production_KG"]),

            recycling_programs=row["Recycling_Programs"],

            product_lines=int(row["Product_Lines"]),

            average_price_usd=float(row["Average_Price_USD"]),

            market_trend=row["Market_Trend"],

            certifications=row["Certifications"]

        )

        db.add(item)

        inserted += 1

    db.commit()

    db.close()

    print(f"Inserted : {inserted}")

    print(f"Skipped  : {skipped}")


if __name__ == "__main__":
    import_dataset()