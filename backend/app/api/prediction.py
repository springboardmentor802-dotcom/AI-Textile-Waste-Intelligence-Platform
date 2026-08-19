from pathlib import Path
import shutil
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from services.normalization_service import (
    normalize_damage_level,
)
from PIL import (
    Image,
    UnidentifiedImageError,
)
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.utils.auth_dependency import get_current_user

from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation

from app.services.model_service import (
    get_fabric_class_metadata,
    predict_image,
)
from app.services.condition_service import analyze_condition

from app.services.notification_service import (
    create_analysis_notifications,
)

from services.decision_service import make_textile_decision
from services.sustainability_service import (
    calculate_sustainability,
)


# ==========================================================
# ROUTER CONFIGURATION
# ==========================================================

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


# ==========================================================
# UPLOAD DIRECTORY
# ==========================================================

UPLOAD_DIR = Path("temp_uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

MAX_UPLOAD_SIZE_BYTES = (
    10 * 1024 * 1024
)


# ==========================================================
# SUPPORTED MATERIALS
# ==========================================================

SUPPORTED_MATERIALS = {
    "cotton": "Cotton",
    "polyester": "Polyester",
    "denim": "Denim",
    "silk": "Silk",
    "wool": "Wool",
    "linen": "Linen",
    "nylon": "Nylon",
    "viscose": "Viscose",
    "rayon": "Rayon",
    "acrylic": "Acrylic",
    "hemp": "Hemp",
    "jute": "Jute",
    "mixed fabric": "Mixed Fabric",
    "mixed": "Mixed Fabric",
    "blend": "Mixed Fabric",
}


# ==========================================================
# REQUEST MODELS
# ==========================================================

class MaterialConfirmationRequest(BaseModel):
    material: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description=(
            "User-confirmed textile material, "
            "such as cotton or polyester."
        ),
    )


# ==========================================================
# HELPER FUNCTIONS
# ==========================================================

def get_nested_value(
    data,
    *keys,
    default=None,
):
    """
    Safely return the first available value
    from a dictionary.
    """

    if not isinstance(data, dict):
        return default

    for key in keys:
        value = data.get(key)

        if value is not None:
            return value

    return default


def normalize_boolean(
    value,
    default=False,
):
    """
    Convert common truthy and falsy values
    into a Python boolean.
    """

    if isinstance(value, bool):
        return value

    if value is None:
        return default

    if isinstance(value, (int, float)):
        return bool(value)

    normalized = str(value).strip().lower()

    if normalized in {
        "true",
        "yes",
        "1",
        "y",
    }:
        return True

    if normalized in {
        "false",
        "no",
        "0",
        "n",
    }:
        return False

    return default


def normalize_reusable(
    value,
    default=False,
):
    """
    Convert reusable flags and reuse-potential
    levels into one database boolean.
    """

    if isinstance(value, bool):
        return value

    if value is None:
        return default

    if isinstance(value, (int, float)):
        return bool(value)

    normalized = (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    if normalized in {
        "true",
        "yes",
        "1",
        "y",
        "high",
        "medium",
        "reusable",
    }:
        return True

    if normalized in {
        "false",
        "no",
        "0",
        "n",
        "low",
        "none",
        "not_reusable",
    }:
        return False

    return default


def normalize_number(
    value,
    default=None,
):
    """
    Convert a value into a float when possible.
    """

    if value is None:
        return default

    try:
        return float(value)

    except (TypeError, ValueError):
        return default


def normalize_integer(
    value,
    default=None,
):
    """
    Convert a value into an integer when possible.
    """

    if value is None:
        return default

    try:
        return int(value)

    except (TypeError, ValueError):
        return default


def normalize_text(
    value,
    default="Unknown",
):
    """
    Return a cleaned text value.
    """

    if value is None:
        return default

    cleaned_value = str(value).strip()

    if not cleaned_value:
        return default

    return cleaned_value


def normalize_material(
    material,
):
    """
    Validate and normalize a user-confirmed
    material name.
    """

    if material is None:
        return None

    normalized_key = (
        str(material)
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
    )

    normalized_key = " ".join(
        normalized_key.split()
    )

    return SUPPORTED_MATERIALS.get(
        normalized_key
    )


def validate_upload_size(
    file: UploadFile,
) -> None:
    """
    Reject uploads larger than 10 MB before
    creating an application temporary file or
    running image analysis.
    """

    original_position = file.file.tell()

    try:
        file.file.seek(
            0,
            2,
        )

        file_size = file.file.tell()

    finally:
        file.file.seek(
            original_position
        )

    if file_size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                "Uploaded image exceeds the maximum "
                "allowed size of 10 MB."
            ),
        )


