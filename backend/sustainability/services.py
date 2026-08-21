"""
Environmental impact calculation + recommendation logic used by the
post_save signal on TextileWaste, to automatically populate an
ImpactRecord whenever a batch is created or updated.
"""
from .constants import EMISSION_FACTORS_KG_CO2_PER_KG, WATER_SAVINGS_LITERS_PER_KG

DEFAULT_CO2_FACTOR = 3.0
DEFAULT_WATER_FACTOR = 500


def calculate_environmental_impact(material_type, quantity, circularity_score):
    """
    Estimates CO2 and water savings for a batch, scaled by its
    circularity score (higher score = more of the theoretical
    max savings is actually realized).
    """
    quantity = float(quantity or 0)
    co2_factor = EMISSION_FACTORS_KG_CO2_PER_KG.get(material_type, DEFAULT_CO2_FACTOR)
    water_factor = WATER_SAVINGS_LITERS_PER_KG.get(material_type, DEFAULT_WATER_FACTOR)
    scale = max(0.0, min(float(circularity_score or 0), 100.0)) / 100.0
    co2_saved_kg = round(quantity * co2_factor * scale, 2)
    water_saved_liters = round(quantity * water_factor * scale, 2)
    return {
        "co2_saved_kg": co2_saved_kg,
        "water_saved_liters": water_saved_liters,
    }


def recommend_strategy(circularity_score, condition, contamination):
    """
    Threshold-based strategy recommendation driven off the circularity
    score, with contamination as an override.

    Contamination always wins: contaminated textiles are routed to
    Chemical Recycling, which can process contaminated material that
    mechanical recycling or reuse cannot handle.

    Otherwise, thresholds bucket the item by circularity score:
      >= 70  -> Fabric Reuse / Donation (high enough quality to reuse as-is)
      >= 50  -> Upcycling
      >= 30  -> Donation
      < 30   -> Industrial Recovery
    """
    if contamination:
        return "Chemical Recycling"

    score = circularity_score or 0

    if score >= 70:
        return "Fabric Reuse / Donation"
    if score >= 50:
        return "Upcycling"
    if score >= 30:
        return "Donation"
    return "Industrial Recovery"