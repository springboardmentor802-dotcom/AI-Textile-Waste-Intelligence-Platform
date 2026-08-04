import json
from functools import lru_cache
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
MATERIALS_FILE = KNOWLEDGE_DIR / "materials.json"


class KnowledgeBaseError(Exception):
    """Raised when knowledge-base data cannot be loaded correctly."""


@lru_cache(maxsize=1)
def load_materials() -> dict[str, dict[str, Any]]:
    """
    Load and cache textile material knowledge from materials.json.
    """

    if not MATERIALS_FILE.exists():
        raise KnowledgeBaseError(
            f"Materials knowledge file was not found: {MATERIALS_FILE}"
        )

    try:
        with MATERIALS_FILE.open("r", encoding="utf-8") as file:
            materials = json.load(file)
    except json.JSONDecodeError as error:
        raise KnowledgeBaseError(
            f"Invalid JSON in materials knowledge file: {error}"
        ) from error
    except OSError as error:
        raise KnowledgeBaseError(
            f"Unable to read materials knowledge file: {error}"
        ) from error

    if not isinstance(materials, dict):
        raise KnowledgeBaseError(
            "materials.json must contain a JSON object."
        )

    return materials


def normalize_material_name(material: str) -> str:
    """
    Convert user or AI material names into knowledge-base keys.
    """

    if not material or not material.strip():
        raise ValueError("Material name is required.")

    return (
        material.strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


def get_material(material: str) -> dict[str, Any] | None:
    """
    Return information for one material.
    """

    material_key = normalize_material_name(material)
    return load_materials().get(material_key)


def get_supported_materials() -> list[str]:
    """
    Return all supported material keys.
    """

    return sorted(load_materials().keys())