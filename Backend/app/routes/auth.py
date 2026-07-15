# from fastapi import APIRouter
#
# router = APIRouter(
#     prefix="/auth",
#     tags=["Authentication"]
# )
#
# @router.get("/")
# def auth_home():
#     return {
#         "message": "Authentication API Working"
#     }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.auth_service import create_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/")
def auth_home():
    return {
        "message": "Authentication API Working"
    }

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)