from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str  # admin | manufacturer | sustainability_manager | recycling_operator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    full_name: str


class RefreshRequest(BaseModel):
    refresh_token: str


class InventoryCreate(BaseModel):
    batch_id: str
    fabric_type: str
    source: Optional[str] = None
    quantity: float
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[str] = None


class InventoryUpdate(BaseModel):
    fabric_type: Optional[str] = None
    source: Optional[str] = None
    quantity: Optional[float] = None
    color: Optional[str] = None
    condition: Optional[str] = None
    collection_date: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class NotificationPreferences(BaseModel):
    waste_collection_alerts: bool = True
    recycling_opportunity_notifications: bool = True
    sustainability_milestone_alerts: bool = True
    inventory_warnings: bool = True
    platform_announcements: bool = True
