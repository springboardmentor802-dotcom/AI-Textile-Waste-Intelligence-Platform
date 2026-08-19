from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserRegistration

from app.utils.security import (
    verify_password,
    create_access_token,
    hash_password,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", status_code=201)
def register(
    registration: UserRegistration,
    db: Session = Depends(get_db)
):
    name = registration.name.strip()
    email = registration.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(
            status_code=422,
            detail="Name must contain at least 2 characters"
        )

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(
            status_code=422,
            detail="Enter a valid email address"
        )

    if len(registration.password) < 8:
        raise HTTPException(
            status_code=422,
            detail="Password must contain at least 8 characters"
        )

    existing_user = db.query(User).filter(
        (User.username == name) | (User.email == email)
    ).first()

    if existing_user:
        detail = (
            "An account with this email already exists"
            if existing_user.email == email
            else "This name is already registered"
        )
        raise HTTPException(status_code=409, detail=detail)

    user = User(
        username=name,
        email=email,
        hashed_password=hash_password(registration.password),
        role="Industry",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully",
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # Find user
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )



    # Verify password
    if not verify_password(
        form_data.password,
        user.hashed_password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )



    # Generate JWT token
    access_token = create_access_token(

        data={

            "sub": user.username,

            "role": user.role

        }

    )


    return {

        "access_token": access_token,

        "token_type": "bearer",

        "user_id": user.user_id,

        "username": user.username,

        "role": user.role

    }
