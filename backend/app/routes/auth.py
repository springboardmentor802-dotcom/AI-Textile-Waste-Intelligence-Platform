from fastapi import APIRouter
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import register_user, login_user
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.middleware.role_checker import require_role


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(data: RegisterRequest):
    return await register_user(data)

@router.post("/login")
async def login(data: LoginRequest):
    return await login_user(data)

@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user)
):
    return {
        "id": str(current_user["_id"]),
        "full_name": current_user["full_name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "is_active": current_user["is_active"],
        "is_verified": current_user["is_verified"]
    }

@router.get("/admin")
async def admin_dashboard(
    current_user=Depends(require_role("administrator"))
):
    return {
        "message": "Welcome Administrator",
        "user": current_user["full_name"]
    }

@router.get("/manufacturer")
async def manufacturer_dashboard(
    current_user=Depends(require_role("manufacturer"))
):
    return {
        "message": "Welcome Manufacturer",
        "user": current_user["full_name"]
    }

@router.get("/recycler")
async def recycler_dashboard(
    current_user=Depends(require_role("recycler"))
):
    return {
        "message": "Welcome Recycler",
        "user": current_user["full_name"]
    }

@router.get("/manager")
async def manager_dashboard(
    current_user=Depends(require_role("manager"))
):
    return {
        "message": "Welcome Manager",
        "user": current_user["full_name"]
    }