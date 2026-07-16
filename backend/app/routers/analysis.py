import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional

from app import models, schemas, auth
from app.database import get_db
from app.analysis_engine import analyze_textile_image

router = APIRouter(prefix="/api/analysis", tags=["Image Analysis & Classification"])

UPLOAD_DIR = os.path.join("app", "static", "uploads")

def ensure_upload_dir():
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.ImageAnalysisBase)
def upload_and_analyze_standalone(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Standalone upload: Receives a textile photo, runs feature extraction and scoring,
    and returns predicted values to pre-populate the registration form.
    Does not save to the database yet.
    """
    if "image" not in file.content_type and file.filename.split('.')[-1].lower() not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Please upload a valid image (JPG, PNG, WEBP)."
        )
        
    ensure_upload_dir()
    
    file_ext = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    # Run the image analysis engine
    analysis_results = analyze_textile_image(file_path, file.filename)
    
    # Return path relative to static
    relative_image_path = f"/static/uploads/{unique_filename}"
    analysis_results["image_path"] = relative_image_path
    
    return analysis_results

@router.post("/upload/{batch_id}", response_model=schemas.ImageAnalysisResponse)
def upload_and_analyze_for_batch(
    batch_id: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.RoleChecker(["Recycling Facility Operator", "Administrator", "Textile Manufacturer"])),
    db: Session = Depends(get_db)
):
    """
    Batch upload: Uploads and runs classification on a photo for an existing waste batch.
    Saves the results in the database and links them directly to the batch.
    """
    batch = db.query(models.WasteBatch).filter(models.WasteBatch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Waste batch not found"
        )
        
    # Role check: Manufacturers can only update their own
    if current_user.role == "Textile Manufacturer" and batch.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manufacturers can only analyze their own batches."
        )

    if "image" not in file.content_type and file.filename.split('.')[-1].lower() not in ["jpg", "jpeg", "png", "webp"]:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail="Unsupported file type. Please upload a valid image."
         )
         
    ensure_upload_dir()
    
    file_ext = file.filename.split('.')[-1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {str(e)}"
        )
        
    analysis_results = analyze_textile_image(file_path, file.filename)
    relative_image_path = f"/static/uploads/{unique_filename}"
    
    # Delete existing analysis if it exists
    if batch.image_analysis:
        db.delete(batch.image_analysis)
        db.commit()
        
    db_analysis = models.ImageAnalysis(
        batch_id=batch.id,
        image_path=relative_image_path,
        fabric_texture=analysis_results["fabric_texture"],
        fabric_pattern=analysis_results["fabric_pattern"],
        fabric_color=analysis_results["fabric_color"],
        damage_detection=analysis_results["damage_detection"],
        contamination_detection=analysis_results["contamination_detection"],
        predicted_fabric_type=analysis_results["predicted_fabric_type"],
        fiber_composition=analysis_results["fiber_composition"],
        blend_identification=analysis_results["blend_identification"],
        material_quality=analysis_results["material_quality"],
        predicted_waste_category=analysis_results["predicted_waste_category"],
        recyclability_score=analysis_results["recyclability_score"],
        reuse_score=analysis_results["reuse_score"],
        sustainability_score=analysis_results["sustainability_score"],
        material_recovery_score=analysis_results["material_recovery_score"],
        circularity_score=analysis_results["circularity_score"]
    )
    
    # Auto-adjust batch details if matching operators' expectations
    if current_user.role in ["Recycling Facility Operator", "Administrator"]:
        batch.fabric_type = analysis_results["predicted_fabric_type"]
        batch.color = analysis_results["fabric_color"]
        # Update batch condition based on AI scan suggestion
        if analysis_results["condition_suggestion"] in ["Clean", "Damaged", "Contaminated", "Wet"]:
            batch.condition = analysis_results["condition_suggestion"]
            
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis

@router.get("/reports/summary", response_model=Dict[str, Any])
def get_reports_summary(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculates and returns statistics of overall waste compositions, recyclability trends,
    and environmental impact estimations (CO2 and Water savings).
    """
    # 1. Total volumes & counts
    batches = db.query(models.WasteBatch).all()
    total_weight = sum(b.quantity for b in batches)
    total_batches = len(batches)
    
    # Filter only analyzed batches
    analyzed_batches = db.query(models.WasteBatch).join(models.ImageAnalysis).all()
    total_analyzed = len(analyzed_batches)
    
    # 2. Fabric type breakdown
    fabric_breakdown = {}
    for b in batches:
        fabric_breakdown[b.fabric_type] = fabric_breakdown.get(b.fabric_type, 0.0) + b.quantity
        
    # Convert to list of dicts for charting
    fabric_stats = [{"fabric": k, "weight": round(v, 1)} for k, v in fabric_breakdown.items()]
    
    # 3. Waste Category breakdown (analyzed only)
    category_breakdown = {}
    for b in analyzed_batches:
        cat = b.image_analysis.predicted_waste_category
        category_breakdown[cat] = category_breakdown.get(cat, 0.0) + b.quantity
        
    category_stats = [{"category": k, "weight": round(v, 1)} for k, v in category_breakdown.items()]
    
    # 4. Average scores (analyzed only)
    avg_circularity = 0.0
    avg_recyclability = 0.0
    avg_reuse = 0.0
    avg_sustainability = 0.0
    avg_recovery = 0.0
    
    if total_analyzed > 0:
        avg_circularity = sum(b.image_analysis.circularity_score for b in analyzed_batches) / total_analyzed
        avg_recyclability = sum(b.image_analysis.recyclability_score for b in analyzed_batches) / total_analyzed
        avg_reuse = sum(b.image_analysis.reuse_score for b in analyzed_batches) / total_analyzed
        avg_sustainability = sum(b.image_analysis.sustainability_score for b in analyzed_batches) / total_analyzed
        avg_recovery = sum(b.image_analysis.material_recovery_score for b in analyzed_batches) / total_analyzed
        
    # 5. Environmental Savings Estimations (CO2 in kg, Water in Liters)
    # Heuristics:
    # Cotton: 2.5 kg CO2, 2000 L water saved per kg
    # Denim: 3.0 kg CO2, 2500 L water saved per kg
    # Wool: 4.0 kg CO2, 1500 L water saved per kg
    # Polyester: 1.5 kg CO2, 500 L water saved per kg
    # Blends / Others: 2.0 kg CO2, 1000 L water saved per kg
    total_co2_saved = 0.0
    total_water_saved = 0.0
    
    for b in batches:
        mult_co2 = 2.0
        mult_water = 1000.0
        
        fab = b.fabric_type.lower()
        if "cotton" in fab:
            mult_co2 = 2.5
            mult_water = 2000.0
        elif "denim" in fab:
            mult_co2 = 3.0
            mult_water = 2500.0
        elif "wool" in fab:
            mult_co2 = 4.0
            mult_water = 1500.0
        elif "polyester" in fab:
            mult_co2 = 1.5
            mult_water = 500.0
            
        total_co2_saved += b.quantity * mult_co2
        total_water_saved += b.quantity * mult_water
        
    # 6. Quality breakdown
    quality_counts = {}
    for b in analyzed_batches:
        q = b.image_analysis.material_quality
        quality_counts[q] = quality_counts.get(q, 0) + 1
    quality_stats = [{"quality": k, "count": v} for k, v in quality_counts.items()]

    return {
        "total_batches": total_batches,
        "total_weight": round(total_weight, 1),
        "total_analyzed": total_analyzed,
        "fabric_stats": fabric_stats,
        "category_stats": category_stats,
        "quality_stats": quality_stats,
        "avg_scores": {
            "circularity": round(avg_circularity, 1),
            "recyclability": round(avg_recyclability, 1),
            "reuse": round(avg_reuse, 1),
            "sustainability": round(avg_sustainability, 1),
            "material_recovery": round(avg_recovery, 1)
        },
        "environmental_impact": {
            "co2_saved_kg": round(total_co2_saved, 1),
            "water_saved_liters": round(total_water_saved, 1),
            "landfill_diverted_kg": round(total_weight, 1)
        }
    }
