import sys
import os
import time
import uuid
from datetime import date, datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
import jwt
from bson import ObjectId
from bson.errors import InvalidId
from pydantic import BaseModel

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml_engine.serve import analyze_image
from ml_engine.recyclability_engine import assess_recyclability

from database import ai_logs_collection, waste_batches_collection
from security import decode_access_token

VALID_CONDITIONS = [
    "Recyclable",
    "Reusable",
    "Repairable",
    "Upcyclable",
    "Compostable",
    "Hazardous",
]
from report_generator import (
    generate_excel_report,
    generate_pdf_report,
    generate_single_scan_pdf_report,
    generate_batch_pdf_report,
)

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE_MB = 10

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return {"email": payload.get("sub"), "role": payload.get("role", "user")}

class ClassificationResult(BaseModel):
    label: Optional[str] = None
    confidence: Optional[float] = None

class TextureResult(BaseModel):
    label: str
    laplacian_variance: Optional[float] = None

class PatternResult(BaseModel):
    label: str
    mean_edge_energy: Optional[float] = None
    dominant_orientation_ratio: Optional[float] = None

class VisualFeatures(BaseModel):
    color_analysis: dict
    texture: Optional[TextureResult] = None
    pattern: Optional[PatternResult] = None

class AnalysisPayload(BaseModel):
    garment_type: Optional[ClassificationResult] = None
    material_type: Optional[ClassificationResult] = None
    waste_status: Optional[ClassificationResult] = None
    visual_features: VisualFeatures

class RecyclabilityPayload(BaseModel):
    circularity_score: float
    circularity_category: str
    waste_category: str
    recommended_recycling_option: str
    waste_reduction_tips: list[str] = []
    component_scores: dict
    inputs_used: dict

class AnalyzeResponse(BaseModel):
    scan_id: Optional[str] = None
    filename: str
    analysis: AnalysisPayload
    recyclability: RecyclabilityPayload

class BatchSummary(BaseModel):
    total_processed: int
    average_circularity_score: float
    dominant_material: str
    material_breakdown: dict

class BatchAnalyzeResponse(BaseModel):
    batch_id: Optional[str] = None
    batch_label: Optional[str] = None
    results: List[AnalyzeResponse]
    summary: BatchSummary

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
            f"Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"File too large. Max size is {MAX_FILE_SIZE_MB}MB."
        )

    try:
        analysis = analyze_image(image_bytes)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not process image: {exc}")

    recyclability = assess_recyclability(analysis)

    scan_id = None
    try:
        insert_result = await ai_logs_collection.insert_one(
            {
                "user_email": current_user["email"],
                "filename": file.filename,
                "content_type": file.content_type,
                "analysis": analysis,
                "recyclability": recyclability,
                "created_at": time.time(),
            }
        )
        scan_id = str(insert_result.inserted_id)
    except Exception as exc:
        print(f"[ml_endpoints] warning: failed to log scan to ai_logs_collection: {exc}")

    return {
        "scan_id": scan_id,
        "filename": file.filename,
        "analysis": analysis,
        "recyclability": recyclability,
    }

