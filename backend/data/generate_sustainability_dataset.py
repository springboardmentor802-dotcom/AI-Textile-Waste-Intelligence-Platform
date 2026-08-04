import csv
import random
import sys
from pathlib import Path
from typing import Any


# ---------------------------------------------------------
# Make the backend root importable when this script is run
# from the data folder.
# ---------------------------------------------------------

BACKEND_ROOT = Path(__file__).resolve().parent.parent

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


from services.sustainability_service import (  # noqa: E402
    calculate_sustainability,
)


# ---------------------------------------------------------
# Dataset configuration
# ---------------------------------------------------------

TOTAL_RECORDS = 10_000
RANDOM_SEED = 42

OUTPUT_FILE = (
    Path(__file__).resolve().parent
    / "synthetic_textile_sustainability_dataset.csv"
)


MATERIALS = [
    "cotton",
    "polyester",
    "wool",
    "silk",
    "linen",
    "denim",
    "nylon",
    "rayon",
    "acrylic",
    "mixed_fabric",
]


CONDITIONS = [
    "excellent",
    "good",
    "fair",
    "poor",
]


CONTAMINATION_LEVELS = [
    "none",
    "low",
    "medium",
    "high",
    "hazardous",
]


DAMAGE_LEVELS = [
    "none",
    "minor",
    "moderate",
    "severe",
]


# Weighted probabilities produce a more realistic distribution.
CONDITION_WEIGHTS = [
    15,
    35,
    30,
    20,
]

CONTAMINATION_WEIGHTS = [
    35,
    30,
    20,
    10,
    5,
]

DAMAGE_WEIGHTS = [
    20,
    30,
    30,
    20,
]


# ---------------------------------------------------------
# Environmental impact estimation
# ---------------------------------------------------------
#
# These values are synthetic educational estimates.
# They are not laboratory measurements or certified
# life-cycle assessment values.
#
# Each multiplier estimates the avoided environmental
# impact per kilogram of textile diverted through the
# recommended recovery pathway.
# ---------------------------------------------------------

IMPACT_FACTORS = {
    "Direct Reuse": {
        "co2_saved": 8.0,
        "water_saved": 2200.0,
        "energy_saved": 18.0,
        "landfill_diverted": 1.0,
    },
    "Donation": {
        "co2_saved": 7.0,
        "water_saved": 1900.0,
        "energy_saved": 16.0,
        "landfill_diverted": 1.0,
    },
    "Repair and Reuse": {
        "co2_saved": 6.5,
        "water_saved": 1700.0,
        "energy_saved": 14.0,
        "landfill_diverted": 0.95,
    },
    "Upcycling": {
        "co2_saved": 5.5,
        "water_saved": 1300.0,
        "energy_saved": 12.0,
        "landfill_diverted": 0.90,
    },
    "Mechanical Recycling": {
        "co2_saved": 4.0,
        "water_saved": 850.0,
        "energy_saved": 9.0,
        "landfill_diverted": 0.85,
    },
    "Chemical Recycling": {
        "co2_saved": 3.5,
        "water_saved": 700.0,
        "energy_saved": 7.5,
        "landfill_diverted": 0.80,
    },
    "Fiber Recovery": {
        "co2_saved": 3.0,
        "water_saved": 600.0,
        "energy_saved": 7.0,
        "landfill_diverted": 0.80,
    },
    "Specialized Recycling": {
        "co2_saved": 2.5,
        "water_saved": 500.0,
        "energy_saved": 6.0,
        "landfill_diverted": 0.70,
    },
    "Material Separation": {
        "co2_saved": 2.0,
        "water_saved": 400.0,
        "energy_saved": 5.0,
        "landfill_diverted": 0.65,
    },
    "Industrial Recovery": {
        "co2_saved": 1.8,
        "water_saved": 300.0,
        "energy_saved": 4.0,
        "landfill_diverted": 0.60,
    },
    "Cleaning and Reassessment": {
        "co2_saved": 1.0,
        "water_saved": 150.0,
        "energy_saved": 2.0,
        "landfill_diverted": 0.40,
    },
    "Specialized Treatment": {
        "co2_saved": 0.5,
        "water_saved": 80.0,
        "energy_saved": 1.0,
        "landfill_diverted": 0.30,
    },
    "Hazardous Textile Waste Treatment": {
        "co2_saved": 0.0,
        "water_saved": 0.0,
        "energy_saved": 0.0,
        "landfill_diverted": 0.10,
    },
    "Manual Review": {
        "co2_saved": 0.0,
        "water_saved": 0.0,
        "energy_saved": 0.0,
        "landfill_diverted": 0.0,
    },
}


DEFAULT_IMPACT_FACTORS = {
    "co2_saved": 1.0,
    "water_saved": 200.0,
    "energy_saved": 2.0,
    "landfill_diverted": 0.30,
}


