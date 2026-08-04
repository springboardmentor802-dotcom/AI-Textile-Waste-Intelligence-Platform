from typing import Any

from services.decision_service import (
    make_textile_decision,
)
from services.normalization_service import (
    normalize_contamination_level,
    normalize_damage_level,
    normalize_lookup_text,
)


CONDITION_SCORES = {
    "excellent": 100,
    "good": 85,
    "fair": 65,
    "average": 65,
    "poor": 40,
}

CONTAMINATION_PENALTIES = {
    "none": 0,
    "low": 10,
    "medium": 25,
    "high": 45,
    "hazardous": 70,
}

DAMAGE_PENALTIES = {
    "none": 0,
    "minor": 10,
    "moderate": 25,
    "severe": 45,
}

REUSE_POTENTIAL_SCORES = {
    "high": 90,
    "medium": 65,
    "low": 35,
}

RECOVERY_CATEGORY_SCORES = {
    "reuse": 95,
    "repair": 85,
    "upcycling": 80,
    "recycling": 75,
    "specialized_recycling": 65,
    "fiber_recovery": 60,
    "specialized_disposal": 20,
    "disposal": 10,
    "unknown": 30,
}


# Estimated environmental benefits per kilogram.
#
# These are academic prototype factors used to
# demonstrate comparative circularity benefits.
# They are not life-cycle-assessment-certified values.
RECOVERY_IMPACT_FACTORS = {
    "reuse": {
        "co2_saved_kg": 12.0,
        "water_saved_liters": 2500.0,
        "energy_saved_kwh": 20.0,
        "landfill_diversion_rate": 0.98,
        "impact_level": "Very High Positive Impact",
    },

    "repair": {
        "co2_saved_kg": 8.0,
        "water_saved_liters": 1500.0,
        "energy_saved_kwh": 12.0,
        "landfill_diversion_rate": 0.95,
        "impact_level": "High Positive Impact",
    },

    "upcycling": {
        "co2_saved_kg": 6.0,
        "water_saved_liters": 1000.0,
        "energy_saved_kwh": 8.0,
        "landfill_diversion_rate": 0.90,
        "impact_level": "High Positive Impact",
    },

    "recycling": {
        "co2_saved_kg": 4.0,
        "water_saved_liters": 500.0,
        "energy_saved_kwh": 6.0,
        "landfill_diversion_rate": 0.85,
        "impact_level": "Moderate Positive Impact",
    },

    "specialized_recycling": {
        "co2_saved_kg": 3.0,
        "water_saved_liters": 350.0,
        "energy_saved_kwh": 5.0,
        "landfill_diversion_rate": 0.75,
        "impact_level": "Moderate Positive Impact",
    },

    "fiber_recovery": {
        "co2_saved_kg": 2.5,
        "water_saved_liters": 300.0,
        "energy_saved_kwh": 4.0,
        "landfill_diversion_rate": 0.80,
        "impact_level": "Moderate Positive Impact",
    },

    "specialized_disposal": {
        "co2_saved_kg": 0.5,
        "water_saved_liters": 50.0,
        "energy_saved_kwh": 1.0,
        "landfill_diversion_rate": 0.30,
        "impact_level": "Limited Positive Impact",
    },

    "disposal": {
        "co2_saved_kg": 0.0,
        "water_saved_liters": 0.0,
        "energy_saved_kwh": 0.0,
        "landfill_diversion_rate": 0.0,
        "impact_level": "Low Circular Impact",
    },

    "unknown": {
        "co2_saved_kg": 0.0,
        "water_saved_liters": 0.0,
        "energy_saved_kwh": 0.0,
        "landfill_diversion_rate": 0.0,
        "impact_level": "Impact Not Assessed",
    },
}


def _clamp(
    score: float,
) -> int:
    """
    Keep a numeric score between 0 and 100.
    """

    return max(
        0,
        min(
            100,
            round(score),
        ),
    )


