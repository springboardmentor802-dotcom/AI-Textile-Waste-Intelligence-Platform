from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)

    email: EmailStr

    phone_number: str = Field(..., min_length=10, max_length=15)

    company_name: str = Field(..., min_length=3, max_length=150)

    role: str

    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    email: EmailStr

    password: str