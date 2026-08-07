NON_DIVERTED_STATUSES = {"Hazardous"}

def analyze_waste_diversion(scan_docs: list[dict]) -> dict:
    if not scan_docs:
        return {
            "item_count": 0,
            "diversion_rate_pct": 0,
            "diverted_count": 0,
            "non_diverted_count": 0,
            "by_material": [],
        }

    diverted = 0
    non_diverted = 0
    by_material: dict = {}

    for doc in scan_docs:
        analysis = doc.get("analysis") or {}
        material_label = (analysis.get("material_type") or {}).get("label") or "Mixed/Unknown"
        status_label = (analysis.get("waste_status") or {}).get("label") or "Recyclable"

        bucket = by_material.setdefault(material_label, {
            "material_type": material_label,
            "total": 0,
            "diverted": 0,
        })
        bucket["total"] += 1

        if status_label in NON_DIVERTED_STATUSES:
            non_diverted += 1
        else:
            diverted += 1
            bucket["diverted"] += 1

    total = diverted + non_diverted
    for bucket in by_material.values():
        bucket["diversion_rate_pct"] = round((bucket["diverted"] / bucket["total"]) * 100, 1) if bucket["total"] else 0

    return {
        "item_count": total,
        "diversion_rate_pct": round((diverted / total) * 100, 1) if total else 0,
        "diverted_count": diverted,
        "non_diverted_count": non_diverted,
        "by_material": sorted(by_material.values(), key=lambda b: -b["total"]),
    }