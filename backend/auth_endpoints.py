from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from database import users_collection
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str = Field(..., max_length=72)

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., max_length=72)
    role: str = "Recycling Facilitator" 

# --- Routes ---
@router.post("/register")
async def register(request: RegisterRequest):
    existing_user = await users_collection.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(request.password)
    new_user = {"email": request.email, "password": hashed_password, "role": request.role}
    await users_collection.insert_one(new_user)
    return {"message": "User created successfully!"}

@router.post("/login")
async def login(request: LoginRequest):
    user = await users_collection.find_one({"email": request.email})
    if not user or not verify_password(request.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "user")})
    return {"access_token": access_token, "role": user.get("role", "user")}