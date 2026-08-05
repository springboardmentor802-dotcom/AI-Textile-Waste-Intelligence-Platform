"""Dynamic Sustainability Intelligence Engine

Provides `compute_recommendation(quality, inputs)` which returns the
recommendation and dynamically calculated sustainability/circularity
metrics. Designed to be non-invasive and configurable via constants.
"""
from typing import Dict, Any


# Baseline scores and resource-saved estimates per quality class
BASE_SCORES = {
    "high": {
        "recommendation": "Reuse or Donate",
        "sustainability_score": 95,
        "circularity_score": 90,
        "co2_saved": 18.5,
        "water_saved": 120,
        "energy_saved": 8.2,
    },
    "medium": {
        "recommendation": "Mechanical Recycling",
        "sustainability_score": 75,
        "circularity_score": 70,
        "co2_saved": 12.3,
        "water_saved": 90,
        "energy_saved": 5.4,
    },
    "low": {
        "recommendation": "Chemical Recycling",
        "sustainability_score": 55,
        "circularity_score": 50,
        "co2_saved": 6.4,
        "water_saved": 45,
        "energy_saved": 2.8,
    },
}


# Tunable multipliers by categorical features
FABRIC_TYPE_FACTOR = {
    "cotton": 1.00,
    "linen": 0.95,
    "polyester": 0.85,
    "silk": 0.92,
    "wool": 0.90,
}

PRODUCTION_METHOD_FACTOR = {
    "handloom": 0.70,
    "powerloom": 1.00,
}

FINISH_TYPE_PENALTY = {
    "raw": 0.00,
    "dyed": 0.10,
    "printed": 0.12,
}


def _coerce_float(v, fallback=0.0):
    try:
        if v is None or v == "":
            return fallback
        return float(v)
    except Exception:
        return fallback


def _clamp(n, lo=0, hi=100):
    return max(lo, min(hi, n))


def compute_recommendation(quality: str, inputs: Dict[str, Any] = None) -> Dict[str, Any]:
    """Compute recommendation and dynamic sustainability metrics.

    - `quality` expected to be a string: 'high', 'medium', 'low' (case-insensitive)
    - `inputs` may include: `quantity`, `gsm`, `defect_count`, `fabric_type`,
      `production_method`, `finish_type`.

    Returns a dict matching the existing `/recommend` response keys.
    """
    if inputs is None:
        inputs = {}

    q = (quality or "").strip().lower()
    if q not in BASE_SCORES:
        q = "low"

    base = BASE_SCORES[q]

    # Read input features and coerce
    quantity = _coerce_float(inputs.get("quantity") or inputs.get("batch_id") or 1, 1.0)
    gsm = _coerce_float(inputs.get("gsm") or 100, 100.0)
    defect_count = _coerce_float(inputs.get("defect_count"), 0.0)

    fabric_type = str(inputs.get("fabric_type") or "").strip().lower()
    production_method = str(inputs.get("production_method") or "").strip().lower()
    finish_type = str(inputs.get("finish_type") or "").strip().lower()

    # Lookup multipliers (fallbacks provided)
    fabric_factor = FABRIC_TYPE_FACTOR.get(fabric_type, 0.9)
    prod_factor = PRODUCTION_METHOD_FACTOR.get(production_method, 1.0)
    finish_penalty = FINISH_TYPE_PENALTY.get(finish_type, 0.0)

    # Mass proxy: quantity scaled by gsm (coarse approximation)
    mass_proxy = max(1.0, quantity * (gsm / 100.0))

    # Defect penalty (each defect reduces effectiveness by 2%, cap at 50%)
    defect_penalty = max(0.5, 1.0 - min(defect_count * 0.02, 0.5))

    # Overall multiplier
    multiplier = fabric_factor * prod_factor * (1.0 - finish_penalty) * defect_penalty

    # Compute adjusted scores
    sustainability_score = int(round(base["sustainability_score"] * multiplier))
    circularity_score = int(round(base["circularity_score"] * multiplier))

    # Scale resource savings by multiplier and mass proxy
    co2_saved = round(base["co2_saved"] * multiplier * mass_proxy, 3)
    water_saved = round(base["water_saved"] * multiplier * mass_proxy, 2)
    energy_saved = round(base["energy_saved"] * multiplier * mass_proxy, 3)

    result = {
        "recommendation": base["recommendation"],
        "sustainability_score": _clamp(sustainability_score, 0, 100),
        "circularity_score": _clamp(circularity_score, 0, 100),
        "co2_saved": co2_saved,
        "water_saved": water_saved,
        "energy_saved": energy_saved,
    }

    return result