def validate_uploaded_image(
    file_path: Path,
) -> None:
    """
    Verify that an uploaded file is a real,
    readable image.

    Extension and MIME validation alone are not
    sufficient because a non-image file can be
    renamed with an image extension.
    """

    try:
        with Image.open(file_path) as image:
            image.verify()

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ) as error:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded file is corrupted "
                "or is not a valid image."
            ),
        ) from error


def delete_failed_upload(
    file_path: Path | None,
) -> None:
    """
    Remove a temporary file when analysis fails.
    """

    if (
        file_path is not None
        and file_path.exists()
        and file_path.is_file()
    ):
        try:
            file_path.unlink()

        except OSError:
            pass


def build_fabric_category(
    predicted_class,
):
    """
    Return the readable visual category for a
    CNN class while preserving a safe fallback.
    """

    class_id = normalize_text(
        predicted_class,
        default="Unknown",
    )

    metadata = get_fabric_class_metadata(
        class_id
    )

    return normalize_text(
        metadata.get("name"),
        default=f"Fabric Category {class_id}",
    )


def build_fabric_prediction(
    predicted_class,
    confidence,
):
    """
    Build one consistent, explainable CNN
    prediction response for every endpoint.

    The category and construction describe
    visible fabric appearance. They do not
    verify fibre composition.
    """

    class_id = normalize_text(
        predicted_class,
        default="Unknown",
    )

    metadata = get_fabric_class_metadata(
        class_id
    )

    category = normalize_text(
        metadata.get("name"),
        default=f"Fabric Category {class_id}",
    )

    construction = normalize_text(
        metadata.get("construction"),
        default="Unknown",
    )

    visual_family = normalize_text(
        metadata.get("visual_family"),
        default="Unknown",
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
        "construction": construction,
        "visual_family": visual_family,
        "assigned_material": (
            metadata.get(
                "assigned_material"
            )
        ),
        "likely_fibres": (
            likely_fibres
        ),
        "material_source": (
            metadata.get(
                "material_source",
                "application_class_mapping",
            )
        ),
        "material_verified": False,
        "mapping_scope": (
            metadata.get(
                "mapping_scope",
                "academic_prototype",
            )
        ),
        "confidence": normalize_number(
            confidence,
            default=0,
        ),
        "classification_scope": (
            "visual_fabric_category"
        ),
    }


def normalize_condition_output(
    condition_result,
):
    """
    Convert condition service output into one
    consistent structure.
    """

    if not isinstance(
        condition_result,
        dict,
    ):
        condition_result = {}

    condition = normalize_text(
        get_nested_value(
            condition_result,
            "condition",
            default="Unknown",
        ),
        default="Unknown",
    )

    contamination = normalize_text(
        get_nested_value(
            condition_result,
            "contamination",
            "contamination_status",
            default="Not Assessed",
        ),
        default="Not Assessed",
    )

    severity = normalize_text(
        get_nested_value(
            condition_result,
            "severity",
            "damage_level",
            "defect_severity",
            default="Unknown",
        ),
        default="Unknown",
    )

    defect = normalize_text(
        get_nested_value(
            condition_result,
            "defect",
            "defect_status",
            default="Not Detected",
        ),
        default="Not Detected",
    )

    affected_area = normalize_number(
        get_nested_value(
            condition_result,
            "affected_area",
            "affectedArea",
            "affected_percentage",
            default=0,
        ),
        default=0,
    )

    visualization = get_nested_value(
        condition_result,
        "visualization",
        "visualization_path",
        "result_image",
        default=None,
    )

    return {
        "condition": condition,
        "defect": defect,
        "severity": severity,
        "contamination": contamination,
        "affected_area": affected_area,
        "visualization": visualization,
    }


