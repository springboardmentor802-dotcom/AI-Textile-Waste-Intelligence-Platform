"""
Recyclability Assessment / Waste Scoring Engine
--------------------------------------------------
Implements the weighted Circularity Score formula from the project spec:

    Circularity Score =
        Material Recyclability   (35%)
      + Material Condition       (20%)
      + Reuse Potential          (20%)
      + Environmental Benefit    (15%)
      + Processing Feasibility   (10%)

Each sub-score is 0-100. The final score maps to a Circularity Category:
Excellent / High / Moderate / Limited Recovery Potential, or
Disposal Recommended.

This is Milestone 2, Task 4.
"""

# --- Sub-score lookup tables (0-100 scale) ---
# These are starting-point estimates based on general textile recycling
# knowledge; they can be refined later with more domain research.

RECYCLABILITY_BY_FIBER = {
    "cotton": 90,
    "linen": 90,
    "wool": 80,
    "silk": 75,
    "denim": 85,
    "polyester": 65,
    "polyamide": 60,
    "nylon": 60,
    "acrylic": 55,
    "rayon": 60,
    "mixed fabrics": 35,   # blends are hard to separate/recycle
}

ENVIRONMENTAL_BENEFIT_BY_FIBER = {
    "cotton": 70,          # natural but water-intensive to grow
    "linen": 85,
    "wool": 75,
    "silk": 70,
    "denim": 65,
    "polyester": 50,       # petroleum-based, but recycling saves emissions
    "polyamide": 45,
    "nylon": 45,
    "acrylic": 40,
    "rayon": 55,
    "mixed fabrics": 40,
}

PROCESSING_FEASIBILITY_BY_FIBER = {
    "cotton": 85,
    "linen": 80,
    "wool": 70,
    "silk": 65,
    "denim": 75,
    "polyester": 70,
    "polyamide": 65,
    "nylon": 65,
    "acrylic": 60,
    "rayon": 60,
    "mixed fabrics": 30,   # blends require extra separation steps
}

CONDITION_SCORE = {
    "excellent": 100,
    "good": 85,
    "like new": 95,
    "fair": 60,
    "moderate": 55,
    "average": 55,
    "worn": 40,
    "damaged": 25,
    "torn": 15,
    "severely worn": 10,
}


def normalize(text: str) -> str:
    return text.strip().lower()


def get_recyclability_score(fabric_type: str) -> int:
    # default: 50
    return RECYCLABILITY_BY_FIBER.get(normalize(fabric_type), 50)


def get_condition_score(condition: str) -> int:
    return CONDITION_SCORE.get(normalize(condition), 50)


def get_reuse_potential_score(condition: str, fabric_type: str) -> int:
    """
    Reuse potential mostly follows condition, but a very fragile
    natural fiber (like silk) in poor condition has lower reuse
    potential than a durable synthetic in the same condition.
    """
    base_score = get_condition_score(condition)

    fabric_type_norm = normalize(fabric_type)
    if fabric_type_norm in ("denim", "polyester", "nylon", "polyamide"):
        # durable fabrics retain reuse value a bit longer
        return min(100, base_score + 10)

    return base_score


def get_environmental_benefit_score(fabric_type: str) -> int:
    return ENVIRONMENTAL_BENEFIT_BY_FIBER.get(normalize(fabric_type), 50)


def get_processing_feasibility_score(fabric_type: str) -> int:
    return PROCESSING_FEASIBILITY_BY_FIBER.get(normalize(fabric_type), 50)


def calculate_circularity_score(fabric_type: str, condition: str) -> dict:
    """
    Main function -- combines all sub-scores using the spec's weights
    and returns the final score plus a category label.
    """
    recyclability = get_recyclability_score(fabric_type)
    material_condition = get_condition_score(condition)
    reuse_potential = get_reuse_potential_score(condition, fabric_type)
    environmental_benefit = get_environmental_benefit_score(fabric_type)
    processing_feasibility = get_processing_feasibility_score(fabric_type)

    circularity_score = (
        recyclability * 0.35
        + material_condition * 0.20
        + reuse_potential * 0.20
        + environmental_benefit * 0.15
        + processing_feasibility * 0.10
    )
    circularity_score = round(circularity_score, 2)

    # Map final score to a category (per the spec's Circularity Categories)
    if circularity_score >= 80:
        category = "Excellent Recovery Potential"
    elif circularity_score >= 60:
        category = "High Recovery Potential"
    elif circularity_score >= 40:
        category = "Moderate Recovery Potential"
    elif circularity_score >= 20:
        category = "Limited Recovery Potential"
    else:
        category = "Disposal Recommended"

    return {
        "circularity_score": circularity_score,
        "circularity_category": category,
        "breakdown": {
            "material_recyclability": recyclability,
            "material_condition": material_condition,
            "reuse_potential": reuse_potential,
            "environmental_benefit": environmental_benefit,
            "processing_feasibility": processing_feasibility,
        },
    }


# ---------------------------------------------------------------
# Quick manual test
# ---------------------------------------------------------------
if __name__ == "__main__":
    test_cases = [
        {"fabric_type": "cotton", "condition": "good"},
        {"fabric_type": "polyester", "condition": "fair"},
        {"fabric_type": "mixed fabrics", "condition": "damaged"},
        {"fabric_type": "denim", "condition": "excellent"},
    ]

    for case in test_cases:
        result = calculate_circularity_score(**case)
        print(f"Input: {case}")
        print(f"Result: {result}\n")
