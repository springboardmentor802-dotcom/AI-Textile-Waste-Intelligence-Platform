"""
Environmental Impact Assessment Engine (Milestone 3, Task 2).
"""

IMPACT_FACTORS = {
    "Cotton":    {"co2_kg_per_kg": 5.5, "water_l_per_kg": 2700},
    "Polyester": {"co2_kg_per_kg": 3.8, "water_l_per_kg": 60},
    "Wool":      {"co2_kg_per_kg": 6.0, "water_l_per_kg": 500},
    "Silk":      {"co2_kg_per_kg": 4.5, "water_l_per_kg": 350},
    "Denim":     {"co2_kg_per_kg": 5.5, "water_l_per_kg": 3000},
}

DEFAULT_IMPACT_FACTOR = {"co2_kg_per_kg": 4.0, "water_l_per_kg": 500}


def estimate_environmental_impact(fabric_type, quantity_kg, waste_category=None):
    quantity_kg = float(quantity_kg or 0)
    factors = IMPACT_FACTORS.get(fabric_type, DEFAULT_IMPACT_FACTOR)

    if waste_category == "Hazardous Textile Waste":
        return {
            "co2_saved_kg": 0.0,
            "water_saved_liters": 0.0,
            "landfill_diverted_kg": 0.0,
            "impact_summary": (
                "No recovery credit applied -- hazardous waste is "
                "routed to safe disposal, not recycling."
            ),
        }

    co2_saved = round(quantity_kg * factors["co2_kg_per_kg"], 2)
    water_saved = round(quantity_kg * factors["water_l_per_kg"], 2)
    landfill_diverted = round(quantity_kg, 2)

    return {
        "co2_saved_kg": co2_saved,
        "water_saved_liters": water_saved,
        "landfill_diverted_kg": landfill_diverted,
        "impact_summary": (
            f"Recovering {quantity_kg}kg of {fabric_type or 'this material'} "
            f"is estimated to save ~{co2_saved}kg CO2 and ~{water_saved}L "
            "of water compared to virgin production, while diverting "
            f"{landfill_diverted}kg from landfill."
        ),
    }
