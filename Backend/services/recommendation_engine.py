
from typing import Any, Dict, List, Optional

from knowledge_base.schemas import MaterialKnowledge, RecommendedAction

STATUS_OK = "ok"
STATUS_UNCLASSIFIED = "unclassified_manual_review_required"

_ACTION_PRIORITY: Dict[str, int] = {
    "Donation": 1,
    "Fabric Reuse": 2,
    "Upcycling": 3,
    "Fiber Recycling": 4,
    "Mechanical Recycling": 5,
    "Chemical Recycling": 6,
    "Industrial Recovery": 7,
}


def get_primary_recommendation(material: MaterialKnowledge) -> Optional[str]:
    """Select the single best recycling/recovery action for a material.

    "Best" is defined by the waste-management hierarchy: direct reuse
    and donation are preferred over recycling, which is preferred over
    industrial recovery. This keeps the "best recommendation" logic in
    one place, testable independently of the rest of the recommendation
    payload.

    Args:
        material: The MaterialKnowledge entry to select a recommendation for.

    Returns:
        The highest-priority action from `material.recommended_actions`,
        or None if the list is empty (this is the expected behavior for
        the "Unclassified" fabric class).
    """
    actions: List[RecommendedAction] = material.recommended_actions
    if not actions:
        return None
    return min(actions, key=lambda action: _ACTION_PRIORITY.get(action, 99))


def generate_recommendations(material: MaterialKnowledge) -> Dict[str, Any]:
    """Build the full recycling/recovery recommendation payload.

    This function performs no calculations - it only selects and
    reformats values that were already curated on the Material Knowledge
    Base. Any numeric scoring belongs in `waste_scoring_engine.py`.

    Args:
        material: The MaterialKnowledge entry for the predicted fabric
            class (e.g. the result of `get_material("Cotton")`).

    Returns:
        A dictionary with the following keys:
            - recommended_actions (List[str]): all recovery actions
              curated for this material, in knowledge-base order.
            - primary_method (Optional[str]): the single best action, or
              None if unavailable.
            - reuse_potential (str): "low" | "medium" | "high" | "unknown".
            - waste_category (str): the material's end-of-life category.
            - status (str): STATUS_OK or STATUS_UNCLASSIFIED.
    """
    primary_method = get_primary_recommendation(material)
    status = STATUS_OK if material.recommended_actions else STATUS_UNCLASSIFIED

    return {
        "recommended_actions": material.recommended_actions,
        "primary_method": primary_method,
        "reuse_potential": material.reuse_potential,
        "waste_category": material.waste_category,
        "status": status,
    }