def _safe_float(
    value: Any,
    default: float = 0.0,
) -> float:
    """
    Convert a value to a safe non-negative float.
    """

    try:
        parsed = float(value)

        return max(0.0, parsed)

    except (TypeError, ValueError):
        return default


def _get_circularity_level(
    score: int,
) -> str:
    """
    Convert a sustainability score into a
    circularity level.
    """

    if score >= 80:
        return "High"

    if score >= 55:
        return "Medium"

    return "Low"


def estimate_environmental_benefits(
    weight_kg: float,
    recovery_category: str,
) -> dict[str, Any]:
    """
    Estimate environmental benefits for a textile
    recovery pathway.

    Formula:

        estimated benefit =
            textile weight × pathway impact factor

    These values are intended for an academic
    prototype and comparative analytics.
    """

    normalized_weight = _safe_float(
        weight_kg,
        default=0.0,
    )

    normalized_category = (
        normalize_lookup_text(
            recovery_category,
            default="unknown",
        )
    )

    factors = RECOVERY_IMPACT_FACTORS.get(
        normalized_category,
        RECOVERY_IMPACT_FACTORS["unknown"],
    )

    co2_saved = (
        normalized_weight
        * factors["co2_saved_kg"]
    )

    water_saved = (
        normalized_weight
        * factors["water_saved_liters"]
    )

    energy_saved = (
        normalized_weight
        * factors["energy_saved_kwh"]
    )

    landfill_diverted = (
        normalized_weight
        * factors["landfill_diversion_rate"]
    )

    has_weight = normalized_weight > 0

    return {
        "weight_kg": round(
            normalized_weight,
            3,
        ),

        "recovery_category": (
            normalized_category
        ),

        "co2_saved_kg": round(
            co2_saved,
            2,
        ),

        "water_saved_liters": round(
            water_saved,
            2,
        ),

        "energy_saved_kwh": round(
            energy_saved,
            2,
        ),

        "landfill_diverted_kg": round(
            landfill_diverted,
            2,
        ),

        "environmental_impact": (
            factors["impact_level"]
            if has_weight
            else "Weight Required for Estimation"
        ),

        "calculation_status": (
            "Estimated"
            if has_weight
            else "Unavailable"
        ),

        "is_estimate": True,

        "calculation_basis": (
            "textile_weight_kg × "
            "recovery_pathway_factor"
        ),
    }


