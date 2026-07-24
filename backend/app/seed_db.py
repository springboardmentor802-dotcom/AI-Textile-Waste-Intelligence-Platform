import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# .env file load kar rahe hain (PostgreSQL credentials ke liye)
load_dotenv()

# PostgreSQL URL get karein (ya default fallback use karein)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/textile_intelligence_db")

def seed_sustainability_data():
    csv_path = os.path.join(os.path.dirname(__file__), "../datasets/sustainable_fashion_dataset.csv")
    
    # Check if file exists
    if not os.path.exists(csv_path):
        # Alternative check in case of .csv.csv
        csv_path = os.path.join(os.path.dirname(__file__), "../datasets/sustainable_fashion_dataset.csv.csv")

    if not os.path.exists(csv_path):
        print(f"❌ Error: CSV file not found at {csv_path}")
        return

    print("⏳ Reading 5,000 records from CSV...")
    df = pd.read_csv(csv_path)

    # Column cleaning
    df['Certifications'] = df['Certifications'].fillna('None')
    df.columns = [col.lower() for col in df.columns]

    print("🔌 Connecting to PostgreSQL Database...")
    engine = create_engine(DATABASE_URL)

    # Table mein insert karein
    df.to_sql('sustainability_dataset', con=engine, if_exists='replace', index=False)
    print("✅ SUCCESS! 5,000 Records successfully seeded into PostgreSQL table 'sustainability_dataset'.")

if __name__ == "__main__":
    seed_sustainability_data()