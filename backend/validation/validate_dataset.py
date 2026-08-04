from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

DATASET_PATH = (
    BASE_DIR
    / "data"
    / "synthetic_textile_sustainability_dataset.csv"
)

RESULTS_DIR = BASE_DIR / "validation" / "results"

RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def print_section(title):
    print()
    print("=" * 72)
    print(title)
    print("=" * 72)


print_section("MILESTONE 3 DATASET VALIDATION")

df = pd.read_csv(DATASET_PATH)

total_records = len(df)

print(f"Dataset: {DATASET_PATH}")
print(f"Records: {total_records:,}")
print(f"Columns: {len(df.columns)}")


# ---------------------------------------------------------
# 1. DATASET SIZE
# ---------------------------------------------------------

print_section("1. DATASET SIZE")

expected_records = 10000

print(f"Expected records : {expected_records:,}")
print(f"Actual records   : {total_records:,}")

if total_records == expected_records:
    print("STATUS: PASS")
else:
    print("STATUS: FAIL")


# ---------------------------------------------------------
# 2. MISSING VALUES
# ---------------------------------------------------------

print_section("2. MISSING VALUE CHECK")

missing_counts = df.isnull().sum()

missing_counts = missing_counts[
    missing_counts > 0
]

if missing_counts.empty:
    print("Missing values: 0")
    print("STATUS: PASS")
else:
    print("Columns containing missing values:")
    print(missing_counts)
    print(
        f"Total missing cells: "
        f"{int(missing_counts.sum()):,}"
    )


# ---------------------------------------------------------
# 3. DUPLICATE RECORD IDs
# ---------------------------------------------------------

print_section("3. DUPLICATE RECORD CHECK")

duplicate_ids = int(
    df["record_id"].duplicated().sum()
)

duplicate_rows = int(
    df.duplicated().sum()
)

print(f"Duplicate record IDs: {duplicate_ids:,}")
print(f"Duplicate complete rows: {duplicate_rows:,}")

if duplicate_ids == 0:
    print("STATUS: PASS")
else:
    print("STATUS: FAIL")


# ---------------------------------------------------------
# 4. WEIGHT VALIDATION
# ---------------------------------------------------------

print_section("4. WEIGHT VALIDATION")

invalid_weights = df[
    df["weight_kg"].isna()
    | (df["weight_kg"] <= 0)
]

print(
    f"Invalid/non-positive weights: "
    f"{len(invalid_weights):,}"
)

print(
    f"Minimum weight: "
    f"{df['weight_kg'].min():.2f} kg"
)

print(
    f"Maximum weight: "
    f"{df['weight_kg'].max():.2f} kg"
)

if invalid_weights.empty:
    print("STATUS: PASS")
else:
    print("STATUS: FAIL")


# ---------------------------------------------------------
# 5. SUSTAINABILITY SCORE VALIDATION
# ---------------------------------------------------------

print_section("5. SUSTAINABILITY SCORE VALIDATION")

invalid_scores = df[
    df["sustainability_score"].isna()
    | (df["sustainability_score"] < 0)
    | (df["sustainability_score"] > 100)
]

print(
    f"Invalid sustainability scores: "
    f"{len(invalid_scores):,}"
)

print(
    f"Minimum score: "
    f"{df['sustainability_score'].min():.2f}"
)

print(
    f"Maximum score: "
    f"{df['sustainability_score'].max():.2f}"
)

print(
    f"Average score: "
    f"{df['sustainability_score'].mean():.2f}"
)

if invalid_scores.empty:
    print("STATUS: PASS")
else:
    print("STATUS: FAIL")


# ---------------------------------------------------------
# 6. ENVIRONMENTAL METRICS
# ---------------------------------------------------------

print_section("6. ENVIRONMENTAL METRIC VALIDATION")

environmental_columns = [
    "estimated_co2_saved_kg",
    "estimated_water_saved_liters",
    "estimated_energy_saved_kwh",
    "estimated_landfill_diverted_kg",
]

environmental_errors = 0

for column in environmental_columns:

    invalid = df[
        df[column].isna()
        | (df[column] < 0)
    ]

    environmental_errors += len(invalid)

    print(
        f"{column}: "
        f"{len(invalid):,} invalid values"
    )

if environmental_errors == 0:
    print("STATUS: PASS")
else:
    print(
        f"STATUS: FAIL "
        f"({environmental_errors:,} invalid cells)"
    )