@router.post("/analyze/batch", response_model=BatchAnalyzeResponse)
async def analyze_batch(
    files: list[UploadFile] = File(...),
    batch_id: Optional[str] = Form(None),
    label: Optional[str] = Form(None),
    source: Optional[str] = Form(None),
    quantity_kg: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
):
    if len(files) > 30:
        raise HTTPException(status_code=400, detail="Maximum 30 files allowed per batch request.")

    is_existing_batch = bool(batch_id and batch_id.strip())
    clean_label = (label or "").strip() or None
    batch_meta = {
        "source": source,
        "quantity_kg": quantity_kg,
        "notes": notes,
        "label": clean_label,
    }

    processed = []
    for file in files:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            continue

        image_bytes = await file.read()
        if not image_bytes or len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
            continue

        try:
            analysis = analyze_image(image_bytes)
            recyclability = assess_recyclability(analysis)
            processed.append({
                "filename": file.filename,
                "content_type": file.content_type,
                "analysis": analysis,
                "recyclability": recyclability,
            })
        except Exception as exc:
            print(f"[ml_endpoints] error processing {file.filename}: {exc}")
            continue

    if not processed:
        raise HTTPException(status_code=400, detail="No valid images could be processed in this batch.")

    avg_circularity = 0.0
    materials_count: dict = {}
    conditions_count: dict = {}
    for item in processed:
        avg_circularity += item["recyclability"]["circularity_score"]

        mat_label = item["analysis"]["material_type"]["label"] if item["analysis"].get("material_type") else "Unknown"
        materials_count[mat_label] = materials_count.get(mat_label, 0) + 1

        cond_label = item["analysis"]["waste_status"]["label"] if item["analysis"].get("waste_status") else None
        if cond_label:
            conditions_count[cond_label] = conditions_count.get(cond_label, 0) + 1

    dominant_material = max(materials_count, key=materials_count.get) if materials_count else "Unknown"
    dominant_condition = max(conditions_count, key=conditions_count.get) if conditions_count else "Recyclable"
    if dominant_condition not in VALID_CONDITIONS:
        dominant_condition = "Recyclable"

    is_multi_image_upload = len(processed) > 1
    should_create_new_batch = (not is_existing_batch) and is_multi_image_upload

    resolved_batch_id = batch_id.strip() if is_existing_batch else None
    resolved_batch_label = clean_label

    if is_existing_batch and not resolved_batch_label:
        try:
            existing_doc = await waste_batches_collection.find_one({"_id": ObjectId(resolved_batch_id)})
        except (InvalidId, TypeError):
            existing_doc = None
        if existing_doc:
            resolved_batch_label = existing_doc.get("reference_label") or (
                f"{existing_doc.get('fabric_type', 'Batch')} · {existing_doc.get('source', '')}".strip(" ·")
            )

    if should_create_new_batch:
        inventory_payload = {
            "fabric_type": dominant_material if dominant_material != "Unknown" else "Mixed/Unknown",
            "source": (source or "").strip() or "AI Scan Intake",
            "quantity_kg": quantity_kg if quantity_kg and quantity_kg > 0 else round(0.5 * len(processed), 2),
            "color": None,
            "condition": dominant_condition,
            "collection_date": date.today().isoformat(),
            "notes": notes,
            "reference_label": clean_label,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        try:
            insert_result = await waste_batches_collection.insert_one(inventory_payload)
            resolved_batch_id = str(insert_result.inserted_id)
        except Exception as exc:
            print(f"[ml_endpoints] warning: failed to auto-register inventory batch: {exc}")
            resolved_batch_id = f"batch-{uuid.uuid4().hex[:10]}"
    if not resolved_batch_id:
        resolved_batch_label = None


    docs_to_insert = []
    for item in processed:
        docs_to_insert.append({
            "user_email": current_user["email"],
            "filename": item["filename"],
            "content_type": item["content_type"],
            "analysis": item["analysis"],
            "recyclability": item["recyclability"],
            "created_at": time.time(),
            "batch_id": resolved_batch_id,
            "batch_meta": batch_meta if resolved_batch_id else None,
        })

    inserted_ids = []
    try:
        insert_result = await ai_logs_collection.insert_many(docs_to_insert)
        inserted_ids = [str(uid) for uid in insert_result.inserted_ids]
    except Exception as exc:
        print(f"[ml_endpoints] warning: failed to log batch array: {exc}")

    response_results = []
    for i, doc in enumerate(docs_to_insert):
        scan_id = inserted_ids[i] if inserted_ids else None
        response_results.append(AnalyzeResponse(
            scan_id=scan_id,
            filename=doc["filename"],
            analysis=doc["analysis"],
            recyclability=doc["recyclability"]
        ))

    summary = BatchSummary(
        total_processed=len(docs_to_insert),
        average_circularity_score=round(avg_circularity / len(docs_to_insert), 1),
        dominant_material=dominant_material,
        material_breakdown=materials_count
    )

    return BatchAnalyzeResponse(
        batch_id=resolved_batch_id,
        batch_label=resolved_batch_label,
        results=response_results,
        summary=summary
    )

@router.get("/history")
async def get_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
):
    limit = max(1, min(limit, 200))
    query = {} if current_user.get("role") == "Admin" else {"user_email": current_user["email"]}

    history = []
    cursor = ai_logs_collection.find(query).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
    return history

