"""
Sustainability Intelligence Engine (Milestone 3, Task 3).
"""

from .environmental_impact_service import estimate_environmental_impact

DIVERTED_CATEGORIES = {
    "Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable",
}


def build_sustainability_summary(textile_queryset):
    total_quantity = 0.0
    diverted_quantity = 0.0
    total_co2 = 0.0
    total_water = 0.0
    total_landfill_diverted = 0.0
    by_category = {}

    for item in textile_queryset:
        quantity = float(item.quantity or 0)
        category = getattr(item, "waste_category", None) or "Uncategorized"

        total_quantity += quantity
        by_category[category] = by_category.get(category, 0.0) + quantity

        if category in DIVERTED_CATEGORIES:
            diverted_quantity += quantity

        impact = estimate_environmental_impact(
            fabric_type=item.material_type,
            quantity_kg=quantity,
            waste_category=category,
        )
        total_co2 += impact["co2_saved_kg"]
        total_water += impact["water_saved_liters"]
        total_landfill_diverted += impact["landfill_diverted_kg"]

    diversion_rate = (
        round((diverted_quantity / total_quantity) * 100, 1)
        if total_quantity > 0 else 0.0
    )

    breakdown = [
        {
            "category": category,
            "quantity_kg": round(qty, 2),
            "pct": round((qty / total_quantity) * 100, 1) if total_quantity else 0.0,
        }
        for category, qty in sorted(
            by_category.items(), key=lambda pair: pair[1], reverse=True
        )
    ]

    sustainability_score = diversion_rate

    return {
        "total_quantity_kg": round(total_quantity, 2),
        "diverted_quantity_kg": round(diverted_quantity, 2),
        "waste_diversion_rate_pct": diversion_rate,
        "total_co2_saved_kg": round(total_co2, 2),
        "total_water_saved_liters": round(total_water, 2),
        "total_landfill_diverted_kg": round(total_landfill_diverted, 2),
        "circular_economy_breakdown": breakdown,
        "sustainability_score": sustainability_score,
    }
