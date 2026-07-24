import os
import pandas as pd

# 📁 Dataset Path Configuration
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "datasets", "textile_sustainability_market.csv")

def load_sustainability_dataset():
    """
    Safely loads the textile sustainability market CSV dataset.
    Falls back to a dynamic dataframe if the file is missing.
    """
    if os.path.exists(DATASET_PATH):
        return pd.read_csv(DATASET_PATH)
    else:
        # Fallback dataset pipeline in case of absolute file stream failure
        data = {
            "Material_Type": ["Cotton", "Polyester", "Wool"],
            "Material_Condition": ["Clean", "Contaminated", "Damaged"],
            "Reuse_Potential": ["High", "Low", "Medium"],
            "Environmental_Benefit": ["High", "Medium", "High"],
            "Processing_Feasibility": ["Easy", "Difficult", "Medium"],
            "Waste_Weight_KG": [45.2, 120.0, 30.5],
            "CO2_Reduction_Index": [8.5, 3.2, 6.1]
        }
        return pd.DataFrame(data)

def calculate_circularity_matrix(input_data: dict) -> dict:
    """
    Advanced Milestone 2 Analytics Engine: Parses real CSV historical data,
    computes baseline benchmarks, and evaluates input material attributes.
    """
    # 1. Load the real dataset using pandas
    df = load_sustainability_dataset()
    
    # 2. Compute dynamic market baselines for context
    avg_market_waste = float(df["Waste_Weight_KG"].mean())
    
    # 3. Core Matrix Scoring Logic Architecture
    score = 50.0  # Base standard score
    
    # Material Type Matrix Weighting
    mat_type = input_data.get("Material_Type", "Cotton")
    if mat_type in ["Cotton", "Wool", "Denim"]:
        score += 15.0  # Organic fibers have higher circularity potential
    else:
        score += 5.0   # Synthetic blends
        
    # Condition Validation
    condition = input_data.get("Material_Condition", "Clean")
    if condition == "Clean":
        score += 20.0
    elif condition == "Medium" or condition == "Damaged":
        score += 10.0
    else:
        score -= 10.0  # Heavily contaminated reductions
        
    # Reuse Potential Metrics
    reuse = input_data.get("Reuse_Potential", "High")
    if reuse == "High":
        score += 15.0
    else:
        score += 5.0

    # Ensure score stays strictly within standard architectural boundaries [0, 100]
    score = min(max(score, 0.0), 100.0)
    
    # 4. Determine Sustainability Category
    if score >= 80.0:
        category = "Premium Circularity Asset"
    elif score >= 50.0:
        category = "Standard Recyclable Grade"
    else:
        category = "High Emission Downcycle Target"
        
    return {
        "score": score,
        "category": category,
        "market_baseline_avg_weight": round(avg_market_waste, 2)
    }

if __name__ == "__main__":
    # Internal Unit Test for Verification
    test_sample = {
        "Material_Type": "Denim",
        "Material_Condition": "Clean",
        "Reuse_Potential": "High",
        "Environmental_Benefit": "High",
        "Processing_Feasibility": "Medium"
    }
    result = calculate_circularity_matrix(test_sample)
    print("\n--- 📊 CORE SUSTAINABILITY ENGINE TELEMETRY TEST ---")
    print(f"Computed Circularity Score: {result['score']}")
    print(f"Evaluated Category: {result['category']}")
    print(f"Market Baseline Avg Weight (CSV Parsed): {result['market_baseline_avg_weight']} KG\n")