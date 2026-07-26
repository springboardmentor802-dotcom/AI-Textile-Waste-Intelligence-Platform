"""
Waste Scoring Engine
Calculates: Recyclability Score, Reuse Score, Sustainability Score,
Material Recovery Score, Overall Circularity Score

Circularity Score weights:
Material Recyclability: 35%
Material Condition:     20%
Reuse Potential:        20%
Environmental Benefit:  15%
Processing Feasibility: 10%
"""


# How recyclable is each material? (0-100 base score)
MATERIAL_RECYCLABILITY_BASE = {
    "Cotton": 85,
    "Polyester": 80,
    "Nylon": 78,
    "Denim": 82,
    "Wool": 88,
    "Linen": 75,
    "Silk": 65,
    "Acrylic": 60,
    "Viscose": 70,
    "Blended": 55,
    "Fleece": 65,
    "Leather": 45,
    "Satin": 60,
    "Chenille": 55,
    "Corduroy": 72,
    "Crepe": 60,
    "Terrycloth": 65,
    "Velvet": 58,
}


def calculate_scores(
    material_result: dict,
    defect_result: dict,
    texture_result: dict,
    recyclability: dict,
) -> dict:
    """
    Calculate all waste scoring metrics.
    """
    material = material_result.get("predicted_material", "Unknown")
    confidence = material_result.get("confidence", 50)
    condition = defect_result.get("condition", "Fair")
    defect_count = defect_result.get("defect_count", 0)
    reuse_potential = recyclability.get("reuse_potential", "Medium")
    texture_type = texture_result.get("texture_type", "Medium")

    # --- Component Scores (0-100) ---

    # 1. Material Recyclability Score (35% weight)
    recyclability_base = MATERIAL_RECYCLABILITY_BASE.get(material, 60)
    # Adjust for model confidence
    confidence_factor = confidence / 100
    material_recyclability_score = round(recyclability_base * confidence_factor)

    # 2. Material Condition Score (20% weight)
    condition_score_map = {"Good": 90, "Fair": 60, "Poor": 25, "Unknown": 40}
    condition_score = condition_score_map.get(condition, 40)
    # Penalize for defects
    defect_penalty = min(defect_count * 8, 40)
    condition_score = max(0, condition_score - defect_penalty)

    # 3. Reuse Potential Score (20% weight)
    reuse_map = {"High": 90, "Medium": 60, "Low": 25}
    reuse_score = reuse_map.get(reuse_potential, 50)

    # 4. Environmental Benefit Score (15% weight)
    env_score = _calculate_env_score(material, condition)

    # 5. Processing Feasibility Score (10% weight)
    feasibility_score = _calculate_feasibility(material, texture_type)

    # --- Overall Circularity Score (weighted) ---
    circularity_score = round(
        (material_recyclability_score * 0.35)
        + (condition_score * 0.20)
        + (reuse_score * 0.20)
        + (env_score * 0.15)
        + (feasibility_score * 0.10)
    )

    # --- Recyclability Score ---
    recyclability_score = round(
        (material_recyclability_score * 0.5) + (condition_score * 0.3) + (feasibility_score * 0.2)
    )

    # --- Sustainability Score ---
    sustainability_score = round(
        (env_score * 0.5) + (circularity_score * 0.3) + (reuse_score * 0.2)
    )

    # --- Material Recovery Score ---
    material_recovery_score = round(
        (material_recyclability_score * 0.6) + (feasibility_score * 0.4)
    )

    # --- Circularity Category ---
    circularity_category = _classify_circularity(circularity_score)

    return {
        "recyclability_score": min(100, recyclability_score),
        "reuse_score": min(100, reuse_score),
        "sustainability_score": min(100, sustainability_score),
        "material_recovery_score": min(100, material_recovery_score),
        "overall_circularity_score": min(100, circularity_score),
        "circularity_category": circularity_category,
        "score_breakdown": {
            "material_recyclability": {
                "score": min(100, material_recyclability_score),
                "weight": "35%",
            },
            "material_condition": {
                "score": min(100, condition_score),
                "weight": "20%",
            },
            "reuse_potential": {
                "score": min(100, reuse_score),
                "weight": "20%",
            },
            "environmental_benefit": {
                "score": min(100, env_score),
                "weight": "15%",
            },
            "processing_feasibility": {
                "score": min(100, feasibility_score),
                "weight": "10%",
            },
        },
    }


def _calculate_env_score(material: str, condition: str) -> int:
    high_impact = {"Wool", "Silk", "Leather"}
    medium_impact = {"Cotton", "Linen", "Viscose"}
    low_impact = {"Polyester", "Nylon", "Acrylic", "Fleece"}

    if material in high_impact:
        base = 90
    elif material in medium_impact:
        base = 75
    elif material in low_impact:
        base = 60
    else:
        base = 65

    if condition == "Good":
        return base
    if condition == "Fair":
        return max(0, base - 15)
    return max(0, base - 35)


def _calculate_feasibility(material: str, texture_type: str) -> int:
    easy = {"Cotton", "Polyester", "Denim", "Fleece", "Nylon"}
    moderate = {"Wool", "Linen", "Viscose", "Acrylic", "Corduroy"}
    difficult = {"Silk", "Leather", "Velvet", "Satin", "Blended"}

    if material in easy:
        base = 85
    elif material in moderate:
        base = 65
    elif material in difficult:
        base = 45
    else:
        base = 55

    if texture_type == "Smooth":
        base += 5
    elif texture_type == "Rough":
        base -= 5

    return min(100, max(0, base))


def _classify_circularity(score: int) -> str:
    if score >= 80:
        return "Excellent Recovery Potential"
    if score >= 65:
        return "High Recovery Potential"
    if score >= 45:
        return "Moderate Recovery Potential"
    if score >= 25:
        return "Limited Recovery Potential"
    return "Disposal Recommended"