def calculate_sustainability(
    material: str,
    condition: str,
    contamination: str,
    damage_level: str,
    weight_kg: float = 0,
) -> dict[str, Any]:
    """
    Calculate an explainable sustainability
    assessment.

    The assessment considers:
    - material reuse potential
    - textile condition
    - contamination level
    - damage level
    - recommended recovery category
    - manual-review requirement
    - estimated environmental recovery benefits

    This is a deterministic rule-based calculation,
    not a machine-learning prediction.
    """

    normalized_condition = (
        normalize_lookup_text(
            condition,
            default="unknown",
        )
    )

    # Treat Average as equivalent to Fair.
    if normalized_condition == "average":
        normalized_condition = "fair"

    normalized_contamination = (
        normalize_contamination_level(
            contamination,
            default="unknown",
        )
    )

    normalized_damage = (
        normalize_damage_level(
            damage_level,
            default="unknown",
        )
    )

    decision_result = make_textile_decision(
        material=material,
        condition=normalized_condition,
        contamination=normalized_contamination,
        damage_level=normalized_damage,
    )

    material_data = (
        decision_result.get(
            "material_data"
        )
        or {}
    )

    decision = (
        decision_result.get("decision")
        or {}
    )

    material_known = bool(
        decision_result.get(
            "material_known"
        )
    )

    requires_manual_review = bool(
        decision.get(
            "requires_manual_review"
        )
    )

    recovery_category = (
        normalize_lookup_text(
            decision.get(
                "recovery_category",
                "unknown",
            ),
            default="unknown",
        )
    )

    environmental_benefits = (
        estimate_environmental_benefits(
            weight_kg=weight_kg,
            recovery_category=recovery_category,
        )
    )

    # Unknown materials must not receive an
    # artificial sustainability score.
    if not material_known:
        return {
            "material": material,

            "material_known": False,

            "condition": (
                normalized_condition
            ),

            "contamination": (
                normalized_contamination
            ),

            "damage_level": (
                normalized_damage
            ),

            "recommendation": (
                decision.get(
                    "recommendation"
                )
            ),

            "recovery_path": (
                decision.get(
                    "recommendation"
                )
            ),

            "recovery_category": (
                decision.get(
                    "recovery_category"
                )
            ),

            "sustainability_score": None,

            "reuse_score": None,

            "recovery_score": None,

            "circularity_level": (
                "Insufficient Data"
            ),

            "assessment_status": (
                "Manual Review Required"
            ),

            "requires_manual_review": True,

            **environmental_benefits,

            "explanation": {
                "message": (
                    "Sustainability scoring was not "
                    "performed because the textile "
                    "material is unknown."
                )
            },

            "decision": decision,
        }

    reuse_potential = (
        normalize_lookup_text(
            material_data.get(
                "reuse_potential",
                "low",
            ),
            default="low",
        )
    )

    condition_score = (
        CONDITION_SCORES.get(
            normalized_condition,
            50,
        )
    )

    contamination_penalty = (
        CONTAMINATION_PENALTIES.get(
            normalized_contamination,
            20,
        )
    )

    damage_penalty = (
        DAMAGE_PENALTIES.get(
            normalized_damage,
            20,
        )
    )

    reuse_score = (
        REUSE_POTENTIAL_SCORES.get(
            reuse_potential,
            40,
        )
    )

    recovery_score = (
        RECOVERY_CATEGORY_SCORES.get(
            recovery_category,
            50,
        )
    )

    base_score = (
        condition_score * 0.30
        + reuse_score * 0.25
        + recovery_score * 0.45
    )

    # Condition and damage overlap, so damage uses
    # a reduced penalty weight.
    weighted_damage_penalty = (
        damage_penalty * 0.40
    )

    manual_review_penalty = (
        10
        if requires_manual_review
        else 0
    )

    sustainability_score = (
        base_score
        - contamination_penalty
        - weighted_damage_penalty
        - manual_review_penalty
    )

    final_score = _clamp(
        sustainability_score
    )

    return {
        "material": material_data.get(
            "display_name",
            material,
        ),

        "material_known": True,

        "condition": (
            normalized_condition
        ),

        "contamination": (
            normalized_contamination
        ),

        "damage_level": (
            normalized_damage
        ),

        "recommendation": (
            decision.get(
                "recommendation"
            )
        ),

        "recovery_path": (
            decision.get(
                "recommendation"
            )
        ),

        "recovery_category": (
            decision.get(
                "recovery_category"
            )
        ),

        "sustainability_score": (
            final_score
        ),

        "reuse_score": _clamp(
            reuse_score
        ),

        "recovery_score": _clamp(
            recovery_score
        ),

        "circularity_level": (
            _get_circularity_level(
                final_score
            )
        ),

        "assessment_status": (
            "Manual Review Required"
            if requires_manual_review
            else "Completed"
        ),

        "requires_manual_review": (
            requires_manual_review
        ),

        **environmental_benefits,

        "explanation": {
            "base_score": round(
                base_score,
                2,
            ),

            "condition_score": (
                condition_score
            ),

            "reuse_potential_score": (
                reuse_score
            ),

            "recovery_category_score": (
                recovery_score
            ),

            "contamination_penalty": (
                contamination_penalty
            ),

            "original_damage_penalty": (
                damage_penalty
            ),

            "weighted_damage_penalty": round(
                weighted_damage_penalty,
                2,
            ),

            "manual_review_penalty": (
                manual_review_penalty
            ),

            "formula": (
                "base_score - "
                "contamination_penalty - "
                "weighted_damage_penalty - "
                "manual_review_penalty"
            ),

            "environmental_formula": (
                "textile_weight_kg × "
                "recovery_pathway_factor"
            ),
        },

        "decision": decision,
    }