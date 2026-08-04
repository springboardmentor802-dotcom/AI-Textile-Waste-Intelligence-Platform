from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.waste_upload import WasteUpload
from app.services.model_service import (
    get_fabric_class_metadata,
)
from app.utils.auth_dependency import (
    get_current_user,
)
from services.sustainability_service import (
    estimate_environmental_benefits,
)


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


def _clean_text(
    value: Any,
    default: str,
) -> str:
    """
    Return a cleaned text value or the supplied
    fallback when the value is empty.
    """

    if value is None:
        return default

    cleaned = str(value).strip()

    return cleaned or default


def _clean_number(
    value: Any,
    default: float = 0,
) -> float:
    """
    Convert a value to float safely.
    """

    if value is None:
        return default

    try:
        return float(value)

    except (TypeError, ValueError):
        return default


def _build_fabric_prediction(
    upload: WasteUpload,
) -> dict[str, Any]:
    """
    Build visual fabric classification metadata for
    one stored textile assessment.
    """

    class_id = _clean_text(
        upload.predicted_class,
        "Unknown",
    )

    metadata = (
        get_fabric_class_metadata(
            class_id
        )
        or {}
    )

    category = _clean_text(
        metadata.get("name"),
        f"Fabric Category {class_id}",
    )

    likely_fibres = metadata.get(
        "likely_fibres",
        [],
    )

    if not isinstance(
        likely_fibres,
        list,
    ):
        likely_fibres = []

    return {
        "class": class_id,
        "class_id": class_id,
        "category": category,
        "fabric_name": category,

        "construction": _clean_text(
            metadata.get("construction"),
            "Unknown",
        ),

        "visual_family": _clean_text(
            metadata.get("visual_family"),
            "Unknown",
        ),

        "assigned_material": (
            metadata.get(
                "assigned_material"
            )
        ),

        "likely_fibres": likely_fibres,

        "material_source": (
            metadata.get(
                "material_source",
                "application_class_mapping",
            )
        ),

        "material_verified": bool(
            upload.material_known
        ),

        "mapping_scope": (
            metadata.get(
                "mapping_scope",
                "academic_prototype",
            )
        ),

        "confidence": _clean_number(
            upload.confidence,
            0,
        ),

        "classification_scope": (
            "visual_fabric_category"
        ),
    }


def _build_explanation(
    upload: WasteUpload,
) -> str:
    """
    Build an understandable explanation for the
    selected textile recovery pathway.
    """

    material = _clean_text(
        upload.material,
        "the textile material",
    )

    condition = _clean_text(
        upload.condition,
        "an unassessed condition",
    )

    contamination = _clean_text(
        upload.contamination_status,
        "an unassessed contamination level",
    )

    recommendation = _clean_text(
        upload.final_decision,
        "Manual Review",
    )

    rule_name = _clean_text(
        upload.decision_rule,
        "the circular decision rules",
    )

    return (
        f"{recommendation} was selected for "
        f"{material} based on its {condition} "
        f"condition and {contamination} "
        f"contamination assessment. "
        f"Decision rule: {rule_name}."
    )