@router.get("/history/batches")
async def get_history_grouped_by_batch(
    limit: int = 500,
    current_user: dict = Depends(get_current_user),
):
    limit = max(1, min(limit, 1000))
    query = {} if current_user.get("role") == "Admin" else {"user_email": current_user["email"]}

    docs = []
    cursor = ai_logs_collection.find(query).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        docs.append(doc)

    groups: dict = {}
    order: list = []
    for doc in docs:
        key = doc.get("batch_id") or f"__single__{doc['_id']}"
        if key not in groups:
            groups[key] = {
                "batch_id": doc.get("batch_id"),
                "batch_meta": doc.get("batch_meta"),
                "scans": [],
            }
            order.append(key)
        groups[key]["scans"].append(doc)

    result = []
    for key in order:
        group = groups[key]
        scans = group["scans"]
        scores = [
            s["recyclability"]["circularity_score"]
            for s in scans
            if s.get("recyclability", {}).get("circularity_score") is not None
        ]
        materials_count: dict = {}
        for s in scans:
            mat = (s.get("analysis", {}).get("material_type") or {}).get("label") or "Unknown"
            materials_count[mat] = materials_count.get(mat, 0) + 1
        created_ats = [s["created_at"] for s in scans if s.get("created_at")]

        result.append({
            "batch_id": group["batch_id"],
            "batch_meta": group["batch_meta"],
            "is_batch": group["batch_id"] is not None,
            "count": len(scans),
            "average_circularity_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "dominant_material": max(materials_count, key=materials_count.get) if materials_count else "Unknown",
            "earliest_created_at": min(created_ats) if created_ats else None,
            "latest_created_at": max(created_ats) if created_ats else None,
            "scans": scans,
        })

    return result

@router.get("/export/pdf")
async def export_pdf(
    limit: int = 200,
    current_user: dict = Depends(get_current_user),
):
    limit = max(1, min(limit, 500))
    query = {} if current_user.get("role") == "Admin" else {"user_email": current_user["email"]}

    docs = []
    cursor = ai_logs_collection.find(query).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        docs.append(doc)

    if not docs:
        raise HTTPException(status_code=404, detail="No scans to export yet.")

    buffer = generate_pdf_report(docs, current_user.get("email") or "user")
    filename = f"waste_classification_report_{int(time.time())}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/export/excel")
async def export_excel(
    limit: int = 500,
    current_user: dict = Depends(get_current_user),
):
    limit = max(1, min(limit, 1000))
    query = {} if current_user.get("role") == "Admin" else {"user_email": current_user["email"]}

    docs = []
    cursor = ai_logs_collection.find(query).sort("created_at", -1).limit(limit)
    async for doc in cursor:
        docs.append(doc)

    if not docs:
        raise HTTPException(status_code=404, detail="No scans to export yet.")

    buffer = generate_excel_report(docs)
    filename = f"waste_classification_report_{int(time.time())}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

async def _get_scan_or_404(scan_id: str, current_user: dict) -> dict:
    try:
        object_id = ObjectId(scan_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid scan id.")

    query = {"_id": object_id}
    if current_user.get("role") != "Admin":
        query["user_email"] = current_user["email"]

    doc = await ai_logs_collection.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return doc

@router.get("/export/pdf/batch/{batch_id}")
async def export_batch_pdf(
    batch_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Single combined PDF covering every scan that shares this batch_id."""
    query = {"batch_id": batch_id}
    if current_user.get("role") != "Admin":
        query["user_email"] = current_user["email"]

    docs = []
    cursor = ai_logs_collection.find(query).sort("created_at", 1)
    async for doc in cursor:
        docs.append(doc)

    if not docs:
        raise HTTPException(status_code=404, detail="No scans found for this batch.")

    buffer = generate_batch_pdf_report(docs, batch_id, current_user.get("email") or "user")
    filename = f"waste_batch_report_{batch_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/export/pdf/{scan_id}")
async def export_single_pdf(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
):
    doc = await _get_scan_or_404(scan_id, current_user)

    buffer = generate_single_scan_pdf_report(doc, current_user.get("email") or "user")
    filename = f"waste_classification_report_{scan_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/export/excel/{scan_id}")
async def export_single_excel(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
):
    doc = await _get_scan_or_404(scan_id, current_user)

    buffer = generate_excel_report([doc])
    filename = f"waste_classification_report_{scan_id}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.get("/health")
async def health():
    from ml_engine.serve import _loaded

    return {
        task: {"loaded": model is not None}
        for task, (model, _labels) in _loaded.items()
    }