# ---------------------------------------------------------
# 7. RULE COVERAGE
# ---------------------------------------------------------

print_section("7. RULE COVERAGE")

rule_counts = (
    df["matched_rule_id"]
    .fillna("NO_RULE")
    .value_counts()
    .sort_index()
)

expected_rules = {
    f"RULE-{number:03d}"
    for number in range(1, 22)
}

triggered_rules = set(
    df["matched_rule_id"]
    .dropna()
    .astype(str)
)

triggered_expected_rules = (
    expected_rules
    & triggered_rules
)

missing_rules = sorted(
    expected_rules
    - triggered_rules
)

rule_coverage = (
    len(triggered_expected_rules)
    / len(expected_rules)
    * 100
)

print(
    f"Expected rules: "
    f"{len(expected_rules)}"
)

print(
    f"Expected rules triggered: "
    f"{len(triggered_expected_rules)}"
)

print(
    f"Rule coverage: "
    f"{rule_coverage:.2f}%"
)

print(
    f"Rules not triggered: "
    f"{missing_rules}"
)

print()

print("Rule distribution:")

for rule_id, count in rule_counts.items():

    percentage = (
        count
        / total_records
        * 100
    )

    print(
        f"{rule_id:<12} "
        f"{count:>5,} "
        f"({percentage:>6.2f}%)"
    )


# ---------------------------------------------------------
# 8. RECOMMENDATION CONSISTENCY
# ---------------------------------------------------------

print_section("8. RECOMMENDATION CONSISTENCY")

consistency_columns = [
    "material_key",
    "condition",
    "contamination",
    "damage_level",
]

recommendation_variation = (
    df.groupby(
        consistency_columns,
        dropna=False,
    )["recommendation"]
    .nunique(dropna=False)
)

inconsistent_groups = (
    recommendation_variation[
        recommendation_variation > 1
    ]
)

total_input_groups = len(
    recommendation_variation
)

inconsistent_group_count = len(
    inconsistent_groups
)

if total_input_groups:

    consistency_percentage = (
        (
            total_input_groups
            - inconsistent_group_count
        )
        / total_input_groups
        * 100
    )

else:
    consistency_percentage = 100.0

print(
    f"Unique input combinations: "
    f"{total_input_groups:,}"
)

print(
    f"Inconsistent combinations: "
    f"{inconsistent_group_count:,}"
)

print(
    f"Recommendation consistency: "
    f"{consistency_percentage:.2f}%"
)

if inconsistent_group_count == 0:
    print("STATUS: PASS")
else:
    print("STATUS: REVIEW REQUIRED")


# ---------------------------------------------------------
# 9. MANUAL REVIEW ANALYSIS
# ---------------------------------------------------------

print_section("9. MANUAL REVIEW ANALYSIS")

manual_review = (
    df["requires_manual_review"]
    .astype(str)
    .str.strip()
    .str.lower()
    .isin(
        [
            "true",
            "1",
            "yes",
        ]
    )
)

manual_review_count = int(
    manual_review.sum()
)

automatic_count = (
    total_records
    - manual_review_count
)

manual_review_rate = (
    manual_review_count
    / total_records
    * 100
)

print(
    f"Automatic/completed records: "
    f"{automatic_count:,}"
)

print(
    f"Manual-review records: "
    f"{manual_review_count:,}"
)

print(
    f"Manual-review rate: "
    f"{manual_review_rate:.2f}%"
)


# ---------------------------------------------------------
# 10. ASSESSMENT STATUS
# ---------------------------------------------------------

print_section("10. ASSESSMENT STATUS DISTRIBUTION")

status_counts = (
    df["assessment_status"]
    .fillna("Missing")
    .value_counts()
)

print(status_counts.to_string())


# ---------------------------------------------------------
# 11. RECOVERY CATEGORY DISTRIBUTION
# ---------------------------------------------------------

print_section("11. RECOVERY CATEGORY DISTRIBUTION")

recovery_counts = (
    df["recovery_category"]
    .fillna("Missing")
    .value_counts()
)

print(recovery_counts.to_string())


# ---------------------------------------------------------
# 12. ENVIRONMENTAL TOTALS
# ---------------------------------------------------------

print_section("12. ENVIRONMENTAL TOTALS")

total_co2 = df[
    "estimated_co2_saved_kg"
].sum()

total_water = df[
    "estimated_water_saved_liters"
].sum()

