import pandas as pd

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.sustainability_dataset import SustainabilityDataset


CSV_FILE = "dataset/sustainable_fashion_dataset.csv"


def clean_string(value):
    if pd.isna(value):
        return None
    return str(value).strip()


def clean_float(value):
    if pd.isna(value):
        return None
    return float(value)


def clean_int(value):
    if pd.isna(value):
        return None
    return int(value)


def import_dataset():

    db: Session = SessionLocal()

    df = pd.read_csv(CSV_FILE)

    inserted = 0
    skipped = 0
    failed = 0

    for index, row in df.iterrows():

        try:

            existing = (
                db.query(SustainabilityDataset)
                .filter(
                    SustainabilityDataset.brand_id ==
                    clean_string(row["Brand_ID"])
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            item = SustainabilityDataset(

                brand_id=clean_string(row["Brand_ID"]),

                brand_name=clean_string(row["Brand_Name"]),

                country=clean_string(row["Country"]),

                year=clean_int(row["Year"]),

                sustainability_rating=clean_string(
                    row["Sustainability_Rating"]
                ),

                material_type=clean_string(
                    row["Material_Type"]
                ),

                eco_friendly_manufacturing=clean_string(
                    row["Eco_Friendly_Manufacturing"]
                ),

                carbon_footprint_mt=clean_float(
                    row["Carbon_Footprint_MT"]
                ),

                water_usage_liters=clean_float(
                    row["Water_Usage_Liters"]
                ),

                waste_production_kg=clean_float(
                    row["Waste_Production_KG"]
                ),

                recycling_programs=clean_string(
                    row["Recycling_Programs"]
                ),

                product_lines=clean_int(
                    row["Product_Lines"]
                ),

                average_price_usd=clean_float(
                    row["Average_Price_USD"]
                ),

                market_trend=clean_string(
                    row["Market_Trend"]
                ),

                certifications=clean_string(
                    row["Certifications"]
                )

            )

            db.add(item)

            inserted += 1

            # Commit every 500 rows
            if inserted % 500 == 0:
                db.commit()
                print(f"{inserted} records inserted...")

        except Exception as e:

            db.rollback()

            failed += 1

            print(
                f"Error on row {index + 1} "
                f"(Brand: {row['Brand_ID']})"
            )

            print(e)

    db.commit()

    db.close()

    print("\n========== IMPORT COMPLETE ==========")
    print(f"Inserted : {inserted}")
    print(f"Skipped  : {skipped}")
    print(f"Failed   : {failed}")


if __name__ == "__main__":
    import_dataset()