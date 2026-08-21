"""
Recycling Recommendation Engine (Milestone 3, Task 1).
"""

MECHANICAL_FRIENDLY = {"Cotton", "Wool", "Denim", "Linen"}
CHEMICAL_FRIENDLY = {"Polyester", "Nylon", "Acrylic", "Rayon"}

UPCYCLING_IDEAS = {
    "Cotton": "Quilting patches, tote bags, cleaning rags",
    "Denim": "Patchwork, bags, upholstery accents",
    "Wool": "Felted crafts, insulation padding",
    "Silk": "Scarves, small accessories, decorative trims",
    "Polyester": "Stuffing/fill material, insulation panels",
    "Nylon": "Bag linings, technical accessory panels",
    "Acrylic": "Blended insulation fill",
    "Rayon": "Lining material for reworked garments",
    "Linen": "Napkins, patchwork, packaging cushioning",
}


def recommend_action(fabric_type, condition, waste_category):
    fabric_type = (fabric_type or "").strip()
    condition = (condition or "").strip()
    waste_category = (waste_category or "").strip()

    if waste_category == "Hazardous Textile Waste":
        return {
            "recommended_action": "Disposal Recommended",
            "recommendation_reason": (
                "Contamination or hazard risk detected; safe disposal "
                "through certified handling is required before any "
                "recycling or reuse pathway."
            ),
            "upcycling_ideas": None,
        }

    if waste_category == "Compostable":
        return {
            "recommended_action": "Industrial Recovery",
            "recommendation_reason": (
                "Natural fiber in a degraded state is best routed to "
                "industrial composting for material recovery rather "
                "than mechanical or chemical recycling."
            ),
            "upcycling_ideas": None,
        }

    if waste_category == "Reusable":
        return {
            "recommended_action": "Donation",
            "recommendation_reason": (
                f"{fabric_type or 'This item'} is in {condition.lower() or 'usable'} "
                "condition and can go directly back into circulation "
                "through donation or resale."
            ),
            "upcycling_ideas": None,
        }

    if waste_category == "Repairable":
        return {
            "recommended_action": "Fabric Reuse",
            "recommendation_reason": (
                "Minor damage means the item is a strong candidate for "
                "repair-and-reuse rather than breaking it down for "
                "material recovery."
            ),
            "upcycling_ideas": None,
        }

    if waste_category == "Upcyclable":
        return {
            "recommended_action": "Upcycling",
            "recommendation_reason": (
                "Condition and material make this a good fit for "
                "creative reuse rather than recycling."
            ),
            "upcycling_ideas": UPCYCLING_IDEAS.get(
                fabric_type, "Craft or patchwork material"
            ),
        }

    if fabric_type in MECHANICAL_FRIENDLY:
        return {
            "recommended_action": "Mechanical Recycling",
            "recommendation_reason": (
                f"{fabric_type} fibers hold up well to shredding and "
                "re-spinning, making mechanical recycling the most "
                "efficient recovery route."
            ),
            "upcycling_ideas": None,
        }

    if fabric_type in CHEMICAL_FRIENDLY:
        return {
            "recommended_action": "Chemical Recycling",
            "recommendation_reason": (
                f"{fabric_type} is a synthetic/semi-synthetic fiber best "
                "recovered by breaking it back down to base polymer or "
                "fiber through chemical recycling."
            ),
            "upcycling_ideas": None,
        }

    return {
        "recommended_action": "Fiber Recycling",
        "recommendation_reason": (
            "Material composition is mixed or unrecognized; general "
            "fiber recycling is the safest default recovery route."
        ),
        "upcycling_ideas": None,
    }
