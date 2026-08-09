
from typing import Any, Dict

from knowledge_base.schemas import MaterialKnowledge

from .environmental_engine import calculate_environmental_impact
from .recommendation_engine import generate_recommendations
from .waste_scoring_engine import DEFAULT_CONDITION_SCORE, calculate_circularity_score


def _build_material_information(material: MaterialKnowledge) -> Dict[str, Any]:
    """Extract the frontend-facing material summary fields.

    This is a plain field selection, not a calculation - it exists so
    the orchestrator's output is self-contained (the frontend doesn't
    need a second call back to the knowledge base just to show what
    material was detected).

    Args:
        material: The MaterialKnowledge entry being reported on.

    Returns:
        A dictionary of descriptive (non-numeric) material fields.
    """
    return {
        "fabric_class": material.fabric_class,
        "material_type": material.material_type,
        "material_description": material.material_description,
        "common_uses": material.common_uses,
        "sustainability_notes": material.sustainability_notes,
        "notes": material.notes,
    }


def _build_overall_summary(
    material: MaterialKnowledge,
    waste_scoring: Dict[str, Any],
) -> str:
    """Compose a one-line, human-readable sustainability summary.

    This is string formatting only - it reuses the category and score
    already computed by `calculate_circularity_score()` rather than
    recomputing anything.

    Args:
        material: The MaterialKnowledge entry being reported on.
        waste_scoring: The dict already returned by
            `calculate_circularity_score()` for this material.

    Returns:
        A short summary string suitable for display near the top of the
        Sustainability Dashboard / Prediction page result.
    """
    if waste_scoring["status"] != "ok":
        return (
            f"{material.fabric_class} could not be scored automatically - "
            "manual review required."
        )

    return (
        f"{material.fabric_class} ({material.material_type}) shows "
        f"{waste_scoring['circularity_category']} with a circularity "
        f"score of {waste_scoring['circularity_score']}/100."
    )


def generate_sustainability_report(
    material: MaterialKnowledge,
    weight_kg: float = 1.0,
    condition_score: float = DEFAULT_CONDITION_SCORE,
) -> Dict[str, Any]:
    """Generate the full Milestone 3 sustainability report for a material.

    Orchestrates, in order:
        1. `calculate_environmental_impact()` - CO2/water/energy/landfill
           savings estimates.
        2. `generate_recommendations()` - recycling/recovery guidance.
        3. `calculate_circularity_score()` - the weighted Circularity
           Score and category.

    Args:
        material: The MaterialKnowledge entry for the predicted fabric
            class (e.g. the result of `get_material("Cotton")`).
        weight_kg: Estimated item weight in kilograms, forwarded to the
            Environmental Impact Engine. Defaults to 1.0.
        condition_score: The item's physical condition score (0-100),
            forwarded to the Waste Scoring Engine. Defaults to the
            engine's placeholder value (80.0) until defect-severity
            mapping is implemented.

    Returns:
        A dictionary with the following keys:
            - material_information (Dict[str, Any])
            - environmental_impact (Dict[str, Any]): see
              `environmental_engine.calculate_environmental_impact`.
            - recommendations (Dict[str, Any]): see
              `recommendation_engine.generate_recommendations`.
            - waste_scoring (Dict[str, Any]): see
              `waste_scoring_engine.calculate_circularity_score`.
            - overall_sustainability (str): a one-line human-readable
              summary of the waste_scoring result.
    """
    environmental_impact = calculate_environmental_impact(material, weight_kg=weight_kg)
    recommendations = generate_recommendations(material)
    waste_scoring = calculate_circularity_score(material, condition_score=condition_score)

    return {
        "material_information": _build_material_information(material),
        "environmental_impact": environmental_impact,
        "recommendations": recommendations,
        "waste_scoring": waste_scoring,
        "overall_sustainability": _build_overall_summary(material, waste_scoring),
    }