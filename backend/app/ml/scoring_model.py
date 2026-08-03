import os
import pandas as pd

DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "datasets", "sustainable_fashion_dataset.csv")

def load_sustainability_dataset():
    if os.path.exists(DATASET_PATH):
        return pd.read_csv(DATASET_PATH)
    
    data = {
        "Material_Type": ["Cotton", "Polyester", "Wool", "Silk", "Denim"],
        "Material_Condition": ["Excellent", "Good", "Fair", "Poor", "Contaminated"],
        "Waste_Weight_KG": [45.2, 120.0, 30.5, 15.0, 85.0]
    }
    return pd.DataFrame(data)


# =====================================================================
# 1. SUSTAINABILITY INTELLIGENCE & WEIGHTED SCORING ENGINE (35/20/20/15/10)
# =====================================================================
def calculate_circularity_score(input_data: dict) -> dict:
    """
    Weighted Scoring Formula:
    Circularity Score =
      - Material Recyclability (35%)
      - Material Condition (20%)
      - Reuse Potential (20%)
      - Environmental Benefit (15%)
      - Processing Feasibility (10%)
    """
    # 1. Material Recyclability Score (0-100) -> Weight 35%
    recyclability_map = {
        "Cotton": 90.0, "Wool": 85.0, "Denim": 80.0, "Linen": 85.0,
        "Silk": 70.0, "Polyester": 60.0, "Nylon": 55.0, "Rayon": 65.0,
        "Acrylic": 40.0, "Mixed Fabrics": 30.0
    }
    mat_type = input_data.get("material_type", "Cotton")
    recyclability_score = recyclability_map.get(mat_type, 50.0)

    # 2. Material Condition Score (0-100) -> Weight 20%
    condition_map = {
        "Excellent": 100.0, "Good": 80.0, "Fair": 60.0, "Poor": 35.0, "Contaminated": 10.0
    }
    condition = input_data.get("material_condition", "Good")
    condition_score = condition_map.get(condition, 50.0)

    # 3. Reuse Potential Score (0-100) -> Weight 20%
    reuse = input_data.get("reuse_potential", "High")
    reuse_score = 90.0 if reuse == "High" else (60.0 if reuse == "Medium" else 25.0)

    # 4. Environmental Benefit Score (0-100) -> Weight 15%
    env = input_data.get("environmental_benefit", "High")
    env_score = 95.0 if env == "High" else (65.0 if env == "Medium" else 30.0)

    # 5. Processing Feasibility Score (0-100) -> Weight 10%
    feasibility = input_data.get("processing_feasibility", "Easy")
    feasibility_score = 90.0 if feasibility == "Easy" else (60.0 if feasibility == "Medium" else 20.0)

    # Weighted Sum Formula
    final_score = (
        (0.35 * recyclability_score) +
        (0.20 * condition_score) +
        (0.20 * reuse_score) +
        (0.15 * env_score) +
        (0.10 * feasibility_score)
    )
    final_score = round(min(max(final_score, 0.0), 100.0), 2)

    # 5 Circularity Categories Assignment
    if final_score >= 85.0:
        category = "Excellent Recovery Potential"
    elif final_score >= 70.0:
        category = "High Recovery Potential"
    elif final_score >= 50.0:
        category = "Moderate Recovery Potential"
    elif final_score >= 35.0:
        category = "Limited Recovery Potential"
    else:
        category = "Disposal Recommended"

    return {
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


# =====================================================================
# 2. RECYCLING RECOMMENDATION ENGINE WORKFLOWS
# =====================================================================
def generate_recycling_recommendation(mat_type: str, condition: str, score: float) -> dict:
    """
    Generates actionable circular strategies based on material type, condition, and score.
    Options: Fiber Recycling, Mechanical Recycling, Chemical Recycling, Fabric Reuse, Upcycling, Donation, Industrial Recovery.
    """
    if score < 35.0 or condition == "Contaminated":
        primary = "Industrial Recovery"
        secondary = "Chemical Recycling / Downcycling"
        strategy = "Material is heavily contaminated or damaged. Direct to high-temperature thermal recovery or industrial chemical breakdown."
    elif score >= 85.0 and condition in ["Excellent", "Good"]:
        if mat_type in ["Cotton", "Wool", "Denim"]:
            primary = "Fabric Reuse"
            secondary = "Upcycling"
            strategy = "High quality natural fibers. Direct to premium clothing upcycling, resale channels, or secondary fashion manufacturing."
        else:
            primary = "Mechanical Recycling"
            secondary = "Fiber Recycling"
            strategy = "High purity synthetic/blended material. Shred and spin directly into new virgin-grade yarn."
    elif score >= 70.0:
        if mat_type in ["Polyester", "Nylon", "Acrylic"]:
            primary = "Chemical Recycling"
            secondary = "Mechanical Recycling"
            strategy = "Depolymerize synthetic polymers to extract virgin monomers for closed-loop textile production."
        else:
            primary = "Upcycling"
            secondary = "Donation"
            strategy = "Repurpose fabric cut-offs into industrial cleaning wipes, home insulation, or accessories."
    elif score >= 50.0:
        primary = "Fiber Recycling"
        secondary = "Donation"
        strategy = "Process material through mechanical carding to reclaim short fibers for non-woven textiles."
    else:
        primary = "Industrial Recovery"
        secondary = "Chemical Recycling"
        strategy = "Material suitability for closed-loop textiles is low. Divert to acoustic padding or automotive felt."

    return {
        "primary_strategy": primary,
        "secondary_strategy": secondary,
        "action_plan": strategy
    }


# =====================================================================
# 3. ENVIRONMENTAL IMPACT ASSESSMENT MODELS
# =====================================================================
def calculate_environmental_impact(weight_kg: float, mat_type: str) -> dict:
    """
    Calculates estimated CO2 savings, water saved, and landfill space diverted.
    """
    co2_factor = 3.5 if mat_type in ["Cotton", "Denim"] else (2.1 if mat_type in ["Polyester", "Nylon"] else 2.8)
    water_factor = 2500.0 if mat_type in ["Cotton", "Denim"] else (500.0 if mat_type in ["Polyester", "Nylon"] else 1200.0)

    co2_saved_kg = round(weight_kg * co2_factor, 2)
    water_saved_liters = round(weight_kg * water_factor, 2)
    landfill_diverted_kg = round(weight_kg, 2)

    return {
        "co2_savings_kg": co2_saved_kg,
        "water_savings_liters": water_saved_liters,
        "landfill_diverted_kg": landfill_diverted_kg
    }