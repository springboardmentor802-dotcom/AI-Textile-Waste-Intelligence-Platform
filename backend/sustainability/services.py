from .constants import EMISSION_FACTORS_KG_CO2_PER_KG, WATER_SAVINGS_LITERS_PER_KG

CONDITION_SCORES = {
    "New Surplus": 1.0,
    "Lightly Used": 0.85,
    "Worn": 0.6,
    "Damaged": 0.35,
    "Contaminated": 0.1,
}


def calculate_circularity_score(material, condition, recyclability_score, reuse_potential, contamination):
    """
    Computes an overall circularity score (0-100) for a waste batch.
    recyclability_score and reuse_potential are expected on a 0-1 scale.
    """
    material_recyclability = recyclability_score
    material_condition = CONDITION_SCORES.get(condition, 0.5)
    environmental_benefit = 1 - (0.5 if contamination else 0)
    processing_feasibility = 0.8 if not contamination else 0.4

    score = (
        material_recyclability * 0.35 +
        material_condition * 0.20 +
        reuse_potential * 0.20 +
        environmental_benefit * 0.15 +
        processing_feasibility * 0.10
    )
    return round(score * 100, 2)


def calculate_environmental_impact(material, quantity_kg, circularity_score):
    """
    Computes CO2 and water savings for a single waste batch.
    circularity_score is 0-100.
    """
    factor_scale = circularity_score / 100

    co2_saved = quantity_kg * EMISSION_FACTORS_KG_CO2_PER_KG.get(material, 3.0) * factor_scale
    water_saved = quantity_kg * WATER_SAVINGS_LITERS_PER_KG.get(material, 500) * factor_scale

    return {
        "co2_saved_kg": round(co2_saved, 2),
        "water_saved_liters": round(water_saved, 2),
    }


def recommend_strategy(circularity_score, condition, contamination):
    """
    Rule-based recommendation engine.
    """
    if contamination:
        return "Chemical Recycling (requires decontamination)"
    if circularity_score >= 80:
        return "Fabric Reuse / Donation"
    if circularity_score >= 60:
        return "Mechanical Recycling"
    if circularity_score >= 40:
        return "Upcycling"
    if condition == "Damaged":
        return "Fiber Recycling"
    return "Industrial Recovery"