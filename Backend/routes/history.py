
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# --- Adjust these two imports to match your actual project layout ---
from database import get_db                # <-- your DB session dependency
from models import PredictionHistory        # <-- your SQLAlchemy model
from routes.auth import get_current_user    # already used by predict.py

router = APIRouter()


@router.delete("/history/{history_id}", status_code=204)
def delete_prediction_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Deletes a single prediction history record.

    Ownership check: only deletes the record if it belongs to the
    authenticated user (user_id matches current_user.id). Without this
    check, any logged-in user could delete any other user's history by
    guessing IDs — a real security gap, not just a nicety.
    """
    record = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.id == history_id,
            PredictionHistory.user_id == current_user.id,
        )
        .first()
    )

    if record is None:
        # Same 404 whether the record doesn't exist OR belongs to someone
        # else — don't leak which case it is.
        raise HTTPException(status_code=404, detail="Prediction history record not found.")

    db.delete(record)
    db.commit()
    return None