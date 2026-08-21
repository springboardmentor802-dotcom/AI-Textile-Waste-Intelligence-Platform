"""
Textile Waste Classification Engine
-------------------------------------
This module decides which of the 6 waste categories a textile item
belongs to: Recyclable, Reusable, Repairable, Upcyclable, Compostable,
or Hazardous Textile Waste.

This is RULE-BASED logic (if/else + lookup tables), not a trained AI
model -- because no dataset directly labels items with these exact
6 categories. This encodes domain knowledge about textile recycling,
which is the expected approach at this stage of the project.

Condition values are aligned with the frontend's CONDITION_CHOICES:
"New Surplus", "Lightly Used", "Worn", "Damaged", "Contaminated".
"""

# Fiber types generally considered natural/biodegradable
NATURAL_FIBERS = {"cotton", "wool", "linen", "silk"}

# Fiber types generally considered synthetic (not biodegradable,
# but often mechanically/chemically recyclable)
SYNTHETIC_FIBERS = {"polyester", "polyamide", "nylon", "acrylic", "rayon"}

# Blended/mixed fabrics are harder to recycle since fibers must be
# separated first
BLENDED_KEYWORDS = {"mixed", "blend"}

# Condition groupings mapped to the ACTUAL dropdown values used in the
# frontend form (CONDITION_CHOICES), rather than generic words like
# "good"/"fair" which never appear in real submitted data.
EXCELLENT_CONDITIONS = {"new surplus"}
GOOD_CONDITIONS = {"lightly used"}
FAIR_CONDITIONS = {"worn"}
DAMAGED_CONDITIONS = {"damaged", "torn", "severely worn"}
CONTAMINATED_CONDITIONS = {"contaminated"}


def normalize_fabric_type(fabric_type: str) -> str:
    """Lowercases and strips the fabric type string for safe comparison."""
    return fabric_type.strip().lower()


def is_blended(fabric_type: str) -> bool:
    """Checks if the fabric type indicates a mixed/blended material."""
    fabric_type = normalize_fabric_type(fabric_type)
    return any(keyword in fabric_type for keyword in BLENDED_KEYWORDS)


def categorize_waste(
    fabric_type: str,
    condition: str,
    contamination_suspected: bool = False,
) -> dict:
    """
    Main function -- decides the waste category based on:
      - fabric_type: e.g. "Cotton", "Polyester", "Denim", "Mixed fabrics"
      - condition: one of "New Surplus", "Lightly Used", "Worn",
        "Damaged", "Contaminated" (matches the frontend dropdown)
      - contamination_suspected: True/False (from the image analysis engine)

    Returns a dict with the category and a short reason explaining why,
    so the decision isn't a "black box" -- useful for reports later.
    """
    fabric_type_norm = normalize_fabric_type(fabric_type)
    condition_norm = condition.strip().lower()

    # RULE 1: Contamination always overrides everything else --
    # contaminated textile waste is a health/safety concern first.
    # Triggered either by the image analysis flag OR the condition
    # field itself being set to "Contaminated".
    if contamination_suspected or condition_norm in CONTAMINATED_CONDITIONS:
        return {
            "waste_category": "Hazardous Textile Waste",
            "reason": "Contamination detected (via image analysis or "
                      "reported condition); requires special handling "
                      "before further processing.",
        }

    # RULE 2: Badly damaged items go to repair or compost, not recycling
    if condition_norm in DAMAGED_CONDITIONS:
        if fabric_type_norm in NATURAL_FIBERS and not is_blended(fabric_type_norm):
            return {
                "waste_category": "Compostable",
                "reason": f"{fabric_type} is a natural fiber in poor condition; "
                "suitable for composting rather than recycling.",
            }
        else:
            return {
                "waste_category": "Repairable",
                "reason": f"Item is damaged but made of {fabric_type}; "
                "repair may extend its usable life before disposal.",
            }

    # RULE 3: New surplus / like-new items are prime candidates for reuse
    if condition_norm in EXCELLENT_CONDITIONS or condition_norm in GOOD_CONDITIONS:
        return {
            "waste_category": "Reusable",
            "reason": f"Item is in {condition} condition; "
            "suitable for direct reuse or donation.",
        }

    # RULE 4: Worn (fair) condition -- depends on fiber type
    if condition_norm in FAIR_CONDITIONS:
        if is_blended(fabric_type_norm):
            return {
                "waste_category": "Upcyclable",
                "reason": f"{fabric_type} is a blended fabric; difficult to "
                "separate fibers for standard recycling, but "
                "suitable for upcycling into new products.",
            }
        elif fabric_type_norm in SYNTHETIC_FIBERS:
            return {
                "waste_category": "Recyclable",
                "reason": f"{fabric_type} is a synthetic fiber in worn condition; "
                "suitable for mechanical or chemical recycling.",
            }
        elif fabric_type_norm in NATURAL_FIBERS:
            return {
                "waste_category": "Recyclable",
                "reason": f"{fabric_type} is a natural fiber in worn condition; "
                "suitable for fiber recycling.",
            }

    # DEFAULT fallback -- if none of the above rules matched clearly
    # (e.g. an unrecognized fabric_type or condition value)
    return {
        "waste_category": "Upcyclable",
        "reason": "Condition or fabric type not clearly classified; "
                  "defaulting to upcycling as a safe general option.",
    }


# ---------------------------------------------------------------
# Quick manual test -- run this file directly to try a few examples
# ---------------------------------------------------------------
if __name__ == "__main__":
    test_cases = [
        {"fabric_type": "Cotton", "condition": "New Surplus",
            "contamination_suspected": False},
        {"fabric_type": "Polyester", "condition": "Lightly Used",
            "contamination_suspected": False},
        {"fabric_type": "Polyester", "condition": "Worn",
            "contamination_suspected": False},
        {"fabric_type": "Mixed fabrics", "condition": "Worn",
            "contamination_suspected": False},
        {"fabric_type": "Cotton", "condition": "Damaged",
            "contamination_suspected": False},
        {"fabric_type": "Denim", "condition": "Damaged",
            "contamination_suspected": False},
        {"fabric_type": "Wool", "condition": "New Surplus",
            "contamination_suspected": True},
        {"fabric_type": "Cotton", "condition": "Contaminated",
            "contamination_suspected": False},
    ]

    for case in test_cases:
        result = categorize_waste(**case)
        print(f"Input: {case}")
        print(f"Result: {result}\n")
