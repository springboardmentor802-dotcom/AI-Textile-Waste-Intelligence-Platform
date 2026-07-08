from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import List

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class UserProfile(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True




class UserListResponse(BaseModel):
    users: List[UserResponse]

class UserUpdate(BaseModel):
    name: str
    email: EmailStr


class PasswordChange(BaseModel):
    old_password: str
    new_password: str

