"""
Business rules for Waste Classification
"""

def classify_waste(material: str, defect: str, recyclability: str, reuse: str):
    material = (material or "").lower()
    defect = (defect or "").lower()

    if "defect" in defect and "no" not in defect:
        condition = "Damaged"
        waste_category = "Recyclable Textile Waste"
        reuse_potential = "Low"
        priority = "High"
    else:
        condition = "Good"
        waste_category = "Reusable Textile Waste"
        reuse_potential = "High"
        priority = "Low"

    if "cotton" in material:
        processing = "Mechanical Recycling"
    elif "polyester" in material:
        processing = "Chemical Recycling"
    elif "denim" in material:
        processing = "Upcycling / Reuse"
    elif "silk" in material:
        processing = "Specialized Textile Recycling"
    elif "wool" in material:
        processing = "Fiber Recovery"
    else:
        processing = "General Textile Recycling"

    return {
        "condition": condition,
        "waste_category": waste_category,
        "recyclability": recyclability,
        "reuse_potential": reuse_potential,
        "processing_recommendation": processing,
        "priority": priority,
        "reuse": reuse,
    }