def normalize_decision_output(
    decision,
    verified_material,
):
    """
    Normalize the decision engine response.
    """

    if not isinstance(
        decision,
        dict,
    ):
        decision = {}

    decision_data = get_nested_value(
        decision,
        "decision",
        default=decision,
    )

    if not isinstance(
        decision_data,
        dict,
    ):
        decision_data = {}

    material_data = get_nested_value(
        decision,
        "material_data",
        default={},
    )

    if not isinstance(
        material_data,
        dict,
    ):
        material_data = {}

    recommendation = normalize_text(
        get_nested_value(
            decision_data,
            "recommendation",
            "final_decision",
            "decision",
            default="Manual Review",
        ),
        default="Manual Review",
    )

    recovery_path = normalize_text(
        get_nested_value(
            decision_data,
            "recovery_path",
            "path",
            default=recommendation,
        ),
        default=recommendation,
    )

    recovery_category = normalize_text(
        get_nested_value(
            decision_data,
            "recovery_category",
            "category",
            default="Manual Review",
        ),
        default="Manual Review",
    )

    rule_name = normalize_text(
        get_nested_value(
            decision_data,
            "rule_name",
            "name",
            "decision_rule",
            default="No matching rule",
        ),
        default="No matching rule",
    )

    priority = normalize_integer(
        get_nested_value(
            decision_data,
            "priority",
            "decision_priority",
            default=None,
        ),
        default=None,
    )

    reason = normalize_text(
        get_nested_value(
            decision_data,
            "reason",
            "explanation",
            default=(
                "Recommendation generated using "
                "the confirmed material and "
                "condition assessment."
            ),
        ),
        default=(
            "Recommendation generated using "
            "the confirmed material and "
            "condition assessment."
        ),
    )

    material_name = normalize_text(
        get_nested_value(
            material_data,
            "material",
            "name",
            default=verified_material,
        ),
        default=verified_material,
    )

    material_type = normalize_text(
        get_nested_value(
            material_data,
            "type",
            "material_type",
            "category",
            default="Verified Textile Material",
        ),
        default="Verified Textile Material",
    )

    environmental_impact = normalize_text(
        get_nested_value(
            material_data,
            "environmental_impact",
            "impact",
            default="Not Available",
        ),
        default="Not Available",
    )

    biodegradable = normalize_boolean(
        get_nested_value(
            material_data,
            "biodegradable",
            default=False,
        ),
        default=False,
    )

    reusable = normalize_reusable(
        get_nested_value(
            material_data,
            "reusable",
            "reuse_potential",
            default=False,
        ),
        default=False,
    )

    requires_manual_review = normalize_boolean(
        get_nested_value(
            decision_data,
            "requires_manual_review",
            default=False,
        ),
        default=False,
    )

    return {
        "decision": {
            "recommendation": recommendation,
            "final_decision": recommendation,
            "recovery_path": recovery_path,
            "recovery_category": recovery_category,
            "rule_name": rule_name,
            "priority": priority,
            "reason": reason,
            "requires_manual_review": (
                requires_manual_review
            ),
        },
        "material_data": {
            "material": material_name,
            "type": material_type,
            "environmental_impact": (
                environmental_impact
            ),
            "biodegradable": biodegradable,
            "reusable": reusable,
        },
        "material_known": True,
        "material_status": "verified",
        "material_source": "user_verified",
    }


def normalize_sustainability_output(
    sustainability,
):
    """
    Normalize sustainability service output.
    """

    if not isinstance(
        sustainability,
        dict,
    ):
        sustainability = {}

    sustainability_score = normalize_number(
        get_nested_value(
            sustainability,
            "sustainability_score",
            "score",
            default=None,
        ),
        default=None,
    )

    reuse_score = normalize_number(
        get_nested_value(
            sustainability,
            "reuse_score",
            default=None,
        ),
        default=None,
    )

    recovery_score = normalize_number(
        get_nested_value(
            sustainability,
            "recovery_score",
            default=None,
        ),
        default=None,
    )

    circularity_level = normalize_text(
        get_nested_value(
            sustainability,
            "circularity_level",
            "level",
            default="Insufficient Data",
        ),
        default="Insufficient Data",
    )

    assessment_status = normalize_text(
        get_nested_value(
            sustainability,
            "assessment_status",
            "status",
            default="Assessment Completed",
        ),
        default="Assessment Completed",
    )

    requires_manual_review = normalize_boolean(
        get_nested_value(
            sustainability,
            "requires_manual_review",
            default=False,
        ),
        default=False,
    )

    return {
        **sustainability,
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
        "material_status": "verified",
        "material_source": "user_verified",
    }


def build_unverified_decision():
    """
    Return the temporary result used before
    material confirmation.
    """

    return {
        "decision": {
            "recommendation": (
                "Material-Specific Recommendation Pending"
            ),
            "final_decision": (
                "Material-Specific Recommendation Pending"
            ),
            "recovery_path": (
                "Awaiting Optional Material Confirmation"
            ),
            "recovery_category": (
                "Not Assessed"
            ),
            "rule_name": (
                "Material verification pending"
            ),
            "priority": None,
            "reason": (
                "Visual fabric recognition and condition "
                "analysis are complete. Confirm the fibre "
                "composition from the care label to unlock "
                "a material-specific circular recommendation."
            ),
            "requires_manual_review": True,
        },
        "material_data": {
            "material": "Unverified",
            "type": "Unknown",
            "environmental_impact": (
                "Not Assessed"
            ),
            "biodegradable": False,
            "reusable": False,
        },
        "material_known": False,
        "material_status": (
            "awaiting_verification"
        ),
        "material_source": None,
    }


