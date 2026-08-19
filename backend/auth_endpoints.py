from enum import Enum
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from database import users_collection
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

class PublicRole(str, Enum):
    RECYCLING_FACILITATOR = "Recycling Facilitator"  
    SUSTAINABILITY_MANAGER = "Sustainability Manager"
    MANUFACTURER = "Manufacturer"

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=5, max_length=72)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        v = v.strip().lower()
        import re
        if not re.match(EMAIL_PATTERN, v):
            raise ValueError("Invalid email format")
        return v

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., min_length=5, max_length=254)
    password: str = Field(..., min_length=5, max_length=72)
    role: PublicRole = PublicRole.RECYCLING_FACILITATOR

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        v = v.strip().lower()
        import re
        if not re.match(EMAIL_PATTERN, v):
            raise ValueError("Invalid email format")
        return v

from notifications_scheduler import trigger_user_registered_event

@router.post("/register")
async def register(request: RegisterRequest):
    existing_user = await users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(request.password)
    new_user = {
        "name": request.name,
        "email": request.email,
        "password": hashed_password,
        "role": request.role.value,
        "email_notifications": True,
    }
    await users_collection.insert_one(new_user)
    
    # Notify Admin Dashboard of new user registration
    await trigger_user_registered_event(
        name=request.name,
        email=request.email,
        role=request.role.value
    )

    return {"message": "User created successfully!"}

@router.post("/login")
async def login(request: LoginRequest):
    user = await users_collection.find_one({"email": request.email})
    if not user or not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "user")})
    return {
        "access_token": access_token,
        "role": user.get("role", "user"),
        "name": user.get("name", ""),
        "email": user["email"],
        "email_notifications": user.get("email_notifications", True),
    }