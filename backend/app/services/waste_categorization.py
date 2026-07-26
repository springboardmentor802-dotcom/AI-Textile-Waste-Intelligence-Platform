"""
Waste Categorization Engine
Rule-based system using outputs from the analysis pipeline.

Waste Categories:
Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous Textile Waste
"""


def categorize_waste(
    material_result: dict,
    defect_result: dict,
    texture_result: dict,
) -> dict:
    """
    Classify textile waste into a category using rule-based logic.

    Rules:
    - No defects + Good material → Reusable
    - Few defects + Recyclable material → Recyclable
    - Multiple defects + Poor condition → Repairable or Upcyclable
    - Natural fiber + Degraded → Compostable
    - Synthetic + Heavily damaged → Industrial Recovery
    """
    material = material_result.get("predicted_material", "Unknown")
    confidence = material_result.get("confidence", 0)
    condition = defect_result.get("condition", "Unknown")
    defect_count = defect_result.get("defect_count", 0)
    texture_type = texture_result.get("texture_type", "Unknown")

    # Natural fibers that can compost
    natural_fibers = {"Cotton", "Wool", "Silk", "Linen"}
    # Synthetic fibers for industrial recovery
    synthetic_fibers = {"Polyester", "Nylon", "Acrylic", "Viscose"}
    # Easily recyclable materials
    recyclable_materials = {"Polyester", "Nylon", "Cotton", "Denim", "Wool"}

    # Determine category
    if condition == "Good" and defect_count == 0:
        category = "Reusable"
        justification = "No defects detected. Material is in good condition for direct reuse."

    elif condition == "Good" and defect_count <= 2 and material in recyclable_materials:
        category = "Recyclable"
        justification = f"{material} is a recyclable material with minimal defects."

    elif condition == "Fair" and defect_count <= 3:
        category = "Repairable"
        justification = "Minor defects detected. Material can be repaired before reuse."

    elif condition == "Poor" and material in natural_fibers:
        category = "Upcyclable"
        justification = f"Natural fiber ({material}) with significant wear — suitable for upcycling."

    elif condition == "Poor" and material in synthetic_fibers:
        category = "Recyclable"
        justification = f"Synthetic material ({material}) — mechanical or chemical recycling recommended."

    elif texture_type == "Rough" and condition == "Poor":
        category = "Compostable"
        justification = "Heavily degraded natural fiber — composting is the optimal end-of-life path."

    else:
        category = "Upcyclable"
        justification = "Material condition and type suggest upcycling as the best option."

    return {
        "waste_category": category,
        "justification": justification,
        "material": material,
        "condition": condition,
        "defect_count": defect_count,
    }