def build_unverified_sustainability():
    """
    Return sustainability state before the
    material is confirmed.
    """

    return {
        "sustainability_score": None,
        "reuse_score": None,
        "recovery_score": None,
        "circularity_level": (
            "Not Assessed"
        ),
        "assessment_status": (
            "Visual Analysis Completed"
        ),
        "requires_manual_review": True,
        "material_status": (
            "awaiting_verification"
        ),
        "material_source": None,
    }


def serialize_upload(
    upload,
):
    """
    Serialize a WasteUpload record for API
    history responses.
    """

    fabric_prediction = (
        build_fabric_prediction(
            upload.predicted_class,
            upload.confidence,
        )
    )

    stored_material = normalize_text(
        upload.material,
        default="Unverified",
    )

    has_assigned_material = (
        not upload.material_known
        and stored_material.lower()
        not in {
            "unverified",
            "unknown",
            "none",
        }
    )

    return {
        "upload_id": upload.upload_id,
        "image_path": upload.image_path,
        "weight_kg": upload.weight_kg,

        "predicted_class": (
            upload.predicted_class
        ),

        "fabric_category": (
            fabric_prediction["category"]
        ),

        "fabric_name": (
            fabric_prediction["fabric_name"]
        ),

        "fabric_construction": (
            fabric_prediction["construction"]
        ),

        "visual_family": (
            fabric_prediction["visual_family"]
        ),

        "fabric_prediction": (
            fabric_prediction
        ),

        "confidence": upload.confidence,

        "material": (
            stored_material
            if (
                upload.material_known
                or has_assigned_material
            )
            else "Unverified"
        ),

        "material_type": (
            upload.material_type
            if (
                upload.material_known
                or has_assigned_material
            )
            else "Unknown"
        ),

        "material_known": bool(
            upload.material_known
        ),

        "material_status": (
            "verified"
            if upload.material_known
            else (
                "application_assigned"
                if has_assigned_material
                else "awaiting_verification"
            )
        ),

        "material_source": (
            "user_verified"
            if upload.material_known
            else (
                "application_class_mapping"
                if has_assigned_material
                else None
            )
        ),

        "condition": upload.condition,

        "defect_status": (
            upload.defect_status
        ),

        "defect_severity": (
            upload.defect_severity
        ),

        "contamination_status": (
            upload.contamination_status
        ),

        "final_decision": (
            upload.final_decision
        ),

        "recovery_path": (
            upload.recovery_path
        ),

        "recovery_category": (
            upload.recovery_category
        ),

        "decision_rule": (
            upload.decision_rule
        ),

        "decision_priority": (
            upload.decision_priority
        ),

        "recycling_method": (
            upload.recycling_method
        ),

        "environmental_impact": (
            upload.environmental_impact
        ),

        "biodegradable": (
            upload.biodegradable
        ),

        "reusable": upload.reusable,

        "sustainability_score": (
            upload.sustainability_score
        ),

        "reuse_score": (
            upload.reuse_score
        ),

        "recovery_score": (
            upload.recovery_score
        ),

        "circularity_level": (
            upload.circularity_level
        ),

        "assessment_status": (
            upload.assessment_status
        ),

        "requires_manual_review": (
            upload.requires_manual_review
        ),

        "upload_date": upload.upload_date,
    }


# ==========================================================
# INITIAL TEXTILE IMAGE ANALYSIS
# ==========================================================

