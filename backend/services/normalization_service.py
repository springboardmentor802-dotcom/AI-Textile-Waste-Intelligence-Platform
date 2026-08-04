from typing import Any


DAMAGE_LEVEL_MAPPING = {
    "none": "none",
    "no_damage": "none",
    "undamaged": "none",

    "low": "minor",
    "minor": "minor",

    "medium": "moderate",
    "moderate": "moderate",

    "high": "severe",
    "severe": "severe",
}


CONTAMINATION_LEVEL_MAPPING = {
    "none": "none",
    "clean": "none",
    "no_contamination": "none",

    "low": "low",
    "minor": "low",

    "medium": "medium",
    "moderate": "medium",

    "high": "high",
    "severe": "high",

    "hazardous": "hazardous",
    "hazard": "hazardous",
}


def normalize_lookup_text(
    value: Any,
    default: str = "",
) -> str:
    """
    Normalize text for rule and dictionary lookups.
    """

    if value is None:
        return default

    normalized_value = (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    normalized_value = "_".join(
        part
        for part in normalized_value.split("_")
        if part
    )

    return normalized_value or default


def normalize_damage_level(
    severity: Any,
    default: str = "unknown",
) -> str:
    """
    Convert condition severity into the canonical
    damage level used by backend services.

    Low -> minor
    Medium -> moderate
    High -> severe
    """

    normalized_severity = normalize_lookup_text(
        severity,
        default=default,
    )

    return DAMAGE_LEVEL_MAPPING.get(
        normalized_severity,
        normalized_severity,
    )


def normalize_contamination_level(
    contamination: Any,
    default: str = "unknown",
) -> str:
    """
    Convert contamination values into the canonical
    values used by recommendation rules.

    Moderate -> medium
    Severe -> high
    """

    normalized_contamination = normalize_lookup_text(
        contamination,
        default=default,
    )

    return CONTAMINATION_LEVEL_MAPPING.get(
        normalized_contamination,
        normalized_contamination,
    )