"""
Recyclability Assessment and Recommendation Engine
Generates recycling strategy, reuse opportunities, upcycling suggestions,
material recovery recommendations, and waste reduction strategies.
"""


RECYCLING_OPTIONS = {
    "Fiber Recycling": "Shred and re-spin into new yarn fibers.",
    "Mechanical Recycling": "Mechanically break down fabric into raw fiber without chemicals.",
    "Chemical Recycling": "Use chemical processes to recover base polymers.",
    "Fabric Reuse": "Clean, repair, and redistribute the fabric for direct use.",
    "Upcycling": "Transform into higher-value products (bags, accessories, insulation).",
    "Donation": "Donate wearable or usable fabric to charity organizations.",
    "Industrial Recovery": "Use as industrial wipers, insulation, or filling material.",
}

MATERIAL_RECYCLING_MAP = {
    "Cotton": ["Fiber Recycling", "Mechanical Recycling", "Fabric Reuse", "Donation"],
    "Polyester": ["Mechanical Recycling", "Chemical Recycling", "Industrial Recovery"],
    "Wool": ["Fiber Recycling", "Fabric Reuse", "Upcycling", "Donation"],
    "Silk": ["Fabric Reuse", "Upcycling", "Donation"],
    "Linen": ["Fiber Recycling", "Fabric Reuse", "Upcycling"],
    "Denim": ["Mechanical Recycling", "Fiber Recycling", "Upcycling"],
    "Nylon": ["Mechanical Recycling", "Chemical Recycling", "Industrial Recovery"],
    "Acrylic": ["Industrial Recovery", "Mechanical Recycling"],
    "Viscose": ["Fiber Recycling", "Chemical Recycling"],
    "Blended": ["Mechanical Recycling", "Industrial Recovery"],
    "Fleece": ["Mechanical Recycling", "Industrial Recovery"],
    "Leather": ["Upcycling", "Industrial Recovery"],
    "Satin": ["Fabric Reuse", "Upcycling", "Donation"],
    "Chenille": ["Mechanical Recycling", "Upcycling"],
    "Corduroy": ["Mechanical Recycling", "Fabric Reuse"],
    "Crepe": ["Fabric Reuse", "Donation", "Upcycling"],
    "Terrycloth": ["Mechanical Recycling", "Industrial Recovery"],
    "Velvet": ["Upcycling", "Fabric Reuse"],
}


def assess_recyclability(
    material_result: dict,
    defect_result: dict,
    texture_result: dict,
    pattern_result: dict,
) -> dict:
    """
    Generate a full recyclability assessment and set of recommendations.
    """
    material = material_result.get("predicted_material", "Unknown")
    condition = defect_result.get("condition", "Good")
    defect_count = defect_result.get("defect_count", 0)
    confidence = material_result.get("confidence", 0)

    # Get material-specific recycling options
    options = MATERIAL_RECYCLING_MAP.get(material, ["Mechanical Recycling", "Industrial Recovery"])

    # Adjust options based on condition
    if condition == "Good":
        primary_strategy = "Fabric Reuse" if "Fabric Reuse" in options else options[0]
        reuse_opportunity = "High — material is in excellent condition for direct reuse or donation."
    elif condition == "Fair":
        primary_strategy = options[0] if options else "Mechanical Recycling"
        reuse_opportunity = "Moderate — minor repairs may extend useful life before recycling."
    else:
        primary_strategy = (
            "Mechanical Recycling" if "Mechanical Recycling" in options
            else "Industrial Recovery"
        )
        reuse_opportunity = "Low — material degradation limits direct reuse options."

    # Generate upcycling suggestion
    upcycling_suggestion = _get_upcycling_suggestion(material, condition)

    # Material recovery recommendation
    material_recovery = _get_material_recovery(material, options)

    # Waste reduction strategies
    waste_reduction = _get_waste_reduction_strategies(material, condition, defect_count)

    return {
        "recycling_options": options,
        "primary_recycling_strategy": primary_strategy,
        "strategy_description": RECYCLING_OPTIONS.get(primary_strategy, ""),
        "reuse_opportunity": reuse_opportunity,
        "upcycling_suggestion": upcycling_suggestion,
        "material_recovery_recommendation": material_recovery,
        "waste_reduction_strategies": waste_reduction,
        "reuse_potential": _rate_reuse_potential(condition, defect_count),
    }


def _rate_reuse_potential(condition: str, defect_count: int) -> str:
    if condition == "Good" and defect_count == 0:
        return "High"
    if condition == "Fair" or defect_count <= 2:
        return "Medium"
    return "Low"


def _get_upcycling_suggestion(material: str, condition: str) -> str:
    suggestions = {
        "Denim": "Cut into patches for bags, jackets, or decorative accessories.",
        "Wool": "Felt into home insulation panels or craft projects.",
        "Cotton": "Weave into reusable shopping bags or cleaning rags.",
        "Silk": "Re-cut into scarves, linings, or decorative cushion covers.",
        "Leather": "Transform into wallets, belts, or bookmarks.",
        "Velvet": "Repurpose into jewelry pouches or decorative pillows.",
        "Fleece": "Cut into strips for stuffing or pet toys.",
    }
    base = suggestions.get(material, "Transform into insulation fill or industrial padding material.")
    if condition == "Poor":
        base += " Even degraded sections can be shredded for composite material."
    return base


def _get_material_recovery(material: str, options: list) -> str:
    if "Fiber Recycling" in options:
        return (
            f"{material} fiber can be mechanically shredded and respun into "
            f"lower-grade yarn suitable for industrial textiles."
        )
    if "Chemical Recycling" in options:
        return (
            f"{material} can be chemically dissolved to recover base monomers "
            f"for reuse in new polymer production."
        )
    return (
        f"{material} is suitable for industrial recovery as insulation, "
        f"padding, or composite filler material."
    )


def _get_waste_reduction_strategies(
    material: str, condition: str, defect_count: int
) -> list:
    strategies = [
        "Implement textile take-back programs to capture end-of-life materials.",
        "Partner with certified recycling facilities to ensure proper material recovery.",
    ]
    if condition in ("Good", "Fair"):
        strategies.append(
            "Prioritize donation or resale to extend the garment lifecycle before recycling."
        )
    if defect_count > 0:
        strategies.append(
            "Invest in quality control during production to reduce defect rates."
        )
    strategies.append(
        f"Design new {material} products for disassembly to simplify future recycling."
    )
    return strategies