@router.post(
    "/",
    responses={
        400: {
            "description": (
                "Invalid weight, file type, "
                "or image content."
            ),
        },
        413: {
            "description": (
                "Uploaded image exceeds the "
                "10 MB size limit."
            ),
        },
        500: {
            "description": (
                "Unexpected textile analysis failure."
            ),
        },
    },
)
async def predict_textile(
    file: UploadFile = File(...),
    weight: float = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Analyse the uploaded textile image.

    The CNN predicts a visual TFD class. The
    academic prototype then assigns one
    representative material and generates a
    provisional circular assessment.

    The assigned material is an application
    assumption, not TFD fibre ground truth.
    Users can correct it through the material
    confirmation endpoint.
    """

    file_path = None

    try:
        # ----------------------------------------------
        # VALIDATE FILE
        # ----------------------------------------------

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Uploaded file must have "
                    "a filename."
                ),
            )

        allowed_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
        }

        file_extension = (
            Path(file.filename)
            .suffix
            .lower()
        )

        if file_extension not in (
            allowed_extensions
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported image format. "
                    "Upload JPG, JPEG, PNG or WebP."
                ),
            )

        allowed_content_types = {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        }

        if (
            file.content_type
            and file.content_type
            not in allowed_content_types
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "The uploaded file is not a "
                    "supported image."
                ),
            )

        if weight <= 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Weight must be greater than zero."
                ),
            )

        validate_upload_size(
            file
        )

        # ----------------------------------------------
        # SAVE UPLOADED IMAGE
        # ----------------------------------------------

        safe_file_name = (
            f"{uuid.uuid4()}{file_extension}"
        )

        file_path = (
            UPLOAD_DIR /
            safe_file_name
        )

        with open(
            file_path,
            "wb",
        ) as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        validate_uploaded_image(
            file_path
        )

        # ----------------------------------------------
        # CNN FABRIC CATEGORY PREDICTION
        # ----------------------------------------------

        prediction = predict_image(
            file_path
        )

        if not isinstance(
            prediction,
            dict,
        ):
            prediction = {}

        predicted_class = normalize_text(
            get_nested_value(
                prediction,
                "predicted_class",
                "class",
                "class_id",
                default="Unknown",
            ),
            default="Unknown",
        )

        confidence = normalize_number(
            get_nested_value(
                prediction,
                "confidence",
                default=0,
            ),
            default=0,
        )

        fabric_prediction = (
            build_fabric_prediction(
                predicted_class,
                confidence,
            )
        )

        assigned_material = normalize_material(
            get_nested_value(
                prediction,
                "assigned_material",
                default=(
                    fabric_prediction.get(
                        "assigned_material"
                    )
                ),
            )
        )

        if assigned_material is None:
            raise ValueError(
                "The predicted class does not "
                "have a supported application "
                "material mapping."
            )

        # ----------------------------------------------
        # CONDITION ASSESSMENT
        # ----------------------------------------------

        raw_condition_result = (
            analyze_condition(
                file_path
            )
        )

        condition_result = (
            normalize_condition_output(
                raw_condition_result
            )
        )

        condition = (
            condition_result["condition"]
        )

        contamination = (
            condition_result["contamination"]
        )

        damage_level = (
            condition_result["severity"]
        )

        defect = (
            condition_result["defect"]
        )

        # ----------------------------------------------
        # APPLICATION-ASSIGNED MATERIAL
        # ----------------------------------------------

        normalized_damage = (
            normalize_damage_level(
                damage_level,
                default="unknown",
            )
        )

        raw_decision = make_textile_decision(
            material=assigned_material,
            condition=condition,
            contamination=contamination,
            damage_level=normalized_damage,
        )

        decision = normalize_decision_output(
            raw_decision,
            assigned_material,
        )

        raw_sustainability = (
            calculate_sustainability(
                material=assigned_material,
                condition=condition,
                contamination=contamination,
                damage_level=normalized_damage,
            )
        )

        sustainability = (
            normalize_sustainability_output(
                raw_sustainability
            )
        )

        decision["material_status"] = (
            "application_assigned"
        )
        decision["material_source"] = (
            "application_class_mapping"
        )
        decision["material_verified"] = False
        decision["decision"][
            "requires_manual_review"
        ] = True
        decision["decision"][
            "assessment_basis"
        ] = "application_class_mapping"
        decision["decision"][
            "assumption_notice"
        ] = (
            "The material was assigned by the "
            "academic prototype mapping and was "
            "not verified from the TFD dataset "
            "or a garment care label."
        )

        sustainability["assessment_status"] = (
            "Provisional"
        )
        sustainability["requires_manual_review"] = (
            True
        )
        sustainability["material_status"] = (
            "application_assigned"
        )
        sustainability["material_source"] = (
            "application_class_mapping"
        )
        sustainability["material_verified"] = False

        decision_data = decision["decision"]
        material_data = decision["material_data"]

        material_name = material_data["material"]
        material_type = material_data["type"]

        recommendation_text = (
            decision_data["recommendation"]
        )

        recovery_path = (
            decision_data["recovery_path"]
        )

        recovery_category = (
            decision_data["recovery_category"]
        )

        # ----------------------------------------------
        # SAVE PROVISIONAL AUTOMATIC ASSESSMENT
        # ----------------------------------------------

        upload_record = WasteUpload(
            image_path=str(file_path),
            weight_kg=weight,

            predicted_class=predicted_class,
            confidence=confidence,

            material=material_name,
            material_type=material_type,

            recycling_method=(
                recovery_path
            ),

            environmental_impact=(
                material_data[
                    "environmental_impact"
                ]
            ),

            biodegradable=(
                material_data["biodegradable"]
            ),
            reusable=material_data["reusable"],

            defect_status=defect,
            defect_severity=damage_level,

            contamination_status=(
                contamination
            ),

            condition=condition,

            final_decision=(
                recommendation_text
            ),

            recovery_path=(
                recovery_path
            ),

            recovery_category=(
                recovery_category
            ),

            decision_rule=(
                decision_data["rule_name"]
            ),

            decision_priority=(
                decision_data["priority"]
            ),

            # False means the material came from the
            # application mapping, not a care label.
            material_known=False,

            sustainability_score=(
                sustainability[
                    "sustainability_score"
                ]
            ),
            reuse_score=(
                sustainability["reuse_score"]
            ),
            recovery_score=(
                sustainability[
                    "recovery_score"
                ]
            ),

            circularity_level=(
                sustainability[
                    "circularity_level"
                ]
            ),

            assessment_status=(
                "Provisional"
            ),

            # The decision is automatic but remains
            # provisional until corrected or confirmed.
            requires_manual_review=True,

            uploaded_by=current_user["user_id"],
        )

        db.add(
            upload_record
        )

        db.commit()

        db.refresh(
            upload_record
        )

        # ----------------------------------------------
        # DEBUG OUTPUT
        # ----------------------------------------------

        print(
            "Fabric prediction:",
            prediction,
        )

        print(
            "Condition analysis:",
            condition_result,
        )

        print(
            "Saved upload ID:",
            upload_record.upload_id,
        )

        # ----------------------------------------------
        # RESPONSE
        # ----------------------------------------------

        return {
            "status": "success",

            "message": (
                "Textile image analysed and a "
                "provisional circular assessment "
                "was generated using the "
                "application-assigned material."
            ),

            "upload_id": (
                upload_record.upload_id
            ),

            "weight_kg": (
                upload_record.weight_kg
            ),

            "fabric_prediction": (
                fabric_prediction
            ),

            "material_verification": {
                "material": material_name,
                "verified": False,
                "status": (
                    "application_assigned"
                ),
                "source": (
                    "application_class_mapping"
                ),
                "correctable": True,
                "message": (
                    "This representative material "
                    "was assigned by the academic "
                    "prototype mapping and is not "
                    "TFD fibre ground truth."
                ),
            },

            "condition_analysis": (
                condition_result
            ),

            "decision_analysis": decision,

            "sustainability_analysis": (
                sustainability
            ),

            "stored_assessment": {
                "material": material_name,
                "material_type": material_type,
                "material_verified": False,
                "material_source": (
                    "application_class_mapping"
                ),

                "final_decision": (
                    upload_record.final_decision
                ),

                "recovery_path": (
                    upload_record.recovery_path
                ),

                "recovery_category": (
                    upload_record
                    .recovery_category
                ),

                "sustainability_score": (
                    upload_record
                    .sustainability_score
                ),
                "reuse_score": (
                    upload_record.reuse_score
                ),
                "recovery_score": (
                    upload_record
                    .recovery_score
                ),

                "circularity_level": (
                    upload_record
                    .circularity_level
                ),

                "assessment_status": (
                    upload_record
                    .assessment_status
                ),

                "requires_manual_review": True,
            },
        }

    except HTTPException:
        db.rollback()

        delete_failed_upload(
            file_path
        )

        raise

    except Exception as error:
        db.rollback()

        delete_failed_upload(
            file_path
        )

        print(
            "Prediction API error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Textile analysis failed. "
                "Please try again with a valid image."
            ),
        ) from error

    finally:
        await file.close()


# ==========================================================
# GET ALL PREVIOUS TEXTILE ANALYSES
# ==========================================================

@router.get(
    "/history",
    responses={
        500: {
            "description": (
                "Unable to load textile "
                "analysis history."
            ),
        },
    },
)
def get_upload_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Return textile analyses newest first.

    Access scope:
    - Admin: platform-wide history
    - Recycler: platform-wide recycling workload
    - NGO: platform-wide sustainability history
    - Industry: only analyses uploaded by that user
    """

    try:
        role = current_user["role"]
        user_id = current_user["user_id"]

        query = db.query(WasteUpload)

        if role == "Industry":
            query = query.filter(
                WasteUpload.uploaded_by == user_id
            )

        uploads = (
            query
            .order_by(
                WasteUpload.upload_id.desc()
            )
            .all()
        )

        results = [
            serialize_upload(upload)
            for upload in uploads
        ]

        return {
            "status": "success",
            "role": role,
            "count": len(results),
            "uploads": results,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            "History API error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load textile "
                "analysis history."
            ),
        ) from error


