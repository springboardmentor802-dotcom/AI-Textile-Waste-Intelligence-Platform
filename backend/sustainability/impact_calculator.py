from typing import Optional
from .emission_factors import get_emission_factor, get_pathway_multiplier
from .weight_estimation import estimate_item_weight_kg

def calculate_item_impact(
    scan_doc: dict,
    batch_quantity_kg: Optional[float] = None,
    batch_item_count: Optional[int] = None,
) -> dict:
    analysis = scan_doc.get("analysis") or {}
    recyclability = scan_doc.get("recyclability") or {}

    material_label = (analysis.get("material_type") or {}).get("label") or "Mixed/Unknown"
    garment_label = (analysis.get("garment_type") or {}).get("label")
    recycling_option = recyclability.get("recommended_recycling_option") or "Fiber Recycling"

    weight_kg = estimate_item_weight_kg(
        garment_label=garment_label,
        material_label=material_label,
        batch_quantity_kg=batch_quantity_kg,
        batch_item_count=batch_item_count,
        explicit_weight_kg=scan_doc.get("weight_kg"),
    )

    factor = get_emission_factor(material_label)
    pathway_multiplier = get_pathway_multiplier(recycling_option)

    co2e_avoided_kg = round(weight_kg * factor["co2e_avoided_per_kg"] * pathway_multiplier, 3)
    water_saved_l = round(weight_kg * factor["water_saved_per_kg"] * pathway_multiplier, 1)
    landfill_diverted_kg = round(weight_kg * factor["landfill_mass_factor"], 3)

    return {
        "material_type": material_label,
        "garment_type": garment_label,
        "recycling_option": recycling_option,
        "weight_kg": weight_kg,
        "co2e_avoided_kg": co2e_avoided_kg,
        "water_saved_l": water_saved_l,
        "landfill_diverted_kg": landfill_diverted_kg,
    }

def aggregate_impact(scan_docs: list[dict]) -> dict:
    total_co2e = 0.0
    total_water = 0.0
    total_landfill = 0.0
    total_weight = 0.0
    by_material: dict = {}

    for doc in scan_docs:
        impact = calculate_item_impact(
            doc,
            batch_quantity_kg=doc.get("_batch_quantity_kg"),
            batch_item_count=doc.get("_batch_item_count"),
        )
        total_co2e += impact["co2e_avoided_kg"]
        total_water += impact["water_saved_l"]
        total_landfill += impact["landfill_diverted_kg"]
        total_weight += impact["weight_kg"]

        mat = impact["material_type"]
        bucket = by_material.setdefault(mat, {
            "material_type": mat,
            "item_count": 0,
            "weight_kg": 0.0,
            "co2e_avoided_kg": 0.0,
            "water_saved_l": 0.0,
            "landfill_diverted_kg": 0.0,
        })
        bucket["item_count"] += 1
        bucket["weight_kg"] += impact["weight_kg"]
        bucket["co2e_avoided_kg"] += impact["co2e_avoided_kg"]
        bucket["water_saved_l"] += impact["water_saved_l"]
        bucket["landfill_diverted_kg"] += impact["landfill_diverted_kg"]

    for bucket in by_material.values():
        bucket["weight_kg"] = round(bucket["weight_kg"], 2)
        bucket["co2e_avoided_kg"] = round(bucket["co2e_avoided_kg"], 2)
        bucket["water_saved_l"] = round(bucket["water_saved_l"], 1)
        bucket["landfill_diverted_kg"] = round(bucket["landfill_diverted_kg"], 2)

    return {
        "item_count": len(scan_docs),
        "total_weight_kg": round(total_weight, 2),
        "total_co2e_avoided_kg": round(total_co2e, 2),
        "total_water_saved_l": round(total_water, 1),
        "total_landfill_diverted_kg": round(total_landfill, 2),
        "by_material": list(by_material.values()),
    }