LOOP_TIER = {
    "Donation": "Reuse",
    "Fabric Reuse": "Reuse",
    "Upcycling": "Repair/Refurbish",
    "Mechanical Recycling": "Recycling",
    "Chemical Recycling": "Recycling",
    "Fiber Recycling": "Recycling",
    "Industrial Recovery": "Disposal/Recovery",
}

LOOP_TIER_WEIGHT = {
    "Reuse": 100,
    "Repair/Refurbish": 80,
    "Recycling": 55,
    "Disposal/Recovery": 15,
}

def analyze_circular_economy(scan_docs: list[dict]) -> dict:
    if not scan_docs:
        return {
            "item_count": 0,
            "average_circularity_score": 0,
            "fleet_circularity_index": 0,
            "loop_tier_breakdown": [],
            "recycling_option_breakdown": [],
        }

    circularity_scores = []
    loop_counts: dict = {}
    option_counts: dict = {}

    for doc in scan_docs:
        recyclability = doc.get("recyclability") or {}
        score = recyclability.get("circularity_score")
        if score is not None:
            circularity_scores.append(score)

        option = recyclability.get("recommended_recycling_option") or "Fiber Recycling"
        option_counts[option] = option_counts.get(option, 0) + 1

        tier = LOOP_TIER.get(option, "Recycling")
        loop_counts[tier] = loop_counts.get(tier, 0) + 1

    total_items = len(scan_docs)
    avg_circularity = round(sum(circularity_scores) / len(circularity_scores), 1) if circularity_scores else 0

    weighted_sum = sum(LOOP_TIER_WEIGHT.get(tier, 15) * count for tier, count in loop_counts.items())
    fleet_index = round(weighted_sum / total_items, 1) if total_items else 0

    loop_tier_breakdown = [
        {
            "tier": tier,
            "item_count": count,
            "percentage": round((count / total_items) * 100, 1),
        }
        for tier, count in sorted(loop_counts.items(), key=lambda kv: -kv[1])
    ]

    recycling_option_breakdown = [
        {
            "recycling_option": option,
            "item_count": count,
            "percentage": round((count / total_items) * 100, 1),
        }
        for option, count in sorted(option_counts.items(), key=lambda kv: -kv[1])
    ]

    return {
        "item_count": total_items,
        "average_circularity_score": avg_circularity,
        "fleet_circularity_index": fleet_index,
        "loop_tier_breakdown": loop_tier_breakdown,
        "recycling_option_breakdown": recycling_option_breakdown,
    }