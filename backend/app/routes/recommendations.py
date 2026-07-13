from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.recommendation import Recommendation
from app.utils.auth_dependency import get_current_user


router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"]
)


@router.get("/")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    recommendations = db.query(Recommendation).all()

    return recommendations