import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.models import User, Inventory, FabricTypeEnum, ConditionEnum, StatusEnum
from app.schemas import (
    UserCreate, UserLogin, UserResponse, 
    InventoryCreate, InventoryUpdate,
    MaterialAssessmentInput, SustainabilityReportResponse, AssessmentResult
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

# Core ML and Vision Engine Imports
from app.ml.scoring_model import calculate_circularity_matrix
from app.ml.image_analysis import process_textile_image

# Single global router definition with prefix mapping
router = APIRouter(prefix="/auth", tags=["Authentication, Inventory & Analytics"])

# ==========================================
# 🔐 USER AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)

    token_claims = {
        "sub": str(user.id),  
        "role": role_value
    }
    access_token = create_access_token(data=token_claims)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": role_value
    }

# ==========================================
# 📦 TEXTILE INVENTORY ENDPOINTS
# ==========================================

# 1. Create - Waste Registration
@router.post("/inventory/", status_code=status.HTTP_201_CREATED)
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

# 2. Read - Get All Inventory Items
@router.get("/inventory/")
def get_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role in ["Admin", "Sustainability Manager"]:
        items = db.query(Inventory).all()
    else:
        items = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
        
    return {"data": items}

# 3. Update - Batch Management / Monitoring
@router.put("/inventory/{item_id}")
def update_inventory(item_id: int, payload: InventoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    if item.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=401, detail="Not authorized to update this batch")
        
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    db.commit()
    db.refresh(item)
    return {"message": "Inventory updated successfully"}

# 4. Delete - Remove Waste Record
@router.delete("/inventory/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    if item.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=401, detail="Not authorized to delete this batch")
        
    db.delete(item)
    db.commit()
    return {"message": "Inventory item removed successfully"}

# ==========================================
# 📊 AI & SUSTAINABILITY ANALYTICS ENDPOINTS
# ==========================================

@router.post("/analytics/assess", response_model=SustainabilityReportResponse)
def assess_material_sustainability(payload: MaterialAssessmentInput):
    """
    Milestone 2 API Endpoint: Receives textile telemetry and computes 
    environmental footprints alongside circularity scoring models.
    """
    try:
        row_dict = payload.dict()
        formatted_row = {
            "Material_Type": row_dict["material_type"],
            "Material_Condition": row_dict["material_condition"],
            "Reuse_Potential": row_dict["reuse_potential"],
            "Environmental_Benefit": row_dict["environmental_benefit"],
            "Processing_Feasibility": row_dict["processing_feasibility"]
        }
        
        matrix_result = calculate_circularity_matrix(formatted_row)
        
        weight = payload.waste_weight_kg
        co2_savings = round(weight * 2.5, 2)
        water_savings = round(weight * 2000.0, 2)
        
        return SustainabilityReportResponse(
            status="Success",
            batch_details=payload,
            metrics=AssessmentResult(
                score=matrix_result["score"],
                category=matrix_result["category"]
            ),
            co2_savings_estimated_kg=co2_savings,
            water_savings_estimated_liters=water_savings
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Core Matrix Analytics Failure: {str(e)}"
        )

@router.post("/analytics/upload-image")
async def upload_textile_image(file: UploadFile = File(...)):
    """
    Textile Image Pipeline Endpoint:
    Receives uploaded image streams, caches file in uploaded_samples folder,
    and returns comprehensive AI & Dataset analytics report.
    """
    try:
        contents = await file.read()
        
        # Save sample file to disk for cache / records
        upload_dir = os.path.join(os.path.dirname(__file__), "uploaded_samples")
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir, exist_ok=True)
            
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
            
        # Run ML & Dataset Vision Engine
        analysis_report = process_textile_image(contents)
        return analysis_report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Vision Pipeline stream crash: {str(e)}"
        )

# ==========================================
# 🌿 REAL-WORLD 5000 SUSTAINABILITY DATASET ENDPOINTS
# ==========================================

@router.get("/sustainability/", summary="Get 5,000 Sustainability Dataset Records")
def get_sustainability_dataset(limit: int = 50, skip: int = 0, db: Session = Depends(get_db)):
    """
    Fetches real-world enterprise dataset records from PostgreSQL database
    with pagination support (default limit: 50 records per page).
    """
    try:
        query = text("SELECT * FROM sustainability_dataset LIMIT :limit OFFSET :skip")
        result = db.execute(query, {"limit": limit, "skip": skip})
        records = [dict(row._mapping) for row in result]
        return {
            "status": "Success",
            "count": len(records),
            "limit": limit,
            "skip": skip,
            "data": records
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Query Error: {str(e)}"
        )