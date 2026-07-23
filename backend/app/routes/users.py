from fastapi import APIRouter, Depends
from app.config.database import db
from app.middleware.role_checker import require_role

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
async def get_users(
    current_user=Depends(require_role("administrator"))
):
    users = await db.users.find().to_list(length=1000)

    response = []

    for user in users:
        response.append({
            "id": str(user["_id"]),
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "is_active": user.get("is_active"),
            "is_verified": user.get("is_verified")
        })

    return response