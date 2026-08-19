import os
import numpy as np
import pandas as pd

DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "datasets", 
    "sustainable_fashion_dataset.csv"
)

def clean_dict(data):
    if isinstance(data, dict):
        return {k: clean_dict(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_dict(item) for item in data]
    elif isinstance(data, float):
        if np.isnan(data) or np.isinf(data):
            return None
        return data
    return data

def load_sustainability_dataset():
    if os.path.exists(DATASET_PATH):
        try:
            df = pd.read_csv(DATASET_PATH)
            df = df.replace([np.nan, np.inf, -np.inf], None)
            df = df.where(pd.notnull(df), None)
            return df
        except Exception as e:
            print(f"Error loading dataset CSV: {e}")

    data = {
        "Material_Type": ["Denim", "Cotton", "Polyester", "Wool", "Silk"],
        "Material_Condition": ["Hardware Defect", "Excellent", "Good", "Fair", "Contaminated"],
        "Waste_Weight_KG": [45.2, 120.0, 30.5, 15.0, 85.0]
    }
    return pd.DataFrame(data)

def calculate_circularity_score(input_data: dict) -> dict:
    recyclability_map = {
        "Denim": 82.0, "Cotton": 90.0, "Wool": 85.0, "Linen": 85.0,
        "Silk": 70.0, "Polyester": 60.0, "Nylon": 55.0, "Rayon": 65.0,
        "Acrylic": 40.0, "Mixed Fabrics": 30.0
    }
    mat_type = input_data.get("material_type", "Cotton")
    recyclability_score = float(input_data.get("override_recyclability", recyclability_map.get(mat_type, 75.0)))

    condition_map = {
        "Excellent": 100.0, "Good": 80.0, "Fair": 60.0, "Hardware Defect": 65.0, "Contaminated": 20.0
    }
    condition = input_data.get("material_condition", "Good")
    condition_score = float(input_data.get("override_condition_score", condition_map.get(condition, 65.0)))

    reuse = input_data.get("reuse_potential", "High")
    reuse_score = 90.0 if reuse == "High" else (60.0 if reuse == "Medium" else 25.0)

    env = input_data.get("environmental_benefit", "High")
    env_score = 95.0 if env == "High" else (65.0 if env == "Medium" else 30.0)

    feasibility = input_data.get("processing_feasibility", "Easy")
    feasibility_score = 90.0 if feasibility == "Easy" else (60.0 if feasibility == "Medium" else 20.0)

    final_score = (
        (0.35 * recyclability_score) +
        (0.20 * condition_score) +
        (0.20 * reuse_score) +
        (0.15 * env_score) +
        (0.10 * feasibility_score)
    )
    final_score = round(min(max(final_score, 0.0), 100.0), 2)

    if final_score >= 85.0:
        category = "Excellent Recovery Potential"
    elif final_score >= 70.0:
        category = "High Recovery Potential"
    elif final_score >= 50.0:
        category = "Moderate Recovery Potential"
    else:
        category = "Disposal Recommended"

    result = {
        "circularity_score": final_score,
        "category": category,
        "breakdown": {
            "recyclability_score": recyclability_score,
            "condition_score": condition_score,
            "reuse_score": reuse_score,
            "environmental_score": env_score,
            "feasibility_score": feasibility_score
        }
    }
    return clean_dict(result)

def generate_recycling_recommendation(mat_type: str, condition: str, score: float) -> dict:
    if condition == "Hardware Defect" or "denim" in mat_type.lower():
        primary = "Hardware Removal & Shredding"
        secondary = "Denim Upcycling"
        strategy = "Hardware/zipper defect detected. Remove metal components and divert denim cotton to garnetting."
    elif condition == "Contaminated" or "stained" in condition.lower():
        primary = "Pre-Washing & Chemical Cleaning"
        secondary = "Downcycled Padding Wipes"
        strategy = "Surface contamination detected. Route through chemical pre-washing prior to mechanical processing."
    elif score >= 85.0:
        primary = "Mechanical Recycling"
        secondary = "Fiber Upcycling"
        strategy = "High purity fiber. Direct to secondary yarn spinning."
    else:
        primary = "Industrial Recovery"
        secondary = "Chemical Depolymerization"
        strategy = "Repurpose fabric cut-offs into insulation or felt."

    return clean_dict({
        "primary_strategy": primary,
        "secondary_strategy": secondary,
        "action_plan": strategy
    })

def calculate_environmental_impact(weight_kg: float, mat_type: str) -> dict:
    weight_kg = weight_kg if weight_kg is not None else 0.5
    co2_factor = 3.5 if mat_type in ["Cotton", "Denim", "Wool", "Linen"] else 2.1
    water_factor = 2500.0 if mat_type in ["Cotton", "Denim", "Wool"] else 500.0

    return clean_dict({
        "co2_savings_kg": round(weight_kg * co2_factor, 2),
        "water_savings_liters": round(weight_kg * water_factor, 2),
        "landfill_diverted_kg": round(weight_kg, 2)
    })