import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from services.knowledge_service import (
    get_material,
    normalize_material_name,
)
from services.normalization_service import (
    normalize_contamination_level,
    normalize_damage_level,
    normalize_lookup_text,
)


BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
RULES_FILE = (
    KNOWLEDGE_DIR
    / "recommendation_rules.json"
)


class RecommendationServiceError(Exception):
    """
    Raised when recommendation rules cannot
    be loaded or evaluated.
    """


@lru_cache(maxsize=1)
def load_rules() -> dict[str, Any]:
    """
    Load and cache recommendation rules.
    """

    if not RULES_FILE.exists():
        raise RecommendationServiceError(
            "Recommendation rules file was "
            f"not found: {RULES_FILE}"
        )

    try:
        with RULES_FILE.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

    except json.JSONDecodeError as error:
        raise RecommendationServiceError(
            "Invalid JSON in recommendation "
            f"rules file: {error}"
        ) from error

    except OSError as error:
        raise RecommendationServiceError(
            "Unable to read recommendation "
            f"rules file: {error}"
        ) from error

    if not isinstance(data, dict):
        raise RecommendationServiceError(
            "recommendation_rules.json must "
            "contain a JSON object."
        )

    if not isinstance(
        data.get("rules"),
        list,
    ):
        raise RecommendationServiceError(
            "recommendation_rules.json must "
            "contain a rules list."
        )

    return data


def _normalize_required_text(
    value: Any,
    field_name: str,
) -> str:
    """
    Normalize and validate required text.
    """

    if value is None:
        raise ValueError(
            f"{field_name} is required."
        )

    normalized_value = normalize_lookup_text(
        value
    )

    if not normalized_value:
        raise ValueError(
            f"{field_name} is required."
        )

    return normalized_value


def _normalize_allowed_value(
    value: Any,
) -> Any:
    """
    Normalize rule values before comparison.
    """

    if isinstance(value, str):
        return normalize_lookup_text(
            value
        )

    return value


def _matches(
    rule_conditions: dict[
        str,
        list[Any],
    ],
    inputs: dict[str, Any],
) -> bool:
    """
    Check whether every condition in a rule
    matches the supplied inputs.
    """

    for (
        field,
        allowed_values,
    ) in rule_conditions.items():
        input_value = inputs.get(field)

        if input_value is None:
            return False

        if not isinstance(
            allowed_values,
            list,
        ):
            return False

        normalized_input = (
            _normalize_allowed_value(
                input_value
            )
        )

        normalized_allowed_values = [
            _normalize_allowed_value(value)
            for value in allowed_values
        ]

        if (
            normalized_input
            not in normalized_allowed_values
        ):
            return False

    return True


def _resolve_recyclability(
    material_data: (
        dict[str, Any]
        | None
    ),
) -> bool | None:
    """
    Resolve recyclability from materials.json.
    """

    if material_data is None:
        return None

    recyclable = material_data.get(
        "recyclable"
    )

    if recyclable is True:
        return True

    if recyclable is False:
        return False

    return None


def get_recommendation(
    material: str,
    condition: str,
    contamination: str,
    damage_level: str,
) -> dict[str, Any]:
    """
    Return the highest-priority matching
    recovery recommendation.
    """

    material_key = normalize_material_name(
        material
    )

    material_data = get_material(
        material_key
    )

    normalized_condition = (
        _normalize_required_text(
            condition,
            "Condition",
        )
    )

    normalized_contamination = (
        normalize_contamination_level(
            contamination,
            default="",
        )
    )

    if not normalized_contamination:
        raise ValueError(
            "Contamination is required."
        )

    normalized_damage = (
        normalize_damage_level(
            damage_level,
            default="",
        )
    )

    if not normalized_damage:
        raise ValueError(
            "Damage level is required."
        )

    inputs = {
        "material": material_key,
        "condition": normalized_condition,
        "contamination": (
            normalized_contamination
        ),
        "damage_level": (
            normalized_damage
        ),
        "recyclable": (
            _resolve_recyclability(
                material_data
            )
        ),
    }

    rules_data = load_rules()

    sorted_rules = sorted(
        rules_data["rules"],
        key=lambda rule: rule.get(
            "priority",
            0,
        ),
        reverse=True,
    )

    for rule in sorted_rules:
        conditions = rule.get(
            "conditions",
            {},
        )

        if not isinstance(
            conditions,
            dict,
        ):
            continue

        if _matches(
            conditions,
            inputs,
        ):
            return {
                "rule_id": rule.get(
                    "rule_id"
                ),
                "rule_name": rule.get(
                    "name"
                ),
                "priority": rule.get(
                    "priority"
                ),
                "recommendation": rule.get(
                    "recommendation"
                ),
                "recovery_category": (
                    rule.get(
                        "recovery_category"
                    )
                ),
                "reason": rule.get(
                    "reason"
                ),
                "requires_manual_review": (
                    rule.get(
                        "requires_manual_review",
                        False,
                    )
                ),
                "material_known": (
                    material_data is not None
                ),
                "material_data": (
                    material_data
                ),
                "matched_inputs": inputs,
            }

    return {
        "rule_id": None,
        "rule_name": None,
        "priority": None,
        "recommendation": (
            rules_data.get(
                "metadata",
                {},
            ).get(
                "default_recommendation",
                "Manual Review",
            )
        ),
        "recovery_category": "Unknown",
        "reason": (
            "No recommendation rule matched "
            "the supplied textile material "
            "and condition data."
        ),
        "requires_manual_review": True,
        "material_known": (
            material_data is not None
        ),
        "material_data": material_data,
        "matched_inputs": inputs,
    }


def clear_rules_cache() -> None:
    """
    Clear the cached recommendation rules.
    """

    load_rules.cache_clear()