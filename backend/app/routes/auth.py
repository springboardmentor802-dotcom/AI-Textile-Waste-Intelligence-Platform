from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == username,
        User.password == password
    ).first()


    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    return {
        "user_id": user.user_id,
        "username": user.username,
        "role": user.role
    }