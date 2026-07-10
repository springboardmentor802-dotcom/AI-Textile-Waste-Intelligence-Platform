from pydantic import BaseModel, EmailStr

# What /register expects to receive
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

# What /login expects to receive
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# What the API sends back after successful register/login
# Notice: no password field here at all
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True