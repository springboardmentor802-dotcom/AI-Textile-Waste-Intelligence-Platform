import os
import pandas as pd
import numpy as np

def run_exploratory_data_analysis():
    print("\n🚀 --- STARTING EXPLORATORY DATA ANALYSIS (EDA) --- 🚀")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(current_dir))
    csv_path = os.path.join(base_dir, "datasets", "sustainable_fashion_dataset.csv")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: Dataset file not found at path: {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    df.columns = [c.strip() for c in df.columns]
    
    print(f"\n📊 Dataset Matrix: {df.shape[0]} Rows, {df.shape[1]} Columns")
    print(f"🔍 Discovered Columns: {list(df.columns)}")
    
    print("\n🧼 Missing Field Audit:")
    print(df.isnull().sum())
    
    if "Material_Type" in df.columns:
        print("\n🧵 Categorical Volume Breakdown (Material_Type):")
        print(df["Material_Type"].value_counts())
        
    print("\n✅ Real EDA Pipeline Execution Completed Successfully!")

if __name__ == "__main__":
    run_exploratory_data_analysis()