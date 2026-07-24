import os
import pandas as pd

def run_exploratory_data_analysis():
    print("\n🚀 --- STARTING EXPLORATORY DATA ANALYSIS (EDA) --- 🚀")
    
    # Absolute path setting taaki runtime errors na aayein
    current_dir = os.path.dirname(__file__)
    csv_path = os.path.join(current_dir, "mock_sustainability_dataset.csv")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: Dataset file not found at path: {csv_path}")
        return
        
    # Data reading using Pandas
    df = pd.read_csv(csv_path)
    
    # 1. Structural Auditing
    print(f"\n📊 Dataset Matrix Dimensions: {df.shape[0]} Rows, {df.shape[1]} Columns")
    print(f"🔍 Discovered Columns: {list(df.columns)}")
    
    # 2. Data Integrity/Missing Fields Check
    print("\n🧼 Missing/Null Field Audit:")
    print(df.isnull().sum())
    
    # 3. Target Feature Selection for the Scoring Matrix
    print("\n💡 Feature Selection Matrix for Milestone 2 Optimization:")
    selected_features = ["Material_Type", "Material_Condition", "Reuse_Potential", "Environmental_Benefit", "Processing_Feasibility"]
    for i, feature in enumerate(selected_features, 1):
        print(f"   {i}. Field Parameter Isolated: {feature}")
        
    # 4. Statistical Distribution of Weights
    print("\n📈 Statistical Distribution of Weights (Waste_Weight_KG):")
    print(df["Waste_Weight_KG"].describe())
    
    # 5. Core Material Volume Check
    print("\n🧵 Categorical Volume Breakdown (Material_Type):")
    print(df["Material_Type"].value_counts())
    
    print("\n✅ EDA Pipeline Execution Completed Successfully!")

if __name__ == "__main__":
    run_exploratory_data_analysis()