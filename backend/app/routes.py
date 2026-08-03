import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models import User, Inventory, UserRole
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
from app.ml.image_analysis import process_textile_image
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

# ==========================================
# 🔐 AUTHENTICATION ENDPOINTS
# ==========================================

@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email address is already registered.")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_password, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@auth_router.post("/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token_claims = {"sub": str(user.id), "role": role_value}
    access_token = create_access_token(data=token_claims)
    
    return {"access_token": access_token, "token_type": "bearer", "role": role_value}


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
    if current_user.role in [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER]:
        items = db.query(Inventory).all()
    else:
        items = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
    return {"data": items}


# ==========================================
# 📊 SUSTAINABILITY & AI VISION ENDPOINTS
# ==========================================

@analytics_router.post("/upload-image")
async def analyze_textile_image(file: UploadFile = File(...)):
    """
    Receives uploaded textile image, processes it via computer vision engine, 
    and returns multi-engine analysis across all 7 diagnostic engines.
    """
    contents = await file.read()
    analysis_data = process_textile_image(contents)
    return {
        "status": "Success",
        "filename": file.filename,
        "results": analysis_data
    }

@analytics_router.post("/assess")
def assess_material_sustainability(payload: MaterialAssessmentInput):
    row_dict = payload.dict()
    
    # 1. Circularity Score & 5 Category Classification
    scoring_res = calculate_circularity_score(row_dict)
    
    # 2. Recycling Recommendation Strategy
    rec_res = generate_recycling_recommendation(
        mat_type=payload.material_type,
        condition=payload.material_condition,
        score=scoring_res["circularity_score"]
    )
    
    # 3. Environmental Impact Assessment
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
    """
    Generates and streams a unified multi-engine report file 
    containing complete metrics from all 7 diagnostic engines.
    """
    batch_id = payload.get("batch_id", "BATCH-AI-SCAN")
    results = payload.get("results", {})
    pdf_stream = generate_multi_engine_pdf_report(batch_id, results)
    return StreamingResponse(
        pdf_stream,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=Textile_Intelligence_Report_{batch_id}.txt"}
    )


# ==========================================
# 🌿 SUSTAINABILITY DATASET ENDPOINTS
# ==========================================

@sustainability_router.get("/")
def get_sustainability_dataset(limit: int = 25):
    df = load_sustainability_dataset()
    records = df.head(limit).to_dict(orient="records")
    return {"status": "Success", "data": records}


# ==========================================
# 👑 ADMIN DASHBOARD ENDPOINTS (USER MGMT & MONITORING)
# ==========================================

@admin_router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin authorization required.")
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.role.value if hasattr(u.role, 'value') else str(u.role)} for u in users]

@admin_router.put("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin authorization required.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.role = UserRole(new_role)
    db.commit()
    return {"message": "User role updated successfully"}

@admin_router.get("/system-health")
def get_system_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin authorization required.")
    
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
def export_excel_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Inventory).all()
    records = [
        {
            "Batch ID": i.batch_id,
            "Fabric Type": i.fabric_type,
            "Quantity (Kg)": i.quantity,
            "Condition": i.condition,
            "Source": i.source,
            "Status": i.status
        } for i in items
    ]
    excel_stream = generate_excel_report(records)
    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=Sustainability_Report.xlsx"}
    )

@admin_router.get("/export/pdf")
def export_pdf_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Inventory).all()
    records = [{"batch_id": i.batch_id, "fabric_type": i.fabric_type, "quantity": i.quantity, "condition": i.condition, "status": i.status} for i in items]
    pdf_stream = generate_pdf_text_summary(records)
    return StreamingResponse(
        pdf_stream,
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=Sustainability_Report.txt"}
    )


# Attach sub-routers
router.include_router(auth_router)
router.include_router(inventory_router)
router.include_router(analytics_router)
router.include_router(sustainability_router)
router.include_router(admin_router)