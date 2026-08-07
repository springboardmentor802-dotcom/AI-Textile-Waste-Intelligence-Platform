from typing import Optional

MATERIAL_RECYCLABILITY = {
    "Cotton": 85,
    "Linen": 80,
    "Denim": 78,
    "Polyester": 75,
    "Wool": 70,
    "Nylon": 65,
    "Viscose": 60,
    "Silk": 55,
    "Leather": 40,
    "Acrylic": 65,
    "Mixed Fabrics": 45,
    "Mixed/Unknown": 30,
}

MATERIAL_ENVIRONMENTAL_BENEFIT = {
    "Polyester": 80,   
    "Nylon": 78,
    "Denim": 72,
    "Cotton": 70,     
    "Linen": 68,
    "Wool": 65,
    "Viscose": 60,
    "Silk": 50,
    "Leather": 45,
    "Acrylic": 65,
    "Mixed Fabrics": 50,
    "Mixed/Unknown": 40,
}

MATERIAL_PROCESSING_FEASIBILITY = {
    "Polyester": 80,   
    "Cotton": 78,
    "Denim": 75,
    "Linen": 72,
    "Wool": 70,
    "Nylon": 68,
    "Viscose": 60,
    "Silk": 55,
    "Leather": 35,     
    "Acrylic": 65,
    "Mixed Fabrics": 45,
    "Mixed/Unknown": 25,  
}

WASTE_CONDITION_SCORE = {
    "Reusable": 90,
    "Repairable": 80,
    "Upcyclable": 70,
    "Recyclable": 75,
    "Compostable": 50,
    "Hazardous": 10,
    "Degraded": 35, 
}

MATERIAL_REDUCTION_TIPS = {
    "Cotton": "Cotton scraps can be shredded into rags or insulation before being sent to virgin-fiber recycling, cutting down on landfill volume.",
    "Linen": "Linen fibers are strong even after multiple wears -- prioritize reuse/resale over recycling to keep the fiber's full lifespan value.",
    "Denim": "Batch denim separately from lighter cottons; its density makes it a strong candidate for insulation or mechanical recycling at scale.",
    "Polyester": "Group polyester items for chemical recycling runs -- small individual batches are inefficient, so accumulate volume before processing.",
    "Wool": "Wool biodegrades and can be composted in small amounts if free of synthetic blends; check for blend labels before composting.",
    "Nylon": "Nylon (especially hosiery/activewear) can go to specialized fiber-to-fiber recyclers -- avoid mixing with cotton to prevent blend contamination.",
    "Viscose": "Viscose/rayon breaks down like cotton but should be kept separate from synthetic blends to preserve fiber recycling quality.",
    "Silk": "Silk holds resale value even when worn -- route to reuse/resale channels first, and only recycle pieces with visible damage.",
    "Leather": "Leather doesn't biodegrade quickly and can't be mechanically recycled with textiles -- route to dedicated industrial leather recovery.",
    "Acrylic": "Acrylic sheds microplastics when laundered -- prioritize donation/reuse over disposal to extend its life before it enters a waste stream.",
    "Mixed Fabrics": "Blended items are the hardest to recycle -- consider upcycling into new products rather than routing to single-fiber recycling streams.",
    "Mixed/Unknown": "Unknown composition limits recycling options -- when possible, check garment labels before sorting to route it more precisely.",
}

CONDITION_REDUCTION_TIPS = {
    "Reusable": "Prioritize donation or resale channels immediately -- reusable items diverted straight to recycling waste embedded value.",
    "Repairable": "Route to a repair program before recycling; a simple repair keeps the item in circulation far longer than material recovery would.",
    "Upcyclable": "Batch upcyclable items with similar materials/colors so they can be redesigned into new products together.",
    "Recyclable": "Bundle by material type before sending to recycling partners -- pre-sorted batches process faster and yield higher-quality output.",
    "Compostable": "Compost only natural fibers with no synthetic trims, buttons, or zippers -- remove hardware first to avoid contaminating compost.",
    "Hazardous": "Isolate immediately from other batches and route to industrial recovery -- treat as a contamination risk to any co-mingled material.",
    "Degraded": "Degraded items typically can't be reused -- fiber-recycle if the material is still identifiable, otherwise dispose responsibly.",
}

