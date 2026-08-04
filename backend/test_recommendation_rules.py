from services.recommendation_service import (
    get_recommendation,
)


TEST_CASES = [
    {
        "test_id": "T01",
        "material": "cotton",
        "condition": "poor",
        "contamination": "hazardous",
        "damage_level": "severe",
        "expected_rule": "RULE-001",
        "expected_recommendation": (
            "Hazardous Textile Waste Treatment"
        ),
    },
    {
        "test_id": "T02",
        "material": "cotton",
        "condition": "poor",
        "contamination": "high",
        "damage_level": "severe",
        "expected_rule": "RULE-002",
        "expected_recommendation": (
            "Specialized Treatment"
        ),
    },
    {
        "test_id": "T03",
        "material": "silk",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-003",
        "expected_recommendation": (
            "Fiber Recovery"
        ),
    },
    {
        "test_id": "T04",
        "material": "cotton",
        "condition": "excellent",
        "contamination": "none",
        "damage_level": "none",
        "expected_rule": "RULE-004",
        "expected_recommendation": (
            "Direct Reuse"
        ),
    },
    {
        "test_id": "T05",
        "material": "cotton",
        "condition": "good",
        "contamination": "low",
        "damage_level": "minor",
        "expected_rule": "RULE-005",
        "expected_recommendation": (
            "Donation"
        ),
    },
    {
        "test_id": "T06",
        "material": "cotton",
        "condition": "fair",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-006",
        "expected_recommendation": (
            "Repair and Reuse"
        ),
    },
    {
        "test_id": "T07",
        "material": "cotton",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-007",
        "expected_recommendation": (
            "Mechanical Recycling"
        ),
    },
    {
        "test_id": "T08",
        "material": "linen",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-008",
        "expected_recommendation": (
            "Mechanical Recycling"
        ),
    },
    {
        "test_id": "T09",
        "material": "wool",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-009",
        "expected_recommendation": (
            "Fiber Recovery"
        ),
    },
    {
        "test_id": "T10",
        "material": "silk",
        "condition": "fair",
        "contamination": "low",
        "damage_level": "minor",
        "expected_rule": "RULE-010",
        "expected_recommendation": (
            "Upcycling"
        ),
    },
    {
        "test_id": "T11",
        "material": "denim",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-011",
        "expected_recommendation": (
            "Upcycling"
        ),
    },
    {
        "test_id": "T12",
        "material": "denim",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-012",
        "expected_recommendation": (
            "Mechanical Recycling"
        ),
    },
    {
        "test_id": "T13",
        "material": "polyester",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "severe",
        "expected_rule": "RULE-013",
        "expected_recommendation": (
            "Chemical Recycling"
        ),
    },
    {
        "test_id": "T14",
        "material": "polyester",
        "condition": "fair",
        "contamination": "low",
        "damage_level": "minor",
        "expected_rule": "RULE-014",
        "expected_recommendation": (
            "Mechanical Recycling"
        ),
    },
    {
        "test_id": "T15",
        "material": "nylon",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-015",
        "expected_recommendation": (
            "Chemical Recycling"
        ),
    },
    {
        "test_id": "T16",
        "material": "rayon",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-016",
        "expected_recommendation": (
            "Specialized Recycling"
        ),
    },
    {
        "test_id": "T17",
        "material": "acrylic",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-017",
        "expected_recommendation": (
            "Industrial Recovery"
        ),
    },
    {
        "test_id": "T18",
        "material": "mixed fabric",
        "condition": "fair",
        "contamination": "low",
        "damage_level": "moderate",
        "expected_rule": "RULE-018",
        "expected_recommendation": (
            "Material Separation"
        ),
    },
    {
        "test_id": "T19",
        "material": "hemp",
        "condition": "fair",
        "contamination": "low",
        "damage_level": "minor",
        "expected_rule": "RULE-019",
        "expected_recommendation": (
            "Upcycling"
        ),
    },
    {
        "test_id": "T20",
        "material": "hemp",
        "condition": "good",
        "contamination": "moderate",
        "damage_level": "minor",
        "expected_rule": "RULE-020",
        "expected_recommendation": (
            "Cleaning and Reassessment"
        ),
    },
    {
        "test_id": "T21",
        "material": "cotton",
        "condition": "poor",
        "contamination": "low",
        "damage_level": "minor",
        "expected_rule": "RULE-021",
        "expected_recommendation": (
            "Fiber Recovery"
        ),
    },
]


def run_tests() -> None:
    passed = 0
    failed = 0

    print()
    print("=" * 72)
    print("TEXTILE RECOMMENDATION RULE TESTS")
    print("=" * 72)

    for test_case in TEST_CASES:
        test_id = test_case["test_id"]

        try:
            result = get_recommendation(
                material=test_case["material"],
                condition=test_case["condition"],
                contamination=(
                    test_case["contamination"]
                ),
                damage_level=(
                    test_case["damage_level"]
                ),
            )

            actual_rule = result.get(
                "rule_id"
            )

            actual_recommendation = result.get(
                "recommendation"
            )

            rule_matches = (
                actual_rule
                == test_case["expected_rule"]
            )

            recommendation_matches = (
                actual_recommendation
                == test_case[
                    "expected_recommendation"
                ]
            )

            if (
                rule_matches
                and recommendation_matches
            ):
                passed += 1

                print(
                    f"PASS {test_id}: "
                    f"{actual_rule} - "
                    f"{actual_recommendation}"
                )

            else:
                failed += 1

                print(
                    f"FAIL {test_id}"
                )
                print(
                    "  Expected rule: "
                    f"{test_case['expected_rule']}"
                )
                print(
                    "  Actual rule:   "
                    f"{actual_rule}"
                )
                print(
                    "  Expected recommendation: "
                    f"{test_case['expected_recommendation']}"
                )
                print(
                    "  Actual recommendation:   "
                    f"{actual_recommendation}"
                )
                print(
                    "  Matched inputs: "
                    f"{result.get('matched_inputs')}"
                )

        except Exception as error:
            failed += 1

            print(
                f"ERROR {test_id}: "
                f"{type(error).__name__}: "
                f"{error}"
            )

    print("-" * 72)
    print(
        f"TOTAL: {len(TEST_CASES)} | "
        f"PASSED: {passed} | "
        f"FAILED: {failed}"
    )
    print("=" * 72)

    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    run_tests()