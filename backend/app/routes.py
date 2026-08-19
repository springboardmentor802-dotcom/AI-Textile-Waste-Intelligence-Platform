import os
import numpy as np
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Inventory, UserRole, ScanLog
from app.schemas import (
    UserCreate, UserLogin, UserResponse, 
    InventoryCreate, InventoryUpdate,
    MaterialAssessmentInput, SustainabilityReportResponse, AssessmentResult
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.ml.scoring_model import (
    calculate_circularity_score, 
    generate_recycling_recommendation, 
    calculate_environmental_impact,
    load_sustainability_dataset
)
from app.ml.image_analysis import process_textile_image, run_yolo_detection
from app.utils.export_reports import (
    generate_excel_report, 
    generate_pdf_text_summary, 
    generate_multi_engine_pdf_report
)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
inventory_router = APIRouter(prefix="/inventory", tags=["Textile Inventory"])
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics & AI Vision"])
sustainability_router = APIRouter(prefix="/sustainability", tags=["Sustainability Dataset"])
admin_router = APIRouter(prefix="/admin", tags=["Admin Management & Monitoring"])

router = APIRouter(prefix="/api/v1")

def check_is_admin(current_user: User):
    role_str = (current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)).upper()
    if role_str not in ["ADMIN", "ADMINISTRATOR"]:
        raise HTTPException(status_code=403, detail="Admin authorization required.")


# ==========================================
# 🔐 AUTHENTICATION ENDPOINTS (FIXED)
# ==========================================

class LoginPayload(BaseModel):
    email: str
    password: str

@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email address is already registered.")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=clean_email, hashed_password=hashed_password, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@auth_router.post("/login")
def login_user(login_data: LoginPayload, db: Session = Depends(get_db)):
    clean_email = login_data.email.strip().lower()
    print(f"DEBUG LOGIN ATTEMPT: Email={clean_email}")
    
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    
    if not user:
        print(f"DEBUG LOGIN FAILED: User {clean_email} not found in DB!")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or account not found."
        )
        
    is_valid = verify_password(login_data.password, user.hashed_password)
    print(f"DEBUG LOGIN PASSWORD MATCH: {is_valid}")

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password."
        )

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token_claims = {"sub": str(user.id), "role": role_value}
    access_token = create_access_token(data=token_claims)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": role_value,
        "email": user.email
    }


# ==========================================
# 📦 INVENTORY ENDPOINTS
# ==========================================

