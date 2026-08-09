
from typing import Any, Dict

from knowledge_base.schemas import MaterialKnowledge

STATUS_OK = "ok"
STATUS_UNAVAILABLE = "unavailable_insufficient_data"


def _has_complete_recovery_data(material: MaterialKnowledge) -> bool:
    """Check whether a material has every value needed to compute impact.

    The "Unclassified" fabric class (and any future material entry with
    incomplete data) deliberately carries null recovery metrics and a
    null environmental_benefit score in the knowledge base, since
    guessing environmental savings for an unidentified material would be
    misleading. This helper is the single place that defines what
    "complete" means, so both the happy path and the fallback path stay
    in sync if the knowledge base schema ever changes.

    Args:
        material: The MaterialKnowledge entry to check.

    Returns:
        True if all four recovery metrics and the environmental_benefit
        score are present (not None), False otherwise.
    """
    rm = material.recovery_metrics
    required_values = (
        rm.estimated_co2_saved_kg,
        rm.estimated_water_saved_liters,
        rm.estimated_energy_saved_mj,
        rm.estimated_landfill_diversion_kg,
        material.scores.environmental_benefit,
    )
    return all(value is not None for value in required_values)


def calculate_environmental_impact(
    material: MaterialKnowledge,
    weight_kg: float = 1.0,
) -> Dict[str, Any]:
    """Calculate estimated environmental savings for a recovered item.

    The Material Knowledge Base stores recovery metrics on a per-kilogram
    basis. This function scales those per-kg figures by the actual
    (or assumed) weight of the item being processed, so a real garment
    weight from your inventory/batch data can be passed in later without
    any change to this function's contract.

    Args:
        material: The MaterialKnowledge entry for the predicted fabric
            class (e.g. the result of `get_material("Cotton")`).
        weight_kg: The estimated weight, in kilograms, of the item being
            assessed. Defaults to 1.0, which reproduces the knowledge
            base's raw per-kg reference figures unchanged - useful when
            no real item weight is available yet.

    Returns:
        A dictionary with the following keys:
            - estimated_co2_saved_kg (Optional[float])
            - estimated_water_saved_liters (Optional[float])
            - estimated_energy_saved_mj (Optional[float])
            - estimated_landfill_diversion_kg (Optional[float])
            - environmental_score (Optional[int]): 0-100, straight from
              the knowledge base's environmental_benefit score.
            - status (str): STATUS_OK or STATUS_UNAVAILABLE.

        All numeric fields are None, and status is STATUS_UNAVAILABLE,
        when the material's recovery metrics are incomplete (this is the
        expected behavior for the "Unclassified" fabric class).

    Raises:
        ValueError: If weight_kg is not a positive number.
    """
    if weight_kg <= 0:
        raise ValueError(f"weight_kg must be a positive number, got {weight_kg!r}")

    if not _has_complete_recovery_data(material):
        return {
            "estimated_co2_saved_kg": None,
            "estimated_water_saved_liters": None,
            "estimated_energy_saved_mj": None,
            "estimated_landfill_diversion_kg": None,
            "environmental_score": None,
            "status": STATUS_UNAVAILABLE,
        }

    rm = material.recovery_metrics

    return {
        "estimated_co2_saved_kg": round(rm.estimated_co2_saved_kg * weight_kg, 3),
        "estimated_water_saved_liters": round(rm.estimated_water_saved_liters * weight_kg, 2),
        "estimated_energy_saved_mj": round(rm.estimated_energy_saved_mj * weight_kg, 2),
        "estimated_landfill_diversion_kg": round(rm.estimated_landfill_diversion_kg * weight_kg, 3),
        "environmental_score": material.scores.environmental_benefit,
        "status": STATUS_OK,
    }