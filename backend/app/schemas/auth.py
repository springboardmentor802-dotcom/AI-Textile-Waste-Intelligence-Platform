from pydantic import BaseModel, EmailStr
from typing import Literal

RoleType = Literal[
    "administrator",
    "manufacturer",
    "recycler",
    "manager"
]


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleType


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: RoleType
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse