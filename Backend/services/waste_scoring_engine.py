
from typing import Any, Dict, Optional

from knowledge_base.schemas import MaterialKnowledge

STATUS_OK = "ok"
STATUS_UNAVAILABLE = "unavailable_insufficient_data"

# Formula weights - exact values from the project documentation.

WEIGHT_MATERIAL_RECYCLABILITY = 0.35
WEIGHT_MATERIAL_CONDITION = 0.20
WEIGHT_REUSE_SCORE = 0.20
WEIGHT_ENVIRONMENTAL_BENEFIT = 0.15
WEIGHT_PROCESSING_FEASIBILITY = 0.10

# Circularity Categories - exact wording from the project documentation.

CATEGORY_EXCELLENT = "Excellent Recovery Potential"
CATEGORY_HIGH = "High Recovery Potential"
CATEGORY_MODERATE = "Moderate Recovery Potential"
CATEGORY_LIMITED = "Limited Recovery Potential"
CATEGORY_DISPOSAL = "Disposal Recommended"

CATEGORY_UNAVAILABLE = "Unclassified - Manual Review Required"

DEFAULT_CONDITION_SCORE = 80.0


def _score_to_category(circularity_score: float) -> str:
    """Map a numeric circularity score to its documented category tier.

    Args:
        circularity_score: The computed circularity score, 0-100.

    Returns:
        One of the five documented Circularity Categories.
    """
    if circularity_score >= 85:
        return CATEGORY_EXCELLENT
    if circularity_score >= 70:
        return CATEGORY_HIGH
    if circularity_score >= 55:
        return CATEGORY_MODERATE
    if circularity_score >= 40:
        return CATEGORY_LIMITED
    return CATEGORY_DISPOSAL


def calculate_circularity_score(
    material: MaterialKnowledge,
    condition_score: float = DEFAULT_CONDITION_SCORE,
) -> Dict[str, Any]:
    """Calculate the Circularity Score for a material using the exact
    weighted formula from the project documentation.

    Args:
        material: The MaterialKnowledge entry for the predicted fabric
            class (e.g. the result of `get_material("Cotton")`).
        condition_score: The item's physical condition score (0-100),
            intended to eventually be derived from the Defect Detection
            model's severity output. Defaults to 80.0 as a placeholder
            "good condition" assumption until that mapping exists.

    Returns:
        A dictionary with the following keys:
            - circularity_score (Optional[float]): 0-100, or None if the
              material's scores are incomplete.
            - circularity_category (str): one of the five documented
              categories, or CATEGORY_UNAVAILABLE if the score could not
              be computed.
            - score_breakdown (Dict[str, Optional[float]]): the five raw
              inputs that were combined (or would have been combined).
            - status (str): STATUS_OK or STATUS_UNAVAILABLE.

    Raises:
        ValueError: If condition_score is not within the 0-100 range.
    """
    if not 0 <= condition_score <= 100:
        raise ValueError(
            f"condition_score must be between 0 and 100, got {condition_score!r}"
        )

    scores = material.scores
    required_scores: Dict[str, Optional[int]] = {
        "material_recyclability": scores.material_recyclability,
        "reuse_score": scores.reuse_score,
        "environmental_benefit": scores.environmental_benefit,
        "processing_feasibility": scores.processing_feasibility,
    }

    if any(value is None for value in required_scores.values()):
        return {
            "circularity_score": None,
            "circularity_category": CATEGORY_UNAVAILABLE,
            "score_breakdown": {
                "material_recyclability": required_scores["material_recyclability"],
                "material_condition": condition_score,
                "reuse_score": required_scores["reuse_score"],
                "environmental_benefit": required_scores["environmental_benefit"],
                "processing_feasibility": required_scores["processing_feasibility"],
            },
            "status": STATUS_UNAVAILABLE,
        }

    score_breakdown = {
        "material_recyclability": required_scores["material_recyclability"],
        "material_condition": condition_score,
        "reuse_score": required_scores["reuse_score"],
        "environmental_benefit": required_scores["environmental_benefit"],
        "processing_feasibility": required_scores["processing_feasibility"],
    }

    circularity_score = round(
        score_breakdown["material_recyclability"] * WEIGHT_MATERIAL_RECYCLABILITY
        + score_breakdown["material_condition"] * WEIGHT_MATERIAL_CONDITION
        + score_breakdown["reuse_score"] * WEIGHT_REUSE_SCORE
        + score_breakdown["environmental_benefit"] * WEIGHT_ENVIRONMENTAL_BENEFIT
        + score_breakdown["processing_feasibility"] * WEIGHT_PROCESSING_FEASIBILITY,
        2,
    )

    return {
        "circularity_score": circularity_score,
        "circularity_category": _score_to_category(circularity_score),
        "score_breakdown": score_breakdown,
        "status": STATUS_OK,
    }