total_energy = df[
    "estimated_energy_saved_kwh"
].sum()

total_landfill = df[
    "estimated_landfill_diverted_kg"
].sum()

total_weight = df[
    "weight_kg"
].sum()

print(
    f"Total textile weight: "
    f"{total_weight:,.2f} kg"
)

print(
    f"CO2 saved: "
    f"{total_co2:,.2f} kg"
)

print(
    f"Water saved: "
    f"{total_water:,.2f} L"
)

print(
    f"Energy saved: "
    f"{total_energy:,.2f} kWh"
)

print(
    f"Landfill diverted: "
    f"{total_landfill:,.2f} kg"
)


# ---------------------------------------------------------
# 13. SAVE RULE COVERAGE
# ---------------------------------------------------------

rule_report = (
    rule_counts
    .rename_axis("rule_id")
    .reset_index(name="record_count")
)

rule_report[
    "percentage"
] = (
    rule_report["record_count"]
    / total_records
    * 100
).round(2)

rule_report.to_csv(
    RESULTS_DIR / "rule_coverage.csv",
    index=False,
)


# ---------------------------------------------------------
# 14. SAVE RECOVERY DISTRIBUTION
# ---------------------------------------------------------

recovery_report = (
    recovery_counts
    .rename_axis("recovery_category")
    .reset_index(name="record_count")
)

recovery_report[
    "percentage"
] = (
    recovery_report["record_count"]
    / total_records
    * 100
).round(2)

recovery_report.to_csv(
    RESULTS_DIR
    / "recovery_category_distribution.csv",
    index=False,
)


# ---------------------------------------------------------
# 15. SAVE VALIDATION SUMMARY
# ---------------------------------------------------------

summary = pd.DataFrame(
    [
        {
            "metric": "Total records",
            "value": total_records,
        },
        {
            "metric": "Dataset columns",
            "value": len(df.columns),
        },
        {
            "metric": "Duplicate record IDs",
            "value": duplicate_ids,
        },
        {
            "metric": "Invalid weights",
            "value": len(invalid_weights),
        },
        {
            "metric": "Invalid sustainability scores",
            "value": len(invalid_scores),
        },
        {
            "metric": "Environmental invalid cells",
            "value": environmental_errors,
        },
        {
            "metric": "Expected rules triggered",
            "value": len(triggered_expected_rules),
        },
        {
            "metric": "Rule coverage percentage",
            "value": round(rule_coverage, 2),
        },
        {
            "metric": "Recommendation consistency",
            "value": round(
                consistency_percentage,
                2,
            ),
        },
        {
            "metric": "Manual review records",
            "value": manual_review_count,
        },
        {
            "metric": "Manual review percentage",
            "value": round(
                manual_review_rate,
                2,
            ),
        },
        {
            "metric": "Average sustainability score",
            "value": round(
                df[
                    "sustainability_score"
                ].mean(),
                2,
            ),
        },
        {
            "metric": "Total textile weight kg",
            "value": round(
                total_weight,
                2,
            ),
        },
        {
            "metric": "Total CO2 saved kg",
            "value": round(
                total_co2,
                2,
            ),
        },
        {
            "metric": "Total water saved liters",
            "value": round(
                total_water,
                2,
            ),
        },
        {
            "metric": "Total energy saved kWh",
            "value": round(
                total_energy,
                2,
            ),
        },
        {
            "metric": "Total landfill diverted kg",
            "value": round(
                total_landfill,
                2,
            ),
        },
    ]
)

summary.to_csv(
    RESULTS_DIR / "validation_summary.csv",
    index=False,
)


# ---------------------------------------------------------
# FINAL RESULT
# ---------------------------------------------------------

print_section("FINAL VALIDATION RESULT")

critical_failures = (
    len(invalid_weights)
    + len(invalid_scores)
    + environmental_errors
    + duplicate_ids
    + inconsistent_group_count
)

if critical_failures == 0:

    print(
        "PASS - No critical dataset consistency "
        "errors detected."
    )

else:

    print(
        "REVIEW REQUIRED - "
        f"{critical_failures:,} critical "
        "validation issue(s) detected."
    )

print()
print("Reports generated in:")
print(RESULTS_DIR)

print()
print(
    "IMPORTANT: Rule coverage measures how many "
    "recommendation rules are represented in the "
    "synthetic dataset."
)

print(
    "It is NOT CNN model accuracy."
)