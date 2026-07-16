from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/datasets", tags=["Dataset Integration Foundation"])

@router.get("", response_model=List[schemas.DatasetResponse])
def list_datasets(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exposes dataset metadata (TIPS, DeepFashion, etc.) along with placeholder statuses.
    Accessible to all logged-in roles to explore the integration scope.
    """
    datasets = db.query(models.DatasetMetadata).all()
    return datasets

@router.get("/{dataset_id}", response_model=schemas.DatasetResponse)
def get_dataset(
    dataset_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(models.DatasetMetadata).filter(models.DatasetMetadata.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    return dataset

@router.post("/{dataset_id}/ingest", status_code=status.HTTP_202_ACCEPTED)
def mock_ingest_dataset_sample(
    dataset_id: int,
    label: str = Form(...),
    file: UploadFile = File(...),
    metadata_json: Optional[str] = Form(None),
    current_user: models.User = Depends(auth.RoleChecker(["Administrator", "Recycling Facility Operator"])),
    db: Session = Depends(get_db)
):
    """
    Mock endpoint for Milestone 2 image/material classification and model training.
    Validates uploaded images and registers a sample metadata record.
    """
    dataset = db.query(models.DatasetMetadata).filter(models.DatasetMetadata.id == dataset_id).first()
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )

    # Validate file type (image or archive depending on dataset format)
    if "image" not in file.content_type and file.filename.split('.')[-1] not in ["jpg", "jpeg", "png", "webp"]:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail=f"Unsupported file type '{file.content_type}'. Please upload a valid image file (JPG, PNG, WEBP)."
         )

    # Mock path mapping - would save to static/s3 in milestone 2
    mock_url = f"https://example.com/uploads/datasets/{dataset.name.lower().replace(' ', '_')}/{file.filename}"
    
    # Store sample record mapping
    sample = models.SampleDatasetRecord(
        dataset_id=dataset_id,
        label=label,
        image_url_placeholder=mock_url,
        metadata_json=metadata_json or '{"source": "user_uploaded_test", "milestone": 2}'
    )
    
    # Update dataset count
    dataset.num_records += 1
    dataset.status = "Ingested"
    
    db.add(sample)
    db.commit()
    db.refresh(sample)

    return {
        "message": f"Successfully queued sample for ingestion and AI training pipeline in Milestone 2.",
        "dataset_name": dataset.name,
        "sample_id": sample.id,
        "filename": file.filename,
        "mock_url": mock_url,
        "label_assigned": label
    }
