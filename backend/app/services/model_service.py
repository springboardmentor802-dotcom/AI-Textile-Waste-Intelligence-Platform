import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import tensorflow as tf
from PIL import Image


BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "fabric_classifier.keras"
)

CONFIG_PATH = (
    BASE_DIR
    / "models"
    / "preprocessing_config.json"
)

CLASS_MAPPING_PATH = (
    BASE_DIR
    / "models"
    / "fabric_class_mapping.json"
)


def _validate_required_file(
    file_path: Path,
    description: str,
) -> None:
    """
    Ensure that a required model file exists.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"{description} was not found: "
            f"{file_path}"
        )

    if not file_path.is_file():
        raise FileNotFoundError(
            f"{description} is not a file: "
            f"{file_path}"
        )


def _load_json_file(
    file_path: Path,
    description: str,
) -> dict[str, Any]:
    """
    Load and validate a JSON object.
    """

    _validate_required_file(
        file_path,
        description,
    )

    try:
        with file_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

    except json.JSONDecodeError as error:
        raise ValueError(
            f"{description} contains invalid JSON: "
            f"{error}"
        ) from error

    except OSError as error:
        raise OSError(
            f"Unable to read {description}: "
            f"{error}"
        ) from error

    if not isinstance(data, dict):
        raise ValueError(
            f"{description} must contain "
            "a JSON object."
        )

    return data


_validate_required_file(
    MODEL_PATH,
    "Fabric classifier model",
)

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False,
)

config = _load_json_file(
    CONFIG_PATH,
    "Preprocessing configuration",
)

fabric_mapping_data = _load_json_file(
    CLASS_MAPPING_PATH,
    "Fabric class mapping",
)


def _validate_configuration() -> None:
    """
    Validate preprocessing and application
    class-mapping configuration at startup.
    """

    image_size = config.get("image_size")

    if (
        not isinstance(image_size, list)
        or len(image_size) != 2
        or not all(
            isinstance(value, int)
            and value > 0
            for value in image_size
        )
    ):
        raise ValueError(
            "preprocessing_config.json must "
            "contain image_size as two "
            "positive integers."
        )

    class_mapping = config.get(
        "class_mapping"
    )

    if (
        not isinstance(class_mapping, dict)
        or not class_mapping
    ):
        raise ValueError(
            "preprocessing_config.json must "
            "contain a non-empty "
            "class_mapping object."
        )

    fabric_classes = (
        fabric_mapping_data.get("classes")
    )

    if not isinstance(
        fabric_classes,
        dict,
    ):
        raise ValueError(
            "fabric_class_mapping.json must "
            "contain a classes object."
        )

    missing_classes = [
        class_id
        for class_id
        in class_mapping
        if class_id not in fabric_classes
    ]

    if missing_classes:
        raise ValueError(
            "Application mappings are missing "
            "for CNN classes: "
            + ", ".join(missing_classes)
        )

    for (
        class_id,
        metadata,
    ) in fabric_classes.items():
        if not isinstance(metadata, dict):
            raise ValueError(
                "Class mapping for "
                f"{class_id} must be an object."
            )

        assigned_material = metadata.get(
            "assigned_material"
        )

        if (
            not isinstance(
                assigned_material,
                str,
            )
            or not assigned_material.strip()
        ):
            raise ValueError(
                "Class mapping for "
                f"{class_id} must contain an "
                "assigned_material."
            )


_validate_configuration()


@lru_cache(maxsize=1)
def _get_reverse_class_mapping() -> dict[int, str]:
    """
    Convert class ID -> model index into
    model index -> class ID.
    """

    reverse_mapping: dict[int, str] = {}

    for (
        class_id,
        model_index,
    ) in config["class_mapping"].items():
        try:
            normalized_index = int(
                model_index
            )

        except (
            TypeError,
            ValueError,
        ) as error:
            raise ValueError(
                "Every class mapping value "
                "must be an integer model index."
            ) from error

        reverse_mapping[
            normalized_index
        ] = str(class_id).zfill(3)

    return reverse_mapping


def get_fabric_class_metadata(
    class_id: str,
) -> dict[str, Any]:
    """
    Return application metadata for one CNN
    visual class.

    assigned_material is a documented prototype
    assumption, not TFD fibre ground truth.
    """

    normalized_class_id = (
        str(class_id)
        .strip()
        .zfill(3)
    )

    classes = fabric_mapping_data[
        "classes"
    ]

    metadata = classes.get(
        normalized_class_id
    )

    if not isinstance(metadata, dict):
        return {
            "name": (
                "Fabric Category "
                f"{normalized_class_id}"
            ),
            "construction": "Unknown",
            "visual_family": "Unknown",
            "assigned_material": None,
            "likely_fibres": [],
            "material_source": (
                "application_class_mapping"
            ),
            "material_verified": False,
            "mapping_scope": (
                "academic_prototype"
            ),
        }

    likely_fibres = metadata.get(
        "likely_fibres",
        [],
    )

    if not isinstance(
        likely_fibres,
        list,
    ):
        likely_fibres = []

    mapping_metadata = (
        fabric_mapping_data.get(
            "metadata",
            {},
        )
    )

    return {
        "name": metadata.get(
            "name",
            (
                "Fabric Category "
                f"{normalized_class_id}"
            ),
        ),
        "construction": metadata.get(
            "construction",
            "Unknown",
        ),
        "visual_family": metadata.get(
            "visual_family",
            "Unknown",
        ),
        "assigned_material": metadata.get(
            "assigned_material"
        ),
        "likely_fibres": [
            str(value)
            for value in likely_fibres
            if str(value).strip()
        ],
        "material_source": metadata.get(
            "material_source",
            "application_class_mapping",
        ),
        "material_verified": False,
        "mapping_scope": (
            mapping_metadata.get(
                "mapping_scope",
                "academic_prototype",
            )
        ),
    }


def preprocess_image(
    image_path: str | Path,
) -> np.ndarray:
    """
    Prepare an uploaded image for CNN inference.
    """

    image_size = tuple(
        config["image_size"]
    )

    try:
        with Image.open(
            image_path
        ) as image:
            image = image.convert("RGB")

            image = image.resize(
                image_size,
                Image.Resampling.LANCZOS,
            )

            image_array = np.asarray(
                image,
                dtype=np.float32,
            )

    except (
        OSError,
        ValueError,
    ) as error:
        raise ValueError(
            "The uploaded file is corrupted "
            "or is not a valid image."
        ) from error

    image_array = (
        image_array / 255.0
    )

    return np.expand_dims(
        image_array,
        axis=0,
    )


def predict_image(
    image_path: str | Path,
) -> dict[str, Any]:
    """
    Predict a visual TFD category and attach
    the application's representative material.
    """

    image = preprocess_image(
        image_path
    )

    prediction = model.predict(
        image,
        verbose=0,
    )

    if (
        not isinstance(
            prediction,
            np.ndarray,
        )
        or prediction.size == 0
    ):
        raise ValueError(
            "The fabric classifier returned "
            "an invalid prediction."
        )

    prediction_vector = (
        prediction[0]
        if prediction.ndim > 1
        else prediction
    )

    model_index = int(
        np.argmax(
            prediction_vector
        )
    )

    confidence = float(
        np.max(
            prediction_vector
        )
    )

    class_id = (
        _get_reverse_class_mapping()
        .get(model_index)
    )

    if class_id is None:
        raise ValueError(
            "Predicted model index "
            f"{model_index} was not found "
            "in preprocessing_config.json."
        )

    metadata = (
        get_fabric_class_metadata(
            class_id
        )
    )

    return {
        "predicted_class": class_id,
        "class_id": class_id,
        "category": metadata["name"],
        "fabric_name": metadata["name"],
        "construction": (
            metadata["construction"]
        ),
        "visual_family": (
            metadata["visual_family"]
        ),
        "assigned_material": (
            metadata["assigned_material"]
        ),
        "likely_fibres": (
            metadata["likely_fibres"]
        ),
        "material_source": (
            metadata["material_source"]
        ),
        "material_verified": False,
        "mapping_scope": (
            metadata["mapping_scope"]
        ),
        "classification_scope": (
            "visual_fabric_category"
        ),
        "confidence": round(
            confidence * 100,
            2,
        ),
    }