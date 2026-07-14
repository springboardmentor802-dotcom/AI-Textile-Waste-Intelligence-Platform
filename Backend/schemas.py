from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

from datetime import date
from typing import Optional

# What POST /inventory expects to receive
class InventoryCreate(BaseModel):
    batch_id: str
    fabric_type: str
    source: Optional[str] = None
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None

# What PUT /inventory/{id} expects (all fields optional, since you might only update one)
class InventoryUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[date] = None

# What the API returns
class InventoryResponse(BaseModel):
    id: int
    user_id: int
    batch_id: str
    fabric_type: str
    source: Optional[str]
    quantity: float
    color: Optional[str]
    condition: Optional[str]
    collection_date: Optional[date]

    class Config:
        from_attributes = True