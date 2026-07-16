import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional, Dict, Any

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

def generate_batch_id(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.WasteBatch).count() + 1
    for _ in range(100):
        candidate = f"TXT-{year}-{count:04d}"
        if not db.query(models.WasteBatch).filter(models.WasteBatch.batch_id == candidate).first():
            return candidate
        count += 1
    return f"TXT-{year}-{random.randint(1000, 9999)}"

@router.get("/dashboard", response_model=schemas.InventorySummary)
def get_dashboard_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Query builder filter depending on user role
    query = db.query(models.WasteBatch)
    if current_user.role == "Textile Manufacturer":
        query = query.filter(models.WasteBatch.created_by_id == current_user.id)
    
    # Aggregations
    total_batches = query.count()
    
    # Sum quantity. (Note: unit conversion could be done, but for simplicity of Milestone 1, we sum direct quantity value)
    total_quantity_res = query.with_entities(func.sum(models.WasteBatch.quantity)).scalar()
    total_quantity = float(total_quantity_res) if total_quantity_res else 0.0

    # Batches by condition
    condition_counts = (
        query.with_entities(
            models.WasteBatch.condition,
            func.count(models.WasteBatch.id).label("count"),
            func.sum(models.WasteBatch.quantity).label("total_quantity")
        )
        .group_by(models.WasteBatch.condition)
        .all()
    )
    batches_by_condition = [
        schemas.ConditionSummary(
            condition=res[0],
            count=res[1],
            total_quantity=float(res[2]) if res[2] else 0.0
        )
        for res in condition_counts
    ]

    # Batches by status
    status_counts = (
        query.with_entities(
            models.WasteBatch.status,
            func.count(models.WasteBatch.id).label("count"),
            func.sum(models.WasteBatch.quantity).label("total_quantity")
        )
        .group_by(models.WasteBatch.status)
        .all()
    )
    batches_by_status = [
        schemas.StatusSummary(
            status=res[0],
            count=res[1],
            total_quantity=float(res[2]) if res[2] else 0.0
        )
        for res in status_counts
    ]

    # Recent collections (last 5)
    recent_collections = query.order_by(models.WasteBatch.collection_date.desc()).limit(5).all()

    # Attention needed batches: low-condition (Damaged or Contaminated) or status Pending
    attention_needed_batches = (
        query.filter(
            or_(
                models.WasteBatch.condition.in_(["Damaged", "Contaminated"]),
                models.WasteBatch.status == "Pending"
            )
        )
        .order_by(models.WasteBatch.created_at.desc())
        .limit(5)
        .all()
    )

    return schemas.InventorySummary(
        total_batches=total_batches,
        total_quantity=total_quantity,
        batches_by_condition=batches_by_condition,
        batches_by_status=batches_by_status,
        recent_collections=recent_collections,
        attention_needed_batches=attention_needed_batches
    )

@router.get("", response_model=Dict[str, Any])
def list_batches(
    search: Optional[str] = None,
    fabric_type: Optional[str] = None,
    condition: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.WasteBatch)

    # RBAC: Manufacturers only view their own batches
    if current_user.role == "Textile Manufacturer":
        query = query.filter(models.WasteBatch.created_by_id == current_user.id)

    # Filtering
    if fabric_type:
        query = query.filter(models.WasteBatch.fabric_type == fabric_type)
    if condition:
        query = query.filter(models.WasteBatch.condition == condition)
    if status:
        query = query.filter(models.WasteBatch.status == status)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.WasteBatch.batch_id.ilike(search_filter),
                models.WasteBatch.source.ilike(search_filter),
                models.WasteBatch.color.ilike(search_filter),
                models.WasteBatch.notes.ilike(search_filter)
            )
        )

    # Sorting
    model_attr = getattr(models.WasteBatch, sort_by, models.WasteBatch.created_at)
    if sort_order == "desc":
        query = query.order_by(model_attr.desc())
    else:
        query = query.order_by(model_attr.asc())

    # Pagination
    total = query.count()
    offset = (page - 1) * limit
    batches = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "items": batches
    }

