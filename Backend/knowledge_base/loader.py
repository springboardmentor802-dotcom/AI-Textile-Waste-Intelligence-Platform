
import json
from functools import lru_cache
from pathlib import Path
from typing import Optional

from .schemas import MaterialKnowledge

# Adjust this path to wherever you place the seed file in your actual
# project structure, e.g. app/db/seeds/material_knowledge_seed.json
_SEED_PATH = Path(__file__).parent / "material_knowledge.json"

_FALLBACK_CLASS = "Unclassified"


@lru_cache(maxsize=1)
def _load_raw() -> dict:
    """Load and cache the raw JSON knowledge base. Runs once per process."""
    with open(_SEED_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["materials"]


def list_fabric_classes() -> list[str]:
    """Return all fabric classes currently in the knowledge base."""
    return list(_load_raw().keys())


def get_material(fabric_class: str) -> MaterialKnowledge:
    """
    Look up a fabric class's sustainability/LCA reference data.

    Falls back to the 'Unclassified' entry if the fabric class isn't
    found, so downstream engines never crash on an unexpected label -
    they just get a safe, clearly-flagged "unknown" record instead.
    """
    materials = _load_raw()
    entry: Optional[dict] = materials.get(fabric_class)

    if entry is None:
        entry = materials[_FALLBACK_CLASS]

    return MaterialKnowledge(**entry)


def get_material_raw(fabric_class: str) -> dict:
    """Same lookup as get_material(), but returns a plain dict.
    Useful when you just want to feed values into a scoring formula
    without the pydantic wrapper."""
    materials = _load_raw()
    return materials.get(fabric_class, materials[_FALLBACK_CLASS])