# ==========================================================
# CONFIRM MATERIAL FOR EXISTING ANALYSIS
# ==========================================================

@router.patch(
    "/{upload_id}/material",
    responses={
        400: {
            "description": (
                "Unsupported textile material."
            ),
        },
        404: {
            "description": (
                "Textile analysis record not found."
            ),
        },
        500: {
            "description": (
                "Unexpected material confirmation "
                "failure."
            ),
        },
    },
)
def confirm_upload_material(
    upload_id: int,
    payload: MaterialConfirmationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Confirm the textile material for an
    existing upload.

    This updates the same WasteUpload record,
    runs the circular decision engine and
    calculates sustainability results.
    """

    try:
        # ----------------------------------------------
        # FIND EXISTING ANALYSIS
        # ----------------------------------------------

        upload_record = (
            db.query(WasteUpload)
            .filter(
                WasteUpload.upload_id
                == upload_id
            )
            .first()
        )

        if upload_record is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Textile analysis record "
                    "not found."
                ),
            )

        if (
            upload_record.uploaded_by
            != current_user["user_id"]
            and current_user["role"] != "Admin"
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to modify "
                    "this textile analysis."
                ),
            )

        # ----------------------------------------------
        # VALIDATE MATERIAL
        # ----------------------------------------------

        verified_material = (
            normalize_material(
                payload.material
            )
        )

        if verified_material is None:
            supported_material_list = (
                ", ".join(
                    sorted(
                        set(
                            SUPPORTED_MATERIALS
                            .values()
                        )
                    )
                )
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported textile material. "
                    "Choose one of: "
                    f"{supported_material_list}."
                ),
            )

        # ----------------------------------------------
        # USE EXISTING CONDITION DATA
        # ----------------------------------------------

        condition = normalize_text(
            upload_record.condition,
            default="Unknown",
        )

        contamination = normalize_text(
            upload_record
            .contamination_status,
            default="Not Assessed",
        )

        damage_level = normalize_damage_level(
    upload_record.defect_severity,
    default="unknown",
)

        # ----------------------------------------------
        # RUN CIRCULAR DECISION ENGINE
        # ----------------------------------------------

        raw_decision = (
            make_textile_decision(
                material=verified_material,
                condition=condition,
                contamination=contamination,
                damage_level=damage_level,
            )
        )

        decision = (
            normalize_decision_output(
                raw_decision,
                verified_material,
            )
        )

        decision_data = (
            decision["decision"]
        )

        material_data = (
            decision["material_data"]
        )

        # ----------------------------------------------
        # RUN SUSTAINABILITY ENGINE
        # ----------------------------------------------

        raw_sustainability = (
            calculate_sustainability(
                material=verified_material,
                condition=condition,
                contamination=contamination,
                damage_level=damage_level,
            )
        )

        sustainability = (
            normalize_sustainability_output(
                raw_sustainability
            )
        )

        # ----------------------------------------------
        # READ NORMALIZED OUTPUT
        # ----------------------------------------------

        material_name = (
            material_data["material"]
        )

        material_type = (
            material_data["type"]
        )

        environmental_impact = (
            material_data[
                "environmental_impact"
            ]
        )

        biodegradable = (
            material_data["biodegradable"]
        )

        reusable = (
            material_data["reusable"]
        )

        recommendation_text = (
            decision_data["recommendation"]
        )

        recovery_path = (
            decision_data["recovery_path"]
        )

        recovery_category = (
            decision_data[
                "recovery_category"
            ]
        )

        rule_name = (
            decision_data["rule_name"]
        )

        priority = (
            decision_data["priority"]
        )

        sustainability_score = (
            sustainability[
                "sustainability_score"
            ]
        )

        reuse_score = (
            sustainability["reuse_score"]
        )

        recovery_score = (
            sustainability[
                "recovery_score"
            ]
        )

        circularity_level = (
            sustainability[
                "circularity_level"
            ]
        )

        assessment_status = (
            sustainability[
                "assessment_status"
            ]
        )

        requires_manual_review = (
            normalize_boolean(
                decision_data.get(
                    "requires_manual_review",
                    False,
                )
            )
            or normalize_boolean(
                sustainability.get(
                    "requires_manual_review",
                    False,
                )
            )
        )

        # ----------------------------------------------
        # UPDATE THE SAME UPLOAD RECORD
        # ----------------------------------------------

        upload_record.material = (
            material_name
        )

        upload_record.material_type = (
            material_type
        )

        upload_record.recycling_method = (
            recovery_path
        )

        upload_record.environmental_impact = (
            environmental_impact
        )

        upload_record.biodegradable = (
            biodegradable
        )

        upload_record.reusable = reusable

        upload_record.final_decision = (
            recommendation_text
        )

        upload_record.recovery_path = (
            recovery_path
        )

        upload_record.recovery_category = (
            recovery_category
        )

        upload_record.decision_rule = (
            rule_name
        )

        upload_record.decision_priority = (
            priority
        )

        upload_record.material_known = True

        upload_record.sustainability_score = (
            sustainability_score
        )

        upload_record.reuse_score = (
            reuse_score
        )

        upload_record.recovery_score = (
            recovery_score
        )

        upload_record.circularity_level = (
            circularity_level
        )

        upload_record.assessment_status = (
            assessment_status
        )

        upload_record.requires_manual_review = (
            requires_manual_review
        )

        # ----------------------------------------------
        # SAVE RECOMMENDATION HISTORY
        # ----------------------------------------------

        recommendation_record = (
            Recommendation(
                waste_type=material_name,
                recommendation=(
                    recommendation_text
                ),
            )
        )

        db.add(
            recommendation_record
        )

        # ----------------------------------------------
        # CREATE AUTOMATIC NOTIFICATIONS
        # ----------------------------------------------

        create_analysis_notifications(
            db=db,
            upload=upload_record,
        )

        db.commit()

        db.refresh(
            upload_record
        )

        db.refresh(
            recommendation_record
        )

        # ----------------------------------------------
        # DEBUG OUTPUT
        # ----------------------------------------------

        print(
            "Confirmed material:",
            verified_material,
        )

        print(
            "Decision output:",
            decision,
        )

        print(
            "Sustainability output:",
            sustainability,
        )

        # ----------------------------------------------
        # RESPONSE
        # ----------------------------------------------

        return {
            "status": "success",

            "message": (
                "Material confirmed and the "
                "existing textile assessment "
                "was updated successfully."
            ),

            "upload_id": (
                upload_record.upload_id
            ),

            "weight_kg": (
                upload_record.weight_kg
            ),

            "fabric_prediction": (
                build_fabric_prediction(
                    upload_record.predicted_class,
                    upload_record.confidence,
                )
            ),

            "material_verification": {
                "material": (
                    upload_record.material
                ),

                "verified": True,
                "status": "verified",
                "source": "user_verified",
            },

            "condition_analysis": {
                "condition": (
                    upload_record.condition
                ),

                "defect": (
                    upload_record
                    .defect_status
                ),

                "severity": (
                    upload_record
                    .defect_severity
                ),

                "contamination": (
                    upload_record
                    .contamination_status
                ),
            },

            "decision_analysis": decision,

            "sustainability_analysis": (
                sustainability
            ),

            "stored_assessment": {
                "material": (
                    upload_record.material
                ),

                "material_type": (
                    upload_record
                    .material_type
                ),

                "final_decision": (
                    upload_record
                    .final_decision
                ),

                "recovery_path": (
                    upload_record
                    .recovery_path
                ),

                "recovery_category": (
                    upload_record
                    .recovery_category
                ),

                "sustainability_score": (
                    upload_record
                    .sustainability_score
                ),

                "reuse_score": (
                    upload_record.reuse_score
                ),

                "recovery_score": (
                    upload_record
                    .recovery_score
                ),

                "circularity_level": (
                    upload_record
                    .circularity_level
                ),

                "assessment_status": (
                    upload_record
                    .assessment_status
                ),

                "requires_manual_review": (
                    upload_record
                    .requires_manual_review
                ),
            },
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        print(
            "Material confirmation error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Material confirmation failed. "
                "Please try again."
            ),
        ) from error


# ==========================================================
# GET ONE TEXTILE ANALYSIS
# ==========================================================

@router.get(
    "/{upload_id}",
    responses={
        403: {
            "description": (
                "The authenticated user is not allowed "
                "to view this textile analysis."
            ),
        },
        404: {
            "description": (
                "Textile analysis record not found."
            ),
        },
        500: {
            "description": (
                "Unable to load the textile analysis."
            ),
        },
    },
)
def get_upload_analysis(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Return one textile analysis by ID.

    Industry users may only view analyses that they own.
    Admin, Recycler and NGO roles may view platform records
    needed by their role-specific dashboards.
    """

    try:
        upload_record = (
            db.query(WasteUpload)
            .filter(
                WasteUpload.upload_id
                == upload_id
            )
            .first()
        )

        if upload_record is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Textile analysis record "
                    "not found."
                ),
            )

        if (
            current_user["role"] == "Industry"
            and upload_record.uploaded_by
            != current_user["user_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You are not allowed to view "
                    "this textile analysis."
                ),
            )

        return {
            "status": "success",
            "analysis": serialize_upload(
                upload_record
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            "Single analysis API error:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to load textile "
                "analysis."
            ),
        ) from error