@router.post("", response_model=schemas.WasteBatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_in: schemas.WasteBatchCreate,
    current_user: models.User = Depends(auth.RoleChecker(["Textile Manufacturer", "Administrator"])),
    db: Session = Depends(get_db)
):
    new_batch_id = generate_batch_id(db)
    
    db_batch = models.WasteBatch(
        batch_id=new_batch_id,
        fabric_type=batch_in.fabric_type,
        source=batch_in.source,
        quantity=batch_in.quantity,
        unit=batch_in.unit,
        color=batch_in.color,
        condition=batch_in.condition,
        collection_date=batch_in.collection_date,
        status=batch_in.status,
        notes=batch_in.notes,
        created_by_id=current_user.id
    )
    
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    
    if batch_in.image_analysis_in:
        db_analysis = models.ImageAnalysis(
            batch_id=db_batch.id,
            image_path=batch_in.image_analysis_in.image_path,
            fabric_texture=batch_in.image_analysis_in.fabric_texture,
            fabric_pattern=batch_in.image_analysis_in.fabric_pattern,
            fabric_color=batch_in.image_analysis_in.fabric_color,
            damage_detection=batch_in.image_analysis_in.damage_detection,
            contamination_detection=batch_in.image_analysis_in.contamination_detection,
            predicted_fabric_type=batch_in.image_analysis_in.predicted_fabric_type,
            fiber_composition=batch_in.image_analysis_in.fiber_composition,
            blend_identification=batch_in.image_analysis_in.blend_identification,
            material_quality=batch_in.image_analysis_in.material_quality,
            predicted_waste_category=batch_in.image_analysis_in.predicted_waste_category,
            recyclability_score=batch_in.image_analysis_in.recyclability_score,
            reuse_score=batch_in.image_analysis_in.reuse_score,
            sustainability_score=batch_in.image_analysis_in.sustainability_score,
            material_recovery_score=batch_in.image_analysis_in.material_recovery_score,
            circularity_score=batch_in.image_analysis_in.circularity_score
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_batch)
        
    return db_batch

@router.get("/{batch_id}", response_model=schemas.WasteBatchResponse)
def get_batch(
    batch_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste batch not found"
        )
    
    # RBAC checks
    if current_user.role == "Textile Manufacturer" and batch.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manufacturers can only view their own batches."
        )
        
    return batch

@router.put("/{batch_id}", response_model=schemas.WasteBatchResponse)
def update_batch(
    batch_id: str,
    batch_in: schemas.WasteBatchUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste batch not found"
        )
    
    # Role-based update rules
    
    # 1. Sustainability Manager is Read-Only
    if current_user.role == "Sustainability Manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sustainability Managers have read-only access."
        )
        
    # 2. Manufacturer constraints
    if current_user.role == "Textile Manufacturer":
        if batch.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manufacturers can only edit their own batches."
            )
        if batch.status not in ["Pending", "Sorting"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot edit batch details while in '{batch.status}' status."
            )
        
        # Manufacturer cannot modify processing status directly or set to completed
        if batch_in.status is not None and batch_in.status != batch.status:
            if batch_in.status not in ["Pending", "Sorting"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Manufacturers cannot transition batches to processing, recycled, or disposed states."
                )
        
        # Apply edits
        update_data = batch_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(batch, key, val)

    # 3. Recycling Facility Operator constraints
    elif current_user.role == "Recycling Facility Operator":
        # Operators can only edit status and notes, not primary materials, quantities, etc.
        update_data = batch_in.model_dump(exclude_unset=True)
        allowed_keys = ["status", "notes"]
        for key in update_data.keys():
            if key not in allowed_keys:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Recycling Operators can only update status and notes."
                )
        
        for key in allowed_keys:
            if key in update_data:
                setattr(batch, key, update_data[key])
                
    # 4. Administrator has full access
    elif current_user.role == "Administrator":
        update_data = batch_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            setattr(batch, key, val)

    db.commit()
    db.refresh(batch)
    return batch

@router.delete("/{batch_id}", status_code=status.HTTP_200_OK)
def delete_batch(
    batch_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste batch not found"
        )
    
    # RBAC constraints
    if current_user.role == "Sustainability Manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sustainability Managers cannot delete batches."
        )
    elif current_user.role == "Recycling Facility Operator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recycling Operators cannot delete batches."
        )
    elif current_user.role == "Textile Manufacturer":
        if batch.created_by_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Manufacturers can only delete their own batches."
            )
        if batch.status != "Pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Manufacturers cannot delete batches that are already in '{batch.status}' status."
            )
            
    db.delete(batch)
    db.commit()
    return {"detail": "Batch deleted successfully."}
