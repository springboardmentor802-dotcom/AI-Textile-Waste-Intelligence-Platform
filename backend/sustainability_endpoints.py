import time
from typing import Optional
from fastapi import APIRouter, Depends, Query
from database import ai_logs_collection, waste_batches_collection
from ml_endpoints import get_current_user 
from sustainability.impact_calculator import aggregate_impact
from sustainability.circular_economy import analyze_circular_economy
from sustainability.waste_diversion import analyze_waste_diversion
from sustainability.benchmarking import benchmark_periods

router = APIRouter(prefix="/api/sustainability", tags=["Sustainability"])

SECONDS_PER_DAY = 86400

async def _fetch_scans_with_batch_weight(
    current_user: dict,
    start_time: float,
    end_time: float,
) -> list[dict]:
    query: dict = {"created_at": {"$gte": start_time, "$lt": end_time}}
    if current_user.get("role") not in ["Admin", "Sustainability Manager"]:
        query["user_email"] = current_user["email"]

    docs = [doc async for doc in ai_logs_collection.find(query)]

    batch_ids = {doc["batch_id"] for doc in docs if doc.get("batch_id")}
    batch_weights: dict = {}
    if batch_ids:
        async for batch_doc in waste_batches_collection.find({"_id": {"$in": list(_safe_object_ids(batch_ids))}}):
            batch_weights[str(batch_doc["_id"])] = batch_doc.get("quantity_kg")

    batch_item_counts: dict = {}
    for doc in docs:
        bid = doc.get("batch_id")
        if bid:
            batch_item_counts[bid] = batch_item_counts.get(bid, 0) + 1

    for doc in docs:
        bid = doc.get("batch_id")
        if bid and bid in batch_weights and batch_weights[bid]:
            doc["_batch_quantity_kg"] = batch_weights[bid]
            doc["_batch_item_count"] = batch_item_counts[bid]

    # Include all inventory batches from waste_batches_collection to ensure complete platform coverage
    batch_query: dict = {}
    if current_user.get("role") not in ["Admin", "Sustainability Manager"]:
        batch_query["user_email"] = current_user["email"]

    all_batches = [b async for b in waste_batches_collection.find(batch_query)]
    scanned_batch_ids = {str(doc.get("batch_id")) for doc in docs if doc.get("batch_id")}

    from ml_engine.recyclability_engine import assess_recyclability

    for bdoc in all_batches:
        b_id_str = str(bdoc["_id"])
        if b_id_str not in scanned_batch_ids:
            fabric = bdoc.get("fabric_type") or bdoc.get("label") or "Mixed/Unknown"
            cond = bdoc.get("condition") or "Recyclable"
            qty = bdoc.get("quantity_kg") or 10.0

            synth_analysis = {
                "material_type": {"label": fabric, "confidence": 0.95},
                "garment_type": {"label": "Scrap/Fabric", "confidence": 0.90},
                "waste_status": {"label": cond, "confidence": 0.90},
                "visual_features": {
                    "color_analysis": {"primary_color": bdoc.get("color") or "Mixed"},
                    "texture": {"label": "Standard"},
                    "pattern": {"label": "Solid"},
                },
            }
            synth_recyclability = assess_recyclability(synth_analysis)
            docs.append({
                "batch_id": b_id_str,
                "filename": f"Batch #{b_id_str[:6]}",
                "analysis": synth_analysis,
                "recyclability": synth_recyclability,
                "created_at": bdoc.get("created_at") or time.time(),
                "_batch_quantity_kg": qty,
                "_batch_item_count": 1,
            })

    return docs

def _safe_object_ids(ids):
    from bson import ObjectId
    from bson.errors import InvalidId
    for i in ids:
        try:
            yield ObjectId(i)
        except (InvalidId, TypeError):
            continue