DEFECT_TYPE_TIPS = {
    "Stain": "A stain alone often doesn't disqualify an item from resale -- try spot-treating or laundering before routing elsewhere.",
    "Hole": "Small holes can be patched or mended for the repair pipeline; larger or multiple holes are better routed to recycling instead of resale.",
    "Broken Stitch": "A broken stitch is usually a quick fix -- strong candidate for the repair/refurbish pipeline rather than recycling.",
    "Needle Mark": "Typically a minor cosmetic defect that doesn't affect wearability -- fine for resale as-is or with light mending.",
    "Pinched Fabric": "Check whether the fabric pull can be steamed or brushed out; if it's permanent, treat it as cosmetic-only and still resalable.",
    "Weave Defect": "An irregularity in the weave itself is structural, not cosmetic -- consider lower-tier resale or recycling depending on severity.",
    "Defect Free": "No visible defect detected -- this supports routing the item toward the highest-value channel (reuse/resale) available.",
}

DEFECT_CONFIDENCE_THRESHOLD = 0.55

STATUSES_EXPECTING_NO_DEFECT = {"Reusable"}

def get_waste_reduction_tips(material_label: str, condition_label: str) -> list[str]:
    tips = []
    material_tip = MATERIAL_REDUCTION_TIPS.get(material_label)
    if material_tip:
        tips.append(material_tip)
    condition_tip = CONDITION_REDUCTION_TIPS.get(condition_label)
    if condition_tip:
        tips.append(condition_tip)
    return tips

def determine_recycling_option(material_label: str, waste_status: str) -> str:
    if waste_status == "Reusable":
        return "Donation"
    elif waste_status == "Repairable":
        return "Fabric Reuse"
    elif waste_status == "Upcyclable":
        return "Upcycling"
    elif waste_status == "Compostable":
        return "Fiber Recycling"
    elif waste_status == "Hazardous":
        return "Industrial Recovery"
    
    mechanical_materials = ("Cotton", "Linen", "Denim")
    chemical_materials = ("Polyester", "Nylon", "Acrylic")
    fiber_materials = ("Wool", "Viscose")
    
    if material_label in mechanical_materials:
        return "Mechanical Recycling"
    elif material_label in chemical_materials:
        return "Chemical Recycling"
    elif material_label in fiber_materials:
        return "Fiber Recycling"
    elif material_label == "Silk":
        return "Fabric Reuse"
    elif material_label == "Leather":
        return "Industrial Recovery"
    else:
        return "Fiber Recycling"

CIRCULARITY_CATEGORIES = [
    (85, "Excellent Recovery Potential"),
    (70, "High Recovery Potential"),
    (50, "Moderate Recovery Potential"),
    (30, "Limited Recovery Potential"),
    (0, "Disposal Recommended"),
]

WEIGHTS = {
    "recyclability_score": 0.35,
    "material_condition": 0.20,
    "reuse_score": 0.20,
    "sustainability_score": 0.15,
    "material_recovery_score": 0.10,
}

def _category_for_score(score: float) -> str:
    for threshold, label in CIRCULARITY_CATEGORIES:
        if score >= threshold:
            return label
    return CIRCULARITY_CATEGORIES[-1][1]

def _reuse_score(condition_score: float, garment_type: Optional[str]) -> float:
    base = condition_score
    if garment_type == "Other":
        base *= 0.85
    return round(base, 1)

