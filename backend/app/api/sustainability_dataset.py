from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_user
from app.models.sustainability_dataset import SustainabilityDataset
from app.schemas.sustainability_dataset import (
    SustainabilityDatasetResponse,
    SustainabilityDatasetList
)

router = APIRouter(
    prefix="/dataset",
    tags=["Sustainability Dataset"]
)


@router.get(
    "",
    response_model=SustainabilityDatasetList
)
def get_all_dataset(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    dataset = db.query(
        SustainabilityDataset
    ).all()

    return {
        "dataset": dataset
    }


@router.get(
    "/{dataset_id}",
    response_model=SustainabilityDatasetResponse
)
def get_dataset_by_id(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    item = db.query(
        SustainabilityDataset
    ).filter(
        SustainabilityDataset.id == dataset_id
    ).first()

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Dataset record not found."
        )

    return item


@router.delete("/{dataset_id}")
def delete_dataset_record(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    item = db.query(
        SustainabilityDataset
    ).filter(
        SustainabilityDataset.id == dataset_id
    ).first()

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Dataset record not found."
        )

    db.delete(item)

    db.commit()

    return {
        "message": "Record deleted successfully."
    }


@router.delete("")
def delete_all_dataset(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    db.query(
        SustainabilityDataset
    ).delete()

    db.commit()

    return {
        "message": "Dataset cleared successfully."
    }