@router.get("/batch/{batch_id}")
async def get_batch_sustainability_assessment(
    batch_id: str,
    current_user: dict = Depends(get_current_user),
):
    from bson import ObjectId
    from bson.errors import InvalidId
    from fastapi import HTTPException
    from ml_engine.recyclability_engine import assess_recyclability, _category_for_score
    from sustainability.impact_calculator import calculate_item_impact

    resolved_id = None
    try:
        resolved_id = ObjectId(batch_id)
    except (InvalidId, TypeError):
        resolved_id = batch_id

    batch_doc = await waste_batches_collection.find_one({"_id": resolved_id})
    if not batch_doc:
        batch_doc = await waste_batches_collection.find_one({"_id": str(batch_id)})

    batch_meta = None
    if batch_doc:
        batch_meta = {
            "batch_id": str(batch_doc["_id"]),
            "fabric_type": batch_doc.get("fabric_type") or batch_doc.get("label") or "Mixed/Unknown",
            "condition": batch_doc.get("condition") or "Recyclable",
            "quantity_kg": batch_doc.get("quantity_kg", 0.0),
            "source": batch_doc.get("source"),
            "color": batch_doc.get("color"),
            "notes": batch_doc.get("notes"),
            "created_at": batch_doc.get("created_at"),
        }

    scans_cursor = ai_logs_collection.find({"batch_id": batch_id})
    scans = [doc async for doc in scans_cursor]

    if not scans and batch_meta:
        synthetic_analysis = {
            "material_type": {"label": batch_meta["fabric_type"], "confidence": 0.95},
            "garment_type": {"label": "Other", "confidence": 0.90},
            "waste_status": {"label": batch_meta["condition"], "confidence": 0.90},
            "visual_features": {
                "color_analysis": {"primary_color": batch_meta.get("color") or "Mixed"},
                "texture": {"label": "Standard"},
                "pattern": {"label": "Solid"},
            },
        }
        recyclability = assess_recyclability(synthetic_analysis)
        impact = calculate_item_impact(
            {"analysis": synthetic_analysis, "recyclability": recyclability},
            batch_quantity_kg=batch_meta["quantity_kg"],
            batch_item_count=1,
        )

        return {
            "batch_id": batch_id,
            "batch_meta": batch_meta,
            "recyclability": recyclability,
            "impact": impact,
            "scan_count": 0,
            "scans": [],
        }

    if not scans and not batch_meta:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found.")

    total_circularity = 0.0
    total_co2e = 0.0
    total_water = 0.0
    total_landfill = 0.0
    total_weight = batch_meta.get("quantity_kg", 0.0) if batch_meta else 0.0
    scans_output = []

    for s in scans:
        rec = s.get("recyclability") or {}
        analysis = s.get("analysis") or {}
        imp = calculate_item_impact(
            s,
            batch_quantity_kg=batch_meta.get("quantity_kg") if batch_meta else None,
            batch_item_count=len(scans),
        )
        total_circularity += rec.get("circularity_score", 0.0)
        total_co2e += imp["co2e_avoided_kg"]
        total_water += imp["water_saved_l"]
        total_landfill += imp["landfill_diverted_kg"]
        if not batch_meta:
            total_weight += imp["weight_kg"]

        scans_output.append({
            "scan_id": str(s.get("_id")),
            "filename": s.get("filename", "Scan Item"),
            "analysis": analysis,
            "recyclability": rec,
            "impact": imp,
        })

    avg_circularity = round(total_circularity / len(scans), 1) if scans else 0.0
    sample_analysis = scans[0].get("analysis", {}) if scans else {}
    sample_recyclability = scans[0].get("recyclability", {}) if scans else {}

    component_scores = {
        "recyclability_score": round(sum((s.get("recyclability", {}).get("component_scores", {}).get("recyclability_score", 0) for s in scans)) / len(scans), 1),
        "reuse_score": round(sum((s.get("recyclability", {}).get("component_scores", {}).get("reuse_score", 0) for s in scans)) / len(scans), 1),
        "sustainability_score": round(sum((s.get("recyclability", {}).get("component_scores", {}).get("sustainability_score", 0) for s in scans)) / len(scans), 1),
        "material_recovery_score": round(sum((s.get("recyclability", {}).get("component_scores", {}).get("material_recovery_score", 0) for s in scans)) / len(scans), 1),
    }

    overall_category = _category_for_score(avg_circularity)

    return {
        "batch_id": batch_id,
        "batch_meta": batch_meta,
        "recyclability": {
            "circularity_score": avg_circularity,
            "circularity_category": overall_category,
            "waste_category": batch_meta.get("condition") if batch_meta else sample_recyclability.get("waste_category", "Recyclable"),
            "recommended_recycling_option": sample_recyclability.get("recommended_recycling_option", "Fiber Recycling"),
            "waste_reduction_tips": sample_recyclability.get("waste_reduction_tips", []),
            "component_scores": component_scores,
        },
        "impact": {
            "co2e_avoided_kg": round(total_co2e, 2),
            "water_saved_l": round(total_water, 1),
            "landfill_diverted_kg": round(total_landfill, 2),
            "weight_kg": round(total_weight, 2),
        },
        "scan_count": len(scans),
        "scans": scans_output,
    }

@router.get("/impact/summary")
async def get_impact_summary(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    now = time.time()
    start = now - days * SECONDS_PER_DAY
    docs = await _fetch_scans_with_batch_weight(current_user, start, now)
    return aggregate_impact(docs)

@router.get("/circular-economy")
async def get_circular_economy_analytics(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    now = time.time()
    start = now - days * SECONDS_PER_DAY
    docs = await _fetch_scans_with_batch_weight(current_user, start, now)
    return analyze_circular_economy(docs)

@router.get("/waste-diversion")
async def get_waste_diversion_analytics(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    now = time.time()
    start = now - days * SECONDS_PER_DAY
    docs = await _fetch_scans_with_batch_weight(current_user, start, now)
    return analyze_waste_diversion(docs)

@router.get("/benchmark")
async def get_benchmark(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    now = time.time()
    current_start = now - days * SECONDS_PER_DAY
    previous_start = current_start - days * SECONDS_PER_DAY

    current_docs = await _fetch_scans_with_batch_weight(current_user, current_start, now)
    previous_docs = await _fetch_scans_with_batch_weight(current_user, previous_start, current_start)

    current_metrics = aggregate_impact(current_docs)
    previous_metrics = aggregate_impact(previous_docs)

    return benchmark_periods(current_metrics, previous_metrics)

@router.get("/dashboard-summary")
async def get_dashboard_summary(
    days: int = Query(default=30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    now = time.time()
    current_start = now - days * SECONDS_PER_DAY
    previous_start = current_start - days * SECONDS_PER_DAY

    current_docs = await _fetch_scans_with_batch_weight(current_user, current_start, now)
    previous_docs = await _fetch_scans_with_batch_weight(current_user, previous_start, current_start)

    current_impact = aggregate_impact(current_docs)
    previous_impact = aggregate_impact(previous_docs)

    return {
        "period_days": days,
        "impact_summary": current_impact,
        "circular_economy": analyze_circular_economy(current_docs),
        "waste_diversion": analyze_waste_diversion(current_docs),
        "benchmark": benchmark_periods(current_impact, previous_impact),
    }