from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ManufacturerCreate(BaseModel):

    company_name: str
    gst_number: Optional[str] = None
    industry_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class ManufacturerUpdate(BaseModel):

    company_name: str
    gst_number: Optional[str] = None
    industry_type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class ManufacturerResponse(BaseModel):

    id: int
    user_id: int

    company_name: str

    gst_number: Optional[str]
    industry_type: Optional[str]

    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]

    contact_person: Optional[str]
    phone: Optional[str]

    website: Optional[str]

    description: Optional[str]

    is_verified: bool

    created_at: datetime

    class Config:
        from_attributes = True


class ManufacturerListResponse(BaseModel):

    manufacturers: list[ManufacturerResponse]