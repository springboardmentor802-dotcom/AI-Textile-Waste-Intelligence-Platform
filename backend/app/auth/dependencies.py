from fastapi import Depends
from fastapi import HTTPException
# from fastapi.security import OAuth2PasswordBearer

from jose import JWTError

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.auth.jwt_handler import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == payload["user_id"]
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def get_current_manufacturer(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Manufacturer":
        raise HTTPException(
            status_code=403,
            detail="Manufacturer access required"
        )

    return current_user


def get_current_recycler(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Recycler":
        raise HTTPException(
            status_code=403,
            detail="Recycler access required"
        )

    return current_user


def get_current_sustainability_manager(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Sustainability Manager":
        raise HTTPException(
            status_code=403,
            detail="Sustainability Manager access required"
        )

    return current_user