def choose_weight_kg() -> float:
    """
    Generate a synthetic textile weight.

    Most records are between 0.2 kg and 15 kg,
    with occasional larger industrial batches.
    """

    if random.random() < 0.90:
        return round(
            random.uniform(0.2, 15.0),
            2,
        )

    return round(
        random.uniform(15.0, 50.0),
        2,
    )


def calculate_environmental_impact(
    recommendation: str,
    weight_kg: float,
) -> dict[str, float]:
    """
    Estimate environmental impact using the
    recommendation and textile weight.
    """

    factors = IMPACT_FACTORS.get(
        recommendation,
        DEFAULT_IMPACT_FACTORS,
    )

    return {
        "estimated_co2_saved_kg": round(
            factors["co2_saved"] * weight_kg,
            2,
        ),
        "estimated_water_saved_liters": round(
            factors["water_saved"] * weight_kg,
            2,
        ),
        "estimated_energy_saved_kwh": round(
            factors["energy_saved"] * weight_kg,
            2,
        ),
        "estimated_landfill_diverted_kg": round(
            factors["landfill_diverted"] * weight_kg,
            2,
        ),
    }


def extract_rule_information(
    assessment: dict[str, Any],
) -> tuple[str, str]:
    """
    Extract the matched rule ID and rule name from
    the decision result.

    Different fallback keys are supported so the
    generator remains compatible with the existing
    decision service.
    """

    decision = assessment.get("decision") or {}

    rule_id = (
        decision.get("rule_id")
        or decision.get("matched_rule_id")
        or decision.get("id")
        or ""
    )

    rule_name = (
        decision.get("rule_name")
        or decision.get("name")
        or decision.get("matched_rule_name")
        or ""
    )

    return str(rule_id), str(rule_name)


def create_record(
    record_number: int,
) -> dict[str, Any]:
    """
    Generate one synthetic textile sustainability
    record using the real project services.
    """

    material = random.choice(MATERIALS)

    condition = random.choices(
        CONDITIONS,
        weights=CONDITION_WEIGHTS,
        k=1,
    )[0]

    contamination = random.choices(
        CONTAMINATION_LEVELS,
        weights=CONTAMINATION_WEIGHTS,
        k=1,
    )[0]

    damage_level = random.choices(
        DAMAGE_LEVELS,
        weights=DAMAGE_WEIGHTS,
        k=1,
    )[0]

    weight_kg = choose_weight_kg()

    assessment = calculate_sustainability(
        material=material,
        condition=condition,
        contamination=contamination,
        damage_level=damage_level,
    )

    recommendation = (
        assessment.get("recommendation")
        or "Manual Review"
    )

    impact = calculate_environmental_impact(
        recommendation=recommendation,
        weight_kg=weight_kg,
    )

    rule_id, rule_name = extract_rule_information(
        assessment
    )

    return {
        "record_id": f"TXT-{record_number:05d}",
        "material_key": material,
        "material": assessment.get(
            "material",
            material,
        ),
        "condition": assessment.get(
            "condition",
            condition,
        ),
        "contamination": assessment.get(
            "contamination",
            contamination,
        ),
        "damage_level": assessment.get(
            "damage_level",
            damage_level,
        ),
        "weight_kg": weight_kg,
        "matched_rule_id": rule_id,
        "matched_rule_name": rule_name,
        "recommendation": recommendation,
        "recovery_category": assessment.get(
            "recovery_category",
            "",
        ),
        "sustainability_score": assessment.get(
            "sustainability_score"
        ),
        "reuse_score": assessment.get(
            "reuse_score"
        ),
        "recovery_score": assessment.get(
            "recovery_score"
        ),
        "circularity_level": assessment.get(
            "circularity_level",
            "",
        ),
        "assessment_status": assessment.get(
            "assessment_status",
            "",
        ),
        "requires_manual_review": assessment.get(
            "requires_manual_review",
            False,
        ),
        **impact,
        "dataset_type": "Synthetic",
        "dataset_purpose": (
            "Educational sustainability analytics"
        ),
    }


def generate_dataset() -> None:
    """
    Generate the complete CSV dataset.
    """

    random.seed(RANDOM_SEED)

    records = []

    print(
        f"Generating {TOTAL_RECORDS:,} synthetic records..."
    )

    for record_number in range(
        1,
        TOTAL_RECORDS + 1,
    ):
        record = create_record(
            record_number
        )

        records.append(record)

        if record_number % 1000 == 0:
            print(
                f"Generated {record_number:,} records"
            )

    if not records:
        raise RuntimeError(
            "No dataset records were generated."
        )

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_FILE.open(
        mode="w",
        newline="",
        encoding="utf-8",
    ) as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=records[0].keys(),
        )

        writer.writeheader()
        writer.writerows(records)

    print()
    print("Dataset generation completed.")
    print(f"Saved to: {OUTPUT_FILE}")
    print(f"Total records: {len(records):,}")


if __name__ == "__main__":
    generate_dataset()