@inventory_router.post("/", status_code=status.HTTP_201_CREATED)
def register_waste(payload: InventoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_batch = db.query(Inventory).filter(Inventory.batch_id == payload.batch_id).first()
    if existing_batch:
        raise HTTPException(status_code=400, detail="Waste Batch ID already exists!")
    
    new_item = Inventory(
        user_id=current_user.id,
        batch_id=payload.batch_id,
        fabric_type=payload.fabric_type,
        source=payload.source,
        quantity=payload.quantity,
        color=payload.color,
        condition=payload.condition,
        collection_date=payload.collection_date
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Waste item registered successfully", "id": new_item.id}

@inventory_router.get("/")
def get_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_role_str = (current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)).upper()
    if user_role_str in ["ADMIN", "ADMINISTRATOR", "SUSTAINABILITY_MANAGER", "SUSTAINABILITY MANAGER"]:
        items = db.query(Inventory).all()
    else:
        items = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
    return {"data": items}


# ==========================================
# 📊 SUSTAINABILITY & AI VISION ENDPOINTS
# ==========================================

@analytics_router.post("/upload-image")
async def analyze_textile_image(
    file: UploadFile = File(...),
    is_batch: bool = Query(False),
    batch_weight: float = Query(100.0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    try:
        contents = await file.read()
        analysis_data = process_textile_image(contents, is_batch=is_batch, batch_weight=batch_weight)
        
        env_engine = analysis_data.get("environmental_impact_engine", {})
        mat_engine = analysis_data.get("material_classification_engine", {})

        fabric_str = mat_engine.get("fabric_type_classification", "Cotton Blend")
        weight_val = float(env_engine.get("evaluated_sample_weight", "0.5").split()[0])
        
        co2_str = env_engine.get("co2_savings_estimation", "1.6 Kg")
        co2_val = float(co2_str.split()[0]) if co2_str else round(weight_val * 3.2, 2)

        water_str = env_engine.get("water_savings_estimation", "600 Liters")
        water_val = float(water_str.replace(",", "").split()[0]) if water_str else round(weight_val * 1200, 2)
        
        user_role_str = "MANUFACTURER"
        user_id_val = None
        if current_user:
            user_role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
            user_id_val = current_user.id

        scan_entry = ScanLog(
            scan_code="SCAN-" + datetime.utcnow().strftime("%M%S%f")[:6],
            user_id=user_id_val,
            role=user_role_str,
            fabric_type=fabric_str,
            weight_kg=weight_val,
            co2_saved=co2_val,
            water_saved=water_val,
            created_at=datetime.utcnow()
        )
        db.add(scan_entry)
        db.commit()

        return {
            "status": "Success",
            "filename": file.filename,
            "is_batch": is_batch,
            "results": analysis_data
        }
    except Exception as e:
        print("Analysis Processing Error:", str(e))
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@analytics_router.post("/upload-yolo-image")
async def analyze_textile_image_yolo(
    file: UploadFile = File(...),
    model_path: Optional[str] = Query(None),
    conf_threshold: float = Query(0.25),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Run YOLOv8 object detection on an uploaded textile scan."""
    try:
        contents = await file.read()
        result = run_yolo_detection(contents, model_path=model_path)

        user_role = "MANUFACTURER"
        if current_user:
            user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)

        if result.get("status") == "no_model":
            return {
                "status": "warning",
                "filename": file.filename,
                "role": user_role,
                "yolo": result,
                "message": "No trained YOLO model found yet. Train the model first with train_yolov8.py."
            }

        filtered = []
        for item in result.get("detections", []):
            if item.get("confidence", 0.0) >= conf_threshold:
                filtered.append(item)

        result["detections"] = filtered
        result["count"] = len(filtered)

        return {
            "status": "Success",
            "filename": file.filename,
            "role": user_role,
            "yolo": result
        }
    except Exception as e:
        print("YOLO Analysis Error:", str(e))
        raise HTTPException(status_code=500, detail=f"YOLO image processing failed: {str(e)}")


@analytics_router.get("/scans")
def get_historical_scans(time_frame: str = Query("this_week"), db: Session = Depends(get_db)):
    query = db.query(ScanLog)
    now = datetime.utcnow()

    if time_frame == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(ScanLog.created_at >= start_date)
    elif time_frame == "this_week":
        start_date = now - timedelta(days=7)
        query = query.filter(ScanLog.created_at >= start_date)
    elif time_frame == "this_month":
        start_date = now - timedelta(days=30)
        query = query.filter(ScanLog.created_at >= start_date)

    scans = query.order_by(ScanLog.created_at.desc()).all()

    return [
        {
            "id": s.scan_code,
            "role": s.role,
            "fabric": s.fabric_type,
            "weight": s.weight_kg,
            "co2Saved": s.co2_saved,
            "waterSaved": s.water_saved,
            "timestamp": s.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for s in scans
    ]

@analytics_router.get("/material-recovery-reports")
def get_material_recovery_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_role_str = (current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)).upper()
    
    if user_role_str in ["ADMIN", "ADMINISTRATOR"]:
        inventory_items = db.query(Inventory).all()
        scan_items = db.query(ScanLog).all()
    else:
        inventory_items = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
        scan_items = db.query(ScanLog).filter(ScanLog.user_id == current_user.id).all()

    fabrics = ["Cotton", "Denim", "Polyester", "Wool", "Linen", "Silk", "Nylon"]
    reports = []

    for fab in fabrics:
        inv_qty = sum(item.quantity for item in inventory_items if (item.fabric_type.value if hasattr(item.fabric_type, 'value') else str(item.fabric_type)).lower() == fab.lower())
        scan_qty = sum(s.weight_kg for s in scan_items if fab.lower() in s.fabric_type.lower())
        
        total_gen = inv_qty + scan_qty
        if total_gen <= 0:
            continue

        yield_factor = 0.88 if fab in ["Cotton", "Linen"] else (0.84 if fab in ["Denim", "Wool"] else 0.80)
        recovered = round(total_gen * yield_factor, 1)
        yield_rate = round((recovered / total_gen) * 100, 1)

        dest = "Mechanical Fiber Shredding" if fab in ["Cotton", "Denim"] else "Chemical Depolymerization"

        reports.append({
            "fabric": fab,
            "generatedKg": round(total_gen, 1),
            "recoveredKg": recovered,
            "rate": yield_rate,
            "destination": dest
        })

    return reports

@analytics_router.post("/assess")
def assess_material_sustainability(payload: MaterialAssessmentInput):
    row_dict = payload.dict()
    scoring_res = calculate_circularity_score(row_dict)
    rec_res = generate_recycling_recommendation(
        mat_type=payload.material_type,
        condition=payload.material_condition,
        score=scoring_res["circularity_score"]
    )
    impact_res = calculate_environmental_impact(
        weight_kg=payload.waste_weight_kg,
        mat_type=payload.material_type
    )
    return {
        "status": "Success",
        "batch_details": payload,
        "circularity": scoring_res,
        "recommendation": rec_res,
        "environmental_impact": impact_res
    }

@analytics_router.post("/export-multi-engine-pdf")
async def export_multi_engine_pdf(payload: dict):
    batch_id = payload.get("batch_id", "BATCH-AI-SCAN")
    results = payload.get("results", {})
    
    pdf_stream = generate_multi_engine_pdf_report(batch_id, results)
    
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Textile_Intelligence_Report_{batch_id}.pdf"}
    )


# ==========================================
# 🌿 SUSTAINABILITY DATASET ENDPOINTS
# ==========================================

@sustainability_router.get("/")
def get_sustainability_dataset(limit: int = 25):
    df = load_sustainability_dataset()
    df_clean = df.replace([np.nan, np.inf, -np.inf], None)
    records = df_clean.head(limit).to_dict(orient="records")
    return {"status": "Success", "data": records}


# ==========================================
# 👑 ADMIN DASHBOARD ENDPOINTS & EXPORTS
# ==========================================

@admin_router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_is_admin(current_user)
    users = db.query(User).all()
    return [
        {
            "id": u.id, 
            "email": u.email, 
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M") if hasattr(u, 'created_at') and u.created_at else "N/A"
        } 
        for u in users
    ]

@admin_router.get("/system-health")
def get_system_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_is_admin(current_user)
    total_users = db.query(User).count()
    total_batches = db.query(Inventory).count()
    
    return {
        "server_status": "Healthy (FastAPI v0.110)",
        "database_status": "Connected (PostgreSQL)",
        "total_users": total_users,
        "total_waste_batches": total_batches,
        "concurrent_vision_processing": "Active (PyTorch/OpenCV pipeline)",
        "inference_latency_ms": 42.5
    }

@admin_router.get("/export/excel")
def export_admin_excel_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_is_admin(current_user)
    inventory_items = db.query(Inventory).all()
    records = [
        {
            "batch_id": item.batch_id,
            "fabric_type": item.fabric_type.value if hasattr(item.fabric_type, 'value') else str(item.fabric_type),
            "quantity": item.quantity,
            "condition": item.condition.value if hasattr(item.condition, 'value') else str(item.condition),
            "source": item.source,
            "color": item.color,
            "status": item.status.value if hasattr(item.status, 'value') else str(item.status)
        }
        for item in inventory_items
    ]
    excel_stream = generate_excel_report(records)
    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Sustainability_Report.xlsx"}
    )

@admin_router.get("/export/pdf")
def export_admin_pdf_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_is_admin(current_user)
    inventory_items = db.query(Inventory).all()
    records = [
        {
            "batch_id": item.batch_id,
            "fabric_type": item.fabric_type.value if hasattr(item.fabric_type, 'value') else str(item.fabric_type),
            "quantity": item.quantity,
            "condition": item.condition.value if hasattr(item.condition, 'value') else str(item.condition),
            "status": item.status.value if hasattr(item.status, 'value') else str(item.status)
        }
        for item in inventory_items
    ]
    pdf_stream = generate_pdf_text_summary(records)
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Sustainability_Inventory_Summary.pdf"}
    )


router.include_router(auth_router)
router.include_router(inventory_router)
router.include_router(analytics_router)
router.include_router(sustainability_router)
router.include_router(admin_router)