from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.config.database import db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token


async def register_user(user_data: RegisterRequest):
    # Check if email already exists
    existing_user = await db.users.find_one(
        {"email": user_data.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # Create user object
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    # Convert to dictionary
    user_dict = new_user.model_dump(
        mode="json",
        exclude={"id"}
    )

    # Save user in MongoDB
    result = await db.users.insert_one(user_dict)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

async def login_user(user_data: LoginRequest):

    user = await db.users.find_one(
        {"email": user_data.email}
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(
        user_data.password,
        user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        {
            "sub": user["email"],
            "role": user["role"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "is_active": user["is_active"]
        }
    }