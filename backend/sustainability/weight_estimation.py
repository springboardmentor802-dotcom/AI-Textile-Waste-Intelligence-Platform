from typing import Optional

GARMENT_AVERAGE_WEIGHT_KG = {
    "Dress": 0.40,
    "Shorts": 0.25,
    "Skirt": 0.30,
    "T-Shirt": 0.20,
    "Shirt": 0.25,
    "Sweater": 0.45,
    "Jacket": 0.70,
    "Jeans": 0.60,
    "Pants": 0.45,
    "Blouse": 0.20,
    "Tank Top": 0.15,
    "Cardigan": 0.40,
    "Top": 0.20,
    "Jumpsuit/Romper": 0.50,
    "Leggings": 0.20,
    "Joggers": 0.40,
    "Hoodie": 0.60,
    "Other": 0.35,
}

MATERIAL_WEIGHT_MULTIPLIER = {
    "Leather": 1.50,
    "Denim": 1.30,
    "Wool": 1.20,
    "Cotton": 1.00,
    "Polyester": 1.00,
    "Nylon": 0.90,
    "Acrylic": 0.95,
    "Linen": 0.85,
    "Viscose": 0.85,
    "Silk": 0.70,
    "Mixed Fabrics": 1.00,
    "Mixed/Unknown": 1.00,
}

DEFAULT_GARMENT_WEIGHT_KG = 0.35

def estimate_item_weight_kg(
    garment_label: Optional[str] = None,
    material_label: Optional[str] = None,
    batch_quantity_kg: Optional[float] = None,
    batch_item_count: Optional[int] = None,
    explicit_weight_kg: Optional[float] = None,
) -> float:
    if explicit_weight_kg and explicit_weight_kg > 0:
        return round(explicit_weight_kg, 3)

    base_weight = GARMENT_AVERAGE_WEIGHT_KG.get(garment_label, DEFAULT_GARMENT_WEIGHT_KG)
    mat_multiplier = MATERIAL_WEIGHT_MULTIPLIER.get(material_label, 1.0)
    estimated_single_weight = base_weight * mat_multiplier

    if batch_quantity_kg and batch_item_count and batch_item_count > 0:
        avg_item_est = DEFAULT_GARMENT_WEIGHT_KG
        scale_ratio = estimated_single_weight / avg_item_est if avg_item_est else 1.0
        proportional_weight = (batch_quantity_kg / batch_item_count) * scale_ratio
        return round(proportional_weight, 3)

    return round(estimated_single_weight, 3)