def _serialize_recommendation(
    upload: WasteUpload,
) -> dict[str, Any]:
    """
    Convert one WasteUpload database record into the
    complete recommendation response expected by the
    frontend.
    """

    fabric_prediction = (
        _build_fabric_prediction(
            upload
        )
    )

    material = _clean_text(
        upload.material,
        "Unverified",
    )

    material_type = _clean_text(
        upload.material_type,
        "Unknown",
    )

    condition = _clean_text(
        upload.condition,
        "Not Assessed",
    )

    contamination = _clean_text(
        upload.contamination_status,
        "Not Assessed",
    )

    damage_level = _clean_text(
        upload.defect_severity,
        "Unknown",
    )

    defect_status = _clean_text(
        upload.defect_status,
        "Not Assessed",
    )

    recommendation = _clean_text(
        upload.final_decision,
        "Manual Review",
    )

    recovery_path = _clean_text(
        upload.recovery_path,
        recommendation,
    )

    recovery_category = _clean_text(
        upload.recovery_category,
        "Unknown",
    )

    decision_rule = _clean_text(
        upload.decision_rule,
        "No matching rule",
    )

    circularity_level = _clean_text(
        upload.circularity_level,
        "Not Assessed",
    )

    assessment_status = _clean_text(
        upload.assessment_status,
        (
            "Manual Review Required"
            if upload.requires_manual_review
            else "Completed"
        ),
    )

    requires_manual_review = bool(
        upload.requires_manual_review
    )

    material_known = bool(
        upload.material_known
    )

    explanation = _build_explanation(
        upload
    )

    weight_kg = _clean_number(
        upload.weight_kg,
        0,
    )

    sustainability_score = (
        None
        if upload.sustainability_score
        is None
        else _clean_number(
            upload.sustainability_score
        )
    )

    reuse_score = (
        None
        if upload.reuse_score is None
        else _clean_number(
            upload.reuse_score
        )
    )

    recovery_score = (
        None
        if upload.recovery_score is None
        else _clean_number(
            upload.recovery_score
        )
    )

    environmental_benefits = (
        estimate_environmental_benefits(
            weight_kg=weight_kg,
            recovery_category=(
                recovery_category
            ),
        )
    )

    stored_environmental_impact = _clean_text(
        upload.environmental_impact,
        "",
    )

    placeholder_impact_values = {
        "",
        "not available",
        "unknown",
        "not assessed",
        "none",
        "null",
    }

    normalized_stored_impact = (
        stored_environmental_impact
        .strip()
        .lower()
    )

    if (
        normalized_stored_impact
        not in placeholder_impact_values
    ):
        environmental_impact = (
            stored_environmental_impact
        )
    else:
        environmental_impact = (
            environmental_benefits.get(
                "environmental_impact",
                "Not Available",
            )
        )

    material_status = (
        "verified"
        if material_known
        else "application_assigned"
    )

    material_source = (
        "user_verified"
        if material_known
        else "application_class_mapping"
    )

    return {
        "id": upload.upload_id,

        "recommendation_id": (
            upload.upload_id
        ),

        "upload_id": upload.upload_id,

        "created_at": upload.upload_date,

        "material": material,

        "material_name": material,

        "fabric_name": (
            fabric_prediction[
                "fabric_name"
            ]
        ),

        "fabric_category": (
            fabric_prediction[
                "category"
            ]
        ),

        "condition": condition,

        "contamination": contamination,

        "contamination_level": (
            contamination
        ),

        "damage_level": damage_level,

        "recommendation": recommendation,

        "final_decision": recommendation,

        "recommended_action": (
            recommendation
        ),

        "recovery_path": recovery_path,

        "recovery_category": (
            recovery_category
        ),

        "sustainability_score": (
            sustainability_score
        ),

        "reuse_score": reuse_score,

        "recovery_score": recovery_score,

        "circularity_level": (
            circularity_level
        ),

        "assessment_status": (
            assessment_status
        ),

        "requires_manual_review": (
            requires_manual_review
        ),

        "environmental_impact": (
            environmental_impact
        ),

        "co2_saved_kg": (
            environmental_benefits.get(
                "co2_saved_kg",
                0,
            )
        ),

        "water_saved_liters": (
            environmental_benefits.get(
                "water_saved_liters",
                0,
            )
        ),

        "energy_saved_kwh": (
            environmental_benefits.get(
                "energy_saved_kwh",
                0,
            )
        ),

        "landfill_diverted_kg": (
            environmental_benefits.get(
                "landfill_diverted_kg",
                0,
            )
        ),

        "impact_calculation_status": (
            environmental_benefits.get(
                "calculation_status",
                "Unavailable",
            )
        ),

        "impact_is_estimate": (
            environmental_benefits.get(
                "is_estimate",
                True,
            )
        ),

        "impact_calculation_basis": (
            environmental_benefits.get(
                "calculation_basis",
                (
                    "textile_weight_kg × "
                    "recovery_pathway_factor"
                ),
            )
        ),

        "rule_name": decision_rule,

        "decision_priority": (
            upload.decision_priority
        ),

        "weight_kg": weight_kg,

        "image_path": upload.image_path,

        "fabric_prediction": (
            fabric_prediction
        ),

        "material_verification": {
            "material": material,

            "material_type": (
                material_type
            ),

            "material_known": (
                material_known
            ),

            "verified": material_known,

            "status": material_status,

            "source": material_source,
        },

        "condition_analysis": {
            "condition": condition,

            "defect": defect_status,

            "defect_status": (
                defect_status
            ),

            "severity": damage_level,

            "damage_level": (
                damage_level
            ),

            "defect_severity": (
                damage_level
            ),

            "contamination": (
                contamination
            ),

            "contamination_status": (
                contamination
            ),

            "contamination_level": (
                contamination
            ),
        },

        "decision_analysis": {
            "decision": {
                "recommendation": (
                    recommendation
                ),

                "final_decision": (
                    recommendation
                ),

                "recovery_path": (
                    recovery_path
                ),

                "recovery_category": (
                    recovery_category
                ),

                "rule_name": (
                    decision_rule
                ),

                "decision_rule": (
                    decision_rule
                ),

                "priority": (
                    upload.decision_priority
                ),

                "reason": explanation,

                "explanation": (
                    explanation
                ),

                "requires_manual_review": (
                    requires_manual_review
                ),
            },

            "material_data": {
                "material": material,

                "name": material,

                "type": material_type,

                "material_type": (
                    material_type
                ),

                "recycling_method": (
                    _clean_text(
                        upload.recycling_method,
                        recovery_path,
                    )
                ),

                "environmental_impact": (
                    environmental_impact
                ),

                "biodegradable": bool(
                    upload.biodegradable
                ),

                "reusable": bool(
                    upload.reusable
                ),
            },

            "material_known": (
                material_known
            ),

            "material_status": (
                material_status
            ),

            "material_source": (
                material_source
            ),
        },

        "sustainability_analysis": {
            "material": material,

            "material_known": (
                material_known
            ),

            "condition": condition,

            "contamination": (
                contamination
            ),

            "damage_level": (
                damage_level
            ),

            "recommendation": (
                recommendation
            ),

            "recovery_path": (
                recovery_path
            ),

            "recovery_category": (
                recovery_category
            ),

            "sustainability_score": (
                sustainability_score
            ),

            "reuse_score": reuse_score,

            "recovery_score": (
                recovery_score
            ),

            "circularity_level": (
                circularity_level
            ),

            "assessment_status": (
                assessment_status
            ),

            "requires_manual_review": (
                requires_manual_review
            ),

            "weight_kg": weight_kg,

            "co2_saved_kg": (
                environmental_benefits.get(
                    "co2_saved_kg",
                    0,
                )
            ),

            "water_saved_liters": (
                environmental_benefits.get(
                    "water_saved_liters",
                    0,
                )
            ),

            "energy_saved_kwh": (
                environmental_benefits.get(
                    "energy_saved_kwh",
                    0,
                )
            ),

            "landfill_diverted_kg": (
                environmental_benefits.get(
                    "landfill_diverted_kg",
                    0,
                )
            ),

            "environmental_impact": (
                environmental_impact
            ),

            "impact_calculation_status": (
                environmental_benefits.get(
                    "calculation_status",
                    "Unavailable",
                )
            ),

            "impact_is_estimate": (
                environmental_benefits.get(
                    "is_estimate",
                    True,
                )
            ),

            "impact_calculation_basis": (
                environmental_benefits.get(
                    "calculation_basis",
                    (
                        "textile_weight_kg × "
                        "recovery_pathway_factor"
                    ),
                )
            ),
        },

        "stored_assessment": {
            "material": material,

            "material_type": (
                material_type
            ),

            "material_verified": (
                material_known
            ),

            "material_source": (
                material_source
            ),

            "final_decision": (
                recommendation
            ),

            "recovery_path": (
                recovery_path
            ),

            "recovery_category": (
                recovery_category
            ),

            "sustainability_score": (
                sustainability_score
            ),

            "reuse_score": reuse_score,

            "recovery_score": (
                recovery_score
            ),

            "circularity_level": (
                circularity_level
            ),

            "assessment_status": (
                assessment_status
            ),

            "requires_manual_review": (
                requires_manual_review
            ),

            "weight_kg": weight_kg,

            "environmental_impact": (
                environmental_impact
            ),

            "co2_saved_kg": (
                environmental_benefits.get(
                    "co2_saved_kg",
                    0,
                )
            ),

            "water_saved_liters": (
                environmental_benefits.get(
                    "water_saved_liters",
                    0,
                )
            ),

            "energy_saved_kwh": (
                environmental_benefits.get(
                    "energy_saved_kwh",
                    0,
                )
            ),

            "landfill_diverted_kg": (
                environmental_benefits.get(
                    "landfill_diverted_kg",
                    0,
                )
            ),
        },
    }


@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        get_current_user
    ),
):
    """
    Return complete textile recovery recommendations,
    newest first.

    WasteUpload is the source of truth because it
    contains the material, condition, circular
    decision and sustainability assessment.
    """

    try:
        uploads = (
            db.query(WasteUpload)
            .order_by(
                WasteUpload.upload_id.desc()
            )
            .all()
        )

        return [
            _serialize_recommendation(
                upload
            )
            for upload in uploads
        ]

    except Exception as error:
        print(
            "Recommendations API error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load complete "
                "textile recommendations."
            ),
        ) from error