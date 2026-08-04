from typing import Any

from services.normalization_service import (
    normalize_contamination_level,
    normalize_damage_level,
    normalize_lookup_text,
)
from services.recommendation_service import (
    get_recommendation,
)


def make_textile_decision(
    material: str,
    condition: str,
    contamination: str,
    damage_level: str,
) -> dict[str, Any]:
    """
    Create the final explainable recovery decision
    for a textile item.

    This service acts as the orchestration layer
    between:
    - material classification
    - condition analysis
    - recommendation engine
    - sustainability intelligence
    """

    normalized_condition = normalize_lookup_text(
        condition,
        default="unknown",
    )

    normalized_contamination = (
        normalize_contamination_level(
            contamination,
            default="unknown",
        )
    )

    normalized_damage_level = (
        normalize_damage_level(
            damage_level,
            default="unknown",
        )
    )

    recommendation_result = get_recommendation(
        material=material,
        condition=normalized_condition,
        contamination=normalized_contamination,
        damage_level=normalized_damage_level,
    )

    return {
        "material": material,
        "condition": normalized_condition,
        "contamination": normalized_contamination,
        "damage_level": normalized_damage_level,
        "decision": {
            "rule_id": recommendation_result.get(
                "rule_id"
            ),
            "rule_name": recommendation_result.get(
                "rule_name"
            ),
            "priority": recommendation_result.get(
                "priority"
            ),
            "recommendation": recommendation_result.get(
                "recommendation"
            ),
            "recovery_category": recommendation_result.get(
                "recovery_category"
            ),
            "reason": recommendation_result.get(
                "reason"
            ),
            "requires_manual_review": (
                recommendation_result.get(
                    "requires_manual_review"
                )
            ),
        },
        "material_known": recommendation_result.get(
            "material_known"
        ),
        "material_data": recommendation_result.get(
            "material_data"
        ),
        "matched_inputs": recommendation_result.get(
            "matched_inputs"
        ),
    }