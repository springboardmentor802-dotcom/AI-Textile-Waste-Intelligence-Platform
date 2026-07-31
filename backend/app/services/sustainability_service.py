"""
Sustainability Intelligence Service
----------------------------------
Business rules for Milestone 3
"""

def generate_sustainability(material: str, defect: str):
    material = (material or "").lower()
    defect = (defect or "").lower()

    data = {
        "sustainability_score": 75,
        "environmental_impact": "Medium",
        "carbon_footprint": "Medium",
        "water_consumption": "Medium",
        "recycling_recommendation": "General Textile Recycling",
        "circular_economy": "Reuse whenever possible",
        "eco_rating": "★★★☆☆"
    }

    if "cotton" in material:
        data.update({
            "sustainability_score":95,
            "environmental_impact":"Low",
            "carbon_footprint":"Low",
            "water_consumption":"Medium",
            "recycling_recommendation":"Mechanical Recycling",
            "circular_economy":"Reuse in Production",
            "eco_rating":"★★★★★"
        })
    elif "polyester" in material:
        data.update({
            "sustainability_score":70,
            "environmental_impact":"Medium",
            "carbon_footprint":"High",
            "water_consumption":"Low",
            "recycling_recommendation":"Chemical Recycling",
            "circular_economy":"Fiber Recovery",
            "eco_rating":"★★★☆☆"
        })
    elif "denim" in material:
        data.update({
            "sustainability_score":88,
            "environmental_impact":"Medium",
            "carbon_footprint":"Medium",
            "water_consumption":"High",
            "recycling_recommendation":"Upcycling",
            "circular_economy":"Convert into new textile products",
            "eco_rating":"★★★★☆"
        })
    elif "silk" in material:
        data.update({
            "sustainability_score":82,
            "environmental_impact":"Low",
            "carbon_footprint":"Low",
            "water_consumption":"High",
            "recycling_recommendation":"Specialized Textile Recycling",
            "circular_economy":"Luxury Fabric Recovery",
            "eco_rating":"★★★★☆"
        })
    elif "wool" in material:
        data.update({
            "sustainability_score":90,
            "environmental_impact":"Low",
            "carbon_footprint":"Low",
            "water_consumption":"Medium",
            "recycling_recommendation":"Fiber Recovery",
            "circular_economy":"Reuse in Textile Manufacturing",
            "eco_rating":"★★★★★"
        })

    if "defect" in defect and "no" not in defect:
        data["sustainability_score"] = max(50, data["sustainability_score"] - 10)
        data["circular_economy"] = "Recycle into secondary products"

    return data