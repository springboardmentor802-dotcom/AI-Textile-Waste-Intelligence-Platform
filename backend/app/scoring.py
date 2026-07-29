"""
Waste classification + recycling recommendation + sustainability/environmental
scoring + the weighted circularity score, exactly as specified in the project
doc:

    Circularity Score =
        Material Recyclability   (35%)
      + Material Condition       (20%)
      + Reuse Potential          (20%)
      + Environmental Benefit    (15%)
      + Processing Feasibility   (10%)
"""

RECYCLABILITY_SCORE = {"High": 90, "Medium": 60, "Low": 30}
REUSE_SCORE = {"High": 90, "Medium": 60, "Low": 30}


def _condition_score(damage: dict, contamination: dict) -> float:
    base = {"None": 95, "Minor": 80, "Medium": 55, "Severe": 20}[damage["severity"]]
    if contamination["contaminated"]:
        base -= 15
    return max(0, base)


def _environmental_benefit_score(material_result: dict) -> float:
    return RECYCLABILITY_SCORE.get(material_result["recyclability"], 50)


def _processing_feasibility_score(damage: dict, contamination: dict) -> float:
    score = 90
    if contamination["contaminated"]:
        score -= 30
    if damage["severity"] in ("Medium", "Severe"):
        score -= 25
    return max(0, score)


def _category(score: float) -> str:
    if score >= 85:
        return "Excellent"
    if score >= 65:
        return "High"
    if score >= 40:
        return "Moderate"
    return "Low"


def compute_scores(material_result: dict, texture_result: dict, damage: dict, contamination: dict) -> dict:
    recyclability_score = RECYCLABILITY_SCORE.get(material_result["recyclability"], 50)
    reuse_score = REUSE_SCORE.get(material_result["reuse_potential"], 50)
    condition_score = _condition_score(damage, contamination)
    environmental_benefit = _environmental_benefit_score(material_result)
    processing_feasibility = _processing_feasibility_score(damage, contamination)

    circularity_score = (
        recyclability_score * 0.35 +
        condition_score * 0.20 +
        reuse_score * 0.20 +
        environmental_benefit * 0.15 +
        processing_feasibility * 0.10
    )

    return {
        "recyclability_score": round(recyclability_score, 1),
        "material_condition_score": round(condition_score, 1),
        "reuse_score": round(reuse_score, 1),
        "environmental_benefit_score": round(environmental_benefit, 1),
        "processing_feasibility_score": round(processing_feasibility, 1),
        "circularity_score": round(circularity_score, 1),
        "circularity_category": _category(circularity_score),
        "overall_score": round(circularity_score, 1),
        "overall_category": _category(circularity_score),
    }


def classify_waste(material_result: dict, damage: dict, contamination: dict, scores: dict) -> dict:
    if contamination["contaminated"] and contamination["chemical_indicator_pct"] > 70:
        category, explanation = "Hazardous", (
            "This fabric shows signs of chemical contamination and should be treated as hazardous "
            "textile waste until professionally cleaned or assessed."
        )
    elif damage["severity"] == "None" and not contamination["contaminated"]:
        category, explanation = "Reusable", "This fabric is clean and undamaged -- it can be reused as-is."
    elif damage["repairable"] and damage["severity"] in ("Minor", "Medium"):
        category, explanation = "Repairable", "This fabric has minor to medium damage but can be repaired and reused."
    elif material_result["recyclability"] in ("High", "Medium") and damage["recyclable"]:
        category, explanation = "Recyclable", "This fabric is in suitable condition to be processed through recycling."
    elif material_result["material"] == "Mixed Fabric":
        category, explanation = "Upcyclable", "This blended fabric is difficult to recycle by fibre, but well suited to upcycling into new products."
    else:
        category, explanation = "Compostable" if material_result["fiber_composition"].startswith("Natural") else "Upcyclable", \
            "Given its condition, this material is best directed to composting or creative upcycling."

    return {"waste_category": category, "explanation": explanation}


RECYCLING_OPTIONS = {
    "Mechanical Recycling": "Shredding and re-spinning the fibre into new yarn -- best for sturdy, single-fibre natural fabrics.",
    "Chemical Recycling": "Breaking the fibre down chemically to recover raw polymer -- best for synthetic or semi-synthetic fibres.",
    "Fabric Reuse": "The fabric is suitable to be reused directly as-is or in another garment.",
    "Donation": "Suitable for donation to charities or secondhand markets.",
    "Upcycling": "Creative repurposing into new products (bags, quilts, insulation, etc).",
    "Industrial Recovery": "Recovered as industrial filler, insulation, or composite material input.",
}


def recommend_recycling(material_result: dict, waste_result: dict, scores: dict) -> dict:
    best = material_result["recommended_recycling_method"]
    if waste_result["waste_category"] == "Hazardous":
        best = "Industrial Recovery"
    elif waste_result["waste_category"] == "Reusable":
        best = "Fabric Reuse"
    elif waste_result["waste_category"] == "Repairable":
        best = "Donation"
    elif waste_result["waste_category"] == "Upcyclable":
        best = "Upcycling"

    alternatives = [m for m in RECYCLING_OPTIONS if m != best]
    alternative = alternatives[0]

    priority = "High" if scores["circularity_score"] >= 65 else "Medium" if scores["circularity_score"] >= 40 else "Low"
    expected_recovery = f"{min(95, round(scores['circularity_score'] + 10))}%"

    return {
        "best_recommendation": best,
        "best_recommendation_detail": RECYCLING_OPTIONS[best],
        "alternative_recommendation": alternative,
        "alternative_recommendation_detail": RECYCLING_OPTIONS[alternative],
        "processing_priority": priority,
        "expected_recovery": expected_recovery,
        "reason": f"Based on a circularity score of {scores['circularity_score']}/100 "
                  f"({scores['circularity_category']} recovery potential), {best.lower()} offers the best "
                  f"balance of resource recovery and processing feasibility for this material.",
    }


def sustainability_assessment(material_result: dict, scores: dict) -> dict:
    base = scores["circularity_score"] / 100
    carbon_saving_kg = round(base * 4.2, 2)
    water_saving_l = round(base * 2650, 0)
    waste_diversion_pct = round(min(98, scores["circularity_score"] + 8), 1)
    resource_recovery_pct = round(scores["recyclability_score"], 1)

    return {
        "carbon_saving_kg_co2": carbon_saving_kg,
        "water_saving_liters": water_saving_l,
        "waste_diversion_pct": waste_diversion_pct,
        "circular_economy_score": scores["circularity_score"],
        "resource_recovery_pct": resource_recovery_pct,
        "environmental_benefit": _category(scores["environmental_benefit_score"]),
        "explanation": (
            f"Recycling this item instead of landfilling it saves an estimated {carbon_saving_kg} kg of CO2 "
            f"and {int(water_saving_l)} liters of water, while diverting {waste_diversion_pct}% of this "
            "material away from landfill."
        ),
    }


def environmental_impact(sustainability: dict, scores: dict) -> dict:
    rating = _category(scores["circularity_score"])
    return {
        "co2_reduction_kg": sustainability["carbon_saving_kg_co2"],
        "water_saved_liters": sustainability["water_saving_liters"],
        "landfill_reduction_pct": sustainability["waste_diversion_pct"],
        "resource_conservation_pct": sustainability["resource_recovery_pct"],
        "overall_environmental_rating": rating,
        "explanation": f"Overall environmental rating: {rating}. Diverting this item from landfill "
                        "reduces greenhouse-gas emissions and conserves raw material extraction.",
    }
