from app.schemas.auth_schema import LoginRequest
from app.services.auth_service import login_user
from app.auth.jwt_handler import create_access_token
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.auth_schema import RegisterRequest

from app.services.auth_service import register_user

router = APIRouter()


@router.post("/register")

def register(

    data: RegisterRequest,

    db: Session = Depends(get_db)

):

    user = register_user(db, data)

    if user is None:

        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    return {
        "message": "Registration Successful"
    }
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = login_user(
        db,
        data.email,
        data.password
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    token = create_access_token(
        {
            "user_id": user.id,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }