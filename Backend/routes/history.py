from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Prediction
from routes.auth import get_current_user


router = APIRouter()


@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Return prediction history for the authenticated user only.
    """

    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return [
        {
            "id": prediction.id,
            "material": prediction.material,
            "confidence": prediction.confidence,
            "waste_category": prediction.waste_category,
            "recyclability": prediction.recyclability,
            "recommendation": prediction.recommendation,
            "image_path": prediction.image_path,
            "created_at": prediction.created_at,
            # Reports page additions: already computed/stored per prediction
            # (see Prediction model + predict.py) -- exposed here so the
            # Reports page can build per-material breakdowns (e.g.
            # "Recyclability by Material", "Waste Category by Material")
            # from this single existing endpoint instead of adding a new
            # one. Not sensitive data -- same nature as the fields above.
            "circularity_score": prediction.circularity_score,
            "environmental_impact": prediction.environmental_impact,
        }
        for prediction in predictions
    ]


@router.delete("/history/{history_id}", status_code=204)
def delete_prediction_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Delete a prediction belonging to the authenticated user.
    """

    record = (
        db.query(Prediction)
        .filter(
            Prediction.id == history_id,
            Prediction.user_id == current_user.id,
        )
        .first()
    )

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction history record not found.",
        )

    db.delete(record)
    db.commit()

    return None