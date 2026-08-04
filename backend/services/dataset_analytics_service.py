from typing import Any

import pandas as pd

from services.dataset_service import load_dataset


def _safe_float(value: Any) -> float:
    """
    Convert pandas/numpy numeric values into
    normal Python float values for JSON responses.
    """

    if pd.isna(value):
        return 0.0

    return round(float(value), 2)


def _safe_int(value: Any) -> int:
    """
    Convert pandas/numpy integer values into
    normal Python int values for JSON responses.
    """

    if pd.isna(value):
        return 0

    return int(value)


def get_dataset_summary() -> dict[str, Any]:
    """
    Return overall sustainability analytics
    calculated from the synthetic dataset.
    """

    dataset = load_dataset()

    total_records = len(dataset)

    total_weight = dataset["weight_kg"].sum()

    average_sustainability_score = (
        dataset["sustainability_score"].mean()
    )

    total_co2_saved = (
        dataset["estimated_co2_saved_kg"].sum()
    )

    total_water_saved = (
        dataset[
            "estimated_water_saved_liters"
        ].sum()
    )

    total_energy_saved = (
        dataset[
            "estimated_energy_saved_kwh"
        ].sum()
    )

    total_landfill_diverted = (
        dataset[
            "estimated_landfill_diverted_kg"
        ].sum()
    )

    manual_review_count = (
        dataset[
            "requires_manual_review"
        ]
        .astype(bool)
        .sum()
    )

    completed_count = (
        total_records - manual_review_count
    )

    return {
        "total_records": _safe_int(
            total_records
        ),
        "total_weight_kg": _safe_float(
            total_weight
        ),
        "average_sustainability_score": (
            _safe_float(
                average_sustainability_score
            )
        ),
        "total_co2_saved_kg": _safe_float(
            total_co2_saved
        ),
        "total_water_saved_liters": (
            _safe_float(
                total_water_saved
            )
        ),
        "total_energy_saved_kwh": (
            _safe_float(
                total_energy_saved
            )
        ),
        "total_landfill_diverted_kg": (
            _safe_float(
                total_landfill_diverted
            )
        ),
        "completed_assessments": (
            _safe_int(
                completed_count
            )
        ),
        "manual_review_assessments": (
            _safe_int(
                manual_review_count
            )
        ),
    }


def get_material_distribution() -> list[dict[str, Any]]:
    """
    Return record count, total weight, and average
    sustainability score for every material.
    """

    dataset = load_dataset()

    grouped = (
        dataset
        .groupby(
            ["material_key", "material"],
            dropna=False,
        )
        .agg(
            record_count=(
                "record_id",
                "count",
            ),
            total_weight_kg=(
                "weight_kg",
                "sum",
            ),
            average_sustainability_score=(
                "sustainability_score",
                "mean",
            ),
            total_co2_saved_kg=(
                "estimated_co2_saved_kg",
                "sum",
            ),
        )
        .reset_index()
        .sort_values(
            by="record_count",
            ascending=False,
        )
    )

    results = []

    for _, row in grouped.iterrows():
        results.append(
            {
                "material_key": str(
                    row["material_key"]
                ),
                "material": str(
                    row["material"]
                ),
                "record_count": _safe_int(
                    row["record_count"]
                ),
                "total_weight_kg": (
                    _safe_float(
                        row["total_weight_kg"]
                    )
                ),
                "average_sustainability_score": (
                    _safe_float(
                        row[
                            "average_sustainability_score"
                        ]
                    )
                ),
                "total_co2_saved_kg": (
                    _safe_float(
                        row[
                            "total_co2_saved_kg"
                        ]
                    )
                ),
            }
        )

    return results


def get_recommendation_distribution() -> list[
    dict[str, Any]
]:
    """
    Return the frequency and average score of each
    recovery recommendation.
    """

    dataset = load_dataset()

    grouped = (
        dataset
        .groupby(
            "recommendation",
            dropna=False,
        )
        .agg(
            record_count=(
                "record_id",
                "count",
            ),
            total_weight_kg=(
                "weight_kg",
                "sum",
            ),
            average_sustainability_score=(
                "sustainability_score",
                "mean",
            ),
        )
        .reset_index()
        .sort_values(
            by="record_count",
            ascending=False,
        )
    )

    results = []

    for _, row in grouped.iterrows():
        results.append(
            {
                "recommendation": str(
                    row["recommendation"]
                ),
                "record_count": _safe_int(
                    row["record_count"]
                ),
                "total_weight_kg": (
                    _safe_float(
                        row["total_weight_kg"]
                    )
                ),
                "average_sustainability_score": (
                    _safe_float(
                        row[
                            "average_sustainability_score"
                        ]
                    )
                ),
            }
        )

    return results


def get_circularity_distribution() -> list[
    dict[str, Any]
]:
    """
    Return counts for High, Medium, and Low
    circularity classifications.
    """

    dataset = load_dataset()

    counts = (
        dataset[
            "circularity_level"
        ]
        .value_counts(
            dropna=False
        )
        .reset_index()
    )

    counts.columns = [
        "circularity_level",
        "record_count",
    ]

    results = []

    for _, row in counts.iterrows():
        results.append(
            {
                "circularity_level": str(
                    row[
                        "circularity_level"
                    ]
                ),
                "record_count": _safe_int(
                    row["record_count"]
                ),
            }
        )

    return results


def get_condition_distribution() -> list[
    dict[str, Any]
]:
    """
    Return condition-wise record counts.
    """

    dataset = load_dataset()

    counts = (
        dataset["condition"]
        .value_counts(
            dropna=False
        )
        .reset_index()
    )

    counts.columns = [
        "condition",
        "record_count",
    ]

    results = []

    for _, row in counts.iterrows():
        results.append(
            {
                "condition": str(
                    row["condition"]
                ),
                "record_count": _safe_int(
                    row["record_count"]
                ),
            }
        )

    return results


def get_contamination_distribution() -> list[
    dict[str, Any]
]:
    """
    Return contamination-level record counts.
    """

    dataset = load_dataset()

    counts = (
        dataset["contamination"]
        .value_counts(
            dropna=False
        )
        .reset_index()
    )

    counts.columns = [
        "contamination",
        "record_count",
    ]

    results = []

    for _, row in counts.iterrows():
        results.append(
            {
                "contamination": str(
                    row["contamination"]
                ),
                "record_count": _safe_int(
                    row["record_count"]
                ),
            }
        )

    return results


def get_complete_dataset_analytics() -> dict[str, Any]:
    """
    Return all dataset analytics in one response.
    """

    return {
        "summary": get_dataset_summary(),
        "material_distribution": (
            get_material_distribution()
        ),
        "recommendation_distribution": (
            get_recommendation_distribution()
        ),
        "circularity_distribution": (
            get_circularity_distribution()
        ),
        "condition_distribution": (
            get_condition_distribution()
        ),
        "contamination_distribution": (
            get_contamination_distribution()
        ),
        "dataset_metadata": {
            "dataset_type": "Synthetic",
            "total_records": 10_000,
            "purpose": (
                "Educational sustainability analytics"
            ),
        },
    }