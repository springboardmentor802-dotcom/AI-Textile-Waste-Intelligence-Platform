from typing import Optional

def _pct_change(current: float, previous: float) -> Optional[float]:
    if previous == 0:
        return None
    return round(((current - previous) / previous) * 100, 1)

def benchmark_periods(current_metrics: dict, previous_metrics: dict, industry_baseline: Optional[dict] = None) -> dict:
    comparison = {
        "co2e_avoided_kg": {
            "current": current_metrics.get("total_co2e_avoided_kg", 0),
            "previous": previous_metrics.get("total_co2e_avoided_kg", 0),
            "change_pct": _pct_change(
                current_metrics.get("total_co2e_avoided_kg", 0),
                previous_metrics.get("total_co2e_avoided_kg", 0),
            ),
        },
        "water_saved_l": {
            "current": current_metrics.get("total_water_saved_l", 0),
            "previous": previous_metrics.get("total_water_saved_l", 0),
            "change_pct": _pct_change(
                current_metrics.get("total_water_saved_l", 0),
                previous_metrics.get("total_water_saved_l", 0),
            ),
        },
        "landfill_diverted_kg": {
            "current": current_metrics.get("total_landfill_diverted_kg", 0),
            "previous": previous_metrics.get("total_landfill_diverted_kg", 0),
            "change_pct": _pct_change(
                current_metrics.get("total_landfill_diverted_kg", 0),
                previous_metrics.get("total_landfill_diverted_kg", 0),
            ),
        },
        "item_count": {
            "current": current_metrics.get("item_count", 0),
            "previous": previous_metrics.get("item_count", 0),
            "change_pct": _pct_change(
                current_metrics.get("item_count", 0),
                previous_metrics.get("item_count", 0),
            ),
        },
    }

    if industry_baseline:
        comparison["industry_baseline"] = industry_baseline

    return comparison