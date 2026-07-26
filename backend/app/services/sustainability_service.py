"""
Sustainability Intelligence Engine
Generates: Carbon Footprint, Waste Diversion Analysis,
Circular Economy Analysis, Resource Recovery, Sustainability Benchmarking
"""


# Carbon footprint values (kg CO2 saved per kg of material recycled)
MATERIAL_CARBON_FACTORS = {
    "Cotton": 5.9,
    "Polyester": 9.5,
    "Nylon": 7.9,
    "Wool": 36.0,
    "Silk": 15.0,
    "Acrylic": 7.0,
    "Linen": 3.5,
    "Denim": 6.0,
    "Viscose": 4.0,
    "Fleece": 8.5,
    "Leather": 17.0,
    "Blended": 6.5,
    "Satin": 5.0,
    "Velvet": 5.5,
    "Chenille": 4.5,
    "Corduroy": 5.8,
    "Crepe": 5.0,
    "Terrycloth": 5.5,
}

# Water saved per kg of material recycled (liters)
WATER_SAVINGS_FACTORS = {
    "Cotton": 10000,
    "Polyester": 3500,
    "Wool": 170000,
    "Silk": 7000,
    "Linen": 5000,
    "Nylon": 4200,
    "Acrylic": 3000,
    "Denim": 10000,
    "Viscose": 2500,
}


def generate_sustainability_report(
    material_result: dict,
    waste_category: dict,
    recyclability: dict,
) -> dict:
    """
    Generate a sustainability intelligence report from analysis outputs.
    """
    material = material_result.get("predicted_material", "Unknown")
    category = waste_category.get("waste_category", "Unknown")
    condition = waste_category.get("condition", "Unknown")
    reuse_potential = recyclability.get("reuse_potential", "Low")
    primary_strategy = recyclability.get("primary_recycling_strategy", "")

    # Estimate weight based on image analysis (default 1 kg for single image)
    estimated_weight_kg = 1.0

    # Carbon footprint estimation
    carbon_factor = MATERIAL_CARBON_FACTORS.get(material, 5.0)
    if condition == "Good":
        weight_factor = 1.0
    elif condition == "Fair":
        weight_factor = 0.7
    else:
        weight_factor = 0.4

    co2_saved_kg = round(carbon_factor * estimated_weight_kg * weight_factor, 2)
    water_saved_liters = round(
        WATER_SAVINGS_FACTORS.get(material, 3000) * estimated_weight_kg * weight_factor, 0
    )

    # Waste diversion analysis
    if category in ("Reusable", "Recyclable"):
        landfill_diversion = "High — This textile is diverted from landfill."
        diversion_rate = "90-100%"
    elif category in ("Repairable", "Upcyclable"):
        landfill_diversion = "Medium — Partial diversion from landfill through upcycling."
        diversion_rate = "60-85%"
    else:
        landfill_diversion = "Low — Limited landfill diversion potential."
        diversion_rate = "30-60%"

    # Circular economy analysis
    circular_economy_score = _calculate_circular_score(
        material, condition, reuse_potential, category
    )
    circular_analysis = _describe_circular_economy(circular_economy_score, material, primary_strategy)

    # Resource recovery estimation
    resource_recovery = _estimate_resource_recovery(material, condition)

    # Sustainability benchmark
    benchmark = _generate_benchmark(circular_economy_score)

    return {
        "carbon_footprint_estimation": {
            "co2_saved_kg": co2_saved_kg,
            "carbon_factor_per_kg": carbon_factor,
            "description": (
                f"Recycling this {material} textile saves approximately "
                f"{co2_saved_kg} kg of CO2 compared to producing virgin material."
            ),
        },
        "water_savings": {
            "liters_saved": int(water_saved_liters),
            "description": (
                f"Recycling {material} fabric conserves approximately "
                f"{int(water_saved_liters):,} liters of water."
            ),
        },
        "waste_diversion_analysis": {
            "landfill_diversion": landfill_diversion,
            "diversion_rate": diversion_rate,
            "category": category,
        },
        "circular_economy_analysis": {
            "score": circular_economy_score,
            "analysis": circular_analysis,
        },
        "resource_recovery_estimation": resource_recovery,
        "sustainability_benchmarking": benchmark,
    }


def _calculate_circular_score(
    material: str, condition: str, reuse_potential: str, category: str
) -> int:
    score = 50
    if condition == "Good":
        score += 25
    elif condition == "Fair":
        score += 10
    else:
        score -= 10

    if reuse_potential == "High":
        score += 15
    elif reuse_potential == "Medium":
        score += 7

    if category == "Reusable":
        score += 10
    elif category == "Recyclable":
        score += 7
    elif category == "Upcyclable":
        score += 4

    return min(100, max(0, score))


def _describe_circular_economy(score: int, material: str, strategy: str) -> str:
    if score >= 80:
        return (
            f"Excellent circular economy potential. {material} textile in this condition "
            f"supports a closed-loop material cycle through {strategy}."
        )
    if score >= 60:
        return (
            f"Good circular economy alignment. {strategy} can recover significant "
            f"value from this {material} textile."
        )
    if score >= 40:
        return (
            f"Moderate circular potential. While direct reuse is limited, "
            f"{strategy} prevents complete waste."
        )
    return (
        f"Limited circular economy options. Industrial recovery or composting "
        f"represents the best available end-of-life path for this material."
    )


def _estimate_resource_recovery(material: str, condition: str) -> dict:
    fiber_types = {
        "Cotton": "natural cellulosic fiber",
        "Wool": "natural protein fiber",
        "Polyester": "PET thermoplastic polymer",
        "Nylon": "polyamide polymer",
        "Acrylic": "acrylic polymer",
    }
    fiber_desc = fiber_types.get(material, "textile fiber")

    if condition == "Good":
        recovery_rate = "85-95%"
        value = "High — suitable for Grade A fiber recovery"
    elif condition == "Fair":
        recovery_rate = "60-80%"
        value = "Moderate — suitable for Grade B fiber or industrial applications"
    else:
        recovery_rate = "30-55%"
        value = "Low — suitable for industrial fill or energy recovery"

    return {
        "material_type": fiber_desc,
        "estimated_recovery_rate": recovery_rate,
        "recovery_value": value,
        "description": (
            f"{material} ({fiber_desc}) has an estimated resource recovery rate of "
            f"{recovery_rate} under current condition."
        ),
    }


def _generate_benchmark(score: int) -> dict:
    if score >= 80:
        rating = "Excellent"
        comparison = "Top 10% of textile waste circularity assessments."
    elif score >= 65:
        rating = "Good"
        comparison = "Above average — better than 65% of similar assessments."
    elif score >= 45:
        rating = "Fair"
        comparison = "Average circularity — room for improvement in collection and processing."
    else:
        rating = "Poor"
        comparison = "Below average — investment in better sorting and recycling infrastructure needed."

    return {
        "circularity_score": score,
        "rating": rating,
        "industry_comparison": comparison,
        "esg_relevance": (
            "This assessment supports ESG reporting under the EU Textile Strategy "
            "and Global Fashion Agenda circular economy targets."
        ),
    }