def _apply_defect_insight(
    result: dict,
    defect_analysis: Optional[dict],
    condition_label: str,
) -> None:
    if not defect_analysis:
        result["defect_detected"] = None
        return

    defect_info = defect_analysis.get("defect_type") or {}
    defect_label = defect_info.get("label")
    defect_confidence = defect_info.get("confidence")

    if not defect_label or defect_confidence is None or defect_confidence < DEFECT_CONFIDENCE_THRESHOLD:
        result["defect_detected"] = None
        return

    result["defect_detected"] = {"label": defect_label, "confidence": defect_confidence}

    defect_tip = DEFECT_TYPE_TIPS.get(defect_label)
    if defect_tip:
        result["waste_reduction_tips"].append(defect_tip)

    if defect_label != "Defect Free" and condition_label in STATUSES_EXPECTING_NO_DEFECT:
        result["inspection_flag"] = (
            f"Waste status suggests '{condition_label}' but a '{defect_label}' defect was "
            f"detected (confidence {round(defect_confidence, 2)}) -- consider manual review "
            f"before routing to a high-value channel."
        )

def assess_recyclability(analysis: dict, defect_analysis: Optional[dict] = None) -> dict:
    garment = analysis.get("garment_type") or {}
    material = analysis.get("material_type") or {}
    waste = analysis.get("waste_status") or {}

    garment_label = garment.get("label")
    material_label = material.get("label") or "Mixed/Unknown"
    condition_label = waste.get("label") or "Recyclable"  

    recyclability_score = MATERIAL_RECYCLABILITY.get(material_label, MATERIAL_RECYCLABILITY["Mixed/Unknown"])
    sustainability_score = MATERIAL_ENVIRONMENTAL_BENEFIT.get(material_label, MATERIAL_ENVIRONMENTAL_BENEFIT["Mixed/Unknown"])
    material_recovery_score = MATERIAL_PROCESSING_FEASIBILITY.get(material_label, MATERIAL_PROCESSING_FEASIBILITY["Mixed/Unknown"])
    condition_score = WASTE_CONDITION_SCORE.get(condition_label, WASTE_CONDITION_SCORE["Recyclable"])
    reuse_score = _reuse_score(condition_score, garment_label)

    circularity_score = round(
        recyclability_score * WEIGHTS["recyclability_score"]
        + condition_score * WEIGHTS["material_condition"]
        + reuse_score * WEIGHTS["reuse_score"]
        + sustainability_score * WEIGHTS["sustainability_score"]
        + material_recovery_score * WEIGHTS["material_recovery_score"],
        1,
    )

    category = _category_for_score(circularity_score)
    waste_category = condition_label
    if waste_category not in ["Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable", "Hazardous"]:
        waste_category = "Recyclable"

    recommended_option = determine_recycling_option(material_label, condition_label)
    waste_reduction_tips = get_waste_reduction_tips(material_label, condition_label)

    result = {
        "circularity_score": circularity_score,
        "circularity_category": category,
        "waste_category": waste_category,
        "recommended_recycling_option": recommended_option,
        "waste_reduction_tips": waste_reduction_tips,
        "component_scores": {
            "recyclability_score": recyclability_score,
            "reuse_score": reuse_score,
            "sustainability_score": sustainability_score,
            "material_recovery_score": material_recovery_score,
        },
        "inputs_used": {
            "garment_type": garment_label,
            "material_type": material_label,
            "waste_status": condition_label,
        },
    }

    _apply_defect_insight(result, defect_analysis, condition_label)
    if defect_analysis:
        result["inputs_used"]["defect_type"] = (defect_analysis.get("defect_type") or {}).get("label")

    return result

if __name__ == "__main__":
    import sys
    import json
    from serve import analyze_image, analyze_defects

    if len(sys.argv) != 2:
        print("Usage: python recyclability_engine.py <image_path>")
    else:
        with open(sys.argv[1], "rb") as f:
            image_bytes = f.read()
        analysis = analyze_image(image_bytes)
        defect_analysis = analyze_defects(image_bytes)
        result = assess_recyclability(analysis, defect_analysis)
        print(json.dumps({"analysis": analysis, "defect_analysis": defect_analysis, "recyclability": result}, indent=2))