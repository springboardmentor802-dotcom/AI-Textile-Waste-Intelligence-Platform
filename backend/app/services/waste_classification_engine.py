"""
Textile Waste Classification Engine
Generates final classification outputs including:
Waste Category, Recyclability Assessment, Contamination Recommendations,
Reuse Potential, and Disposal Recommendation.
"""


def classify_textile_waste(pipeline_result: dict) -> dict:
    """
    Generate the final textile waste classification from a completed pipeline result.
    """
    material = pipeline_result["material_recognition"].get("predicted_material", "Unknown")
    condition = pipeline_result["defect_detection"].get("condition", "Unknown")
    defect_count = pipeline_result["defect_detection"].get("defect_count", 0)
    has_defects = pipeline_result["defect_detection"].get("has_defects", False)
    category = pipeline_result["waste_categorization"].get("waste_category", "Unknown")
    reuse_potential = pipeline_result["recyclability_assessment"].get("reuse_potential", "Low")
    primary_strategy = pipeline_result["recyclability_assessment"].get("primary_recycling_strategy", "")
    circularity_score = pipeline_result["waste_scores"].get("overall_circularity_score", 0)

    # Contamination reduction recommendation
    contamination_rec = _contamination_recommendation(has_defects, defect_count, condition)

    # Reuse potential description
    reuse_desc = _describe_reuse_potential(reuse_potential, material, condition)

    # Disposal recommendation
    disposal_rec = _disposal_recommendation(category, condition, circularity_score)

    # Final recommendation summary
    final_recommendation = _final_recommendation(
        material, category, primary_strategy, circularity_score
    )

    return {
        "waste_category_prediction": category,
        "recyclability_assessment": pipeline_result["recyclability_assessment"].get(
            "strategy_description", ""
        ),
        "contamination_reduction_recommendation": contamination_rec,
        "reuse_potential": reuse_potential,
        "reuse_potential_description": reuse_desc,
        "disposal_recommendation": disposal_rec,
        "final_recommendation": final_recommendation,
    }


def _contamination_recommendation(has_defects: bool, defect_count: int, condition: str) -> str:
    if not has_defects:
        return "No contamination or defects detected. Material is clean and ready for processing."
    if defect_count <= 2:
        return (
            "Minor defects detected. Spot cleaning and targeted repair can reduce contamination "
            "before recycling or reuse."
        )
    return (
        "Multiple defects detected. Sort and separate clean sections from damaged ones. "
        "Contaminated sections should be directed to industrial recovery rather than reuse programs."
    )


def _describe_reuse_potential(reuse_potential: str, material: str, condition: str) -> str:
    descriptions = {
        "High": (
            f"This {material} textile has high reuse potential. It can be directly redistributed "
            f"through donation programs, resale platforms, or textile take-back schemes."
        ),
        "Medium": (
            f"This {material} fabric has moderate reuse potential. After minor repairs or cleaning, "
            f"it can re-enter the circular economy."
        ),
        "Low": (
            f"Direct reuse is limited due to the current condition of this {material} textile. "
            f"Material recovery through recycling is recommended."
        ),
    }
    return descriptions.get(reuse_potential, "Reuse potential could not be determined.")


def _disposal_recommendation(category: str, condition: str, score: int) -> str:
    if category == "Reusable":
        return "Preferred: Direct Reuse — Clean and redistribute. No disposal required."
    if category == "Recyclable":
        return "Recommended: Certified Textile Recycler — Sort by material type before collection."
    if category in ("Repairable", "Upcyclable"):
        return "Recommended: Upcycling Partner or Repair Workshop — Avoid landfill."
    if category == "Compostable":
        return "Recommended: Industrial Composting Facility — Natural fibers only."
    if score < 30:
        return "Last Resort: Industrial Energy Recovery — Only if all other options are exhausted."
    return "Recommended: General Textile Recycling — Contact certified facility for correct sorting."


def _final_recommendation(
    material: str, category: str, strategy: str, score: int
) -> str:
    if score >= 75:
        return (
            f"This {material} textile demonstrates excellent recovery potential. "
            f"Priority action: {strategy}. "
            f"Immediate collection and processing is recommended to maximize resource value."
        )
    if score >= 50:
        return (
            f"This {material} textile is suitable for {strategy}. "
            f"With proper sorting and processing, significant material value can be recovered."
        )
    return (
        f"This {material} textile has limited recovery options. "
        f"{strategy} is the most viable path. "
        f"Focus on preventing similar material waste through better quality control."
    )