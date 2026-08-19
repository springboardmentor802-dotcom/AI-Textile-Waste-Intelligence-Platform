from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.role_dependency import require_role


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_role(["Admin"])
    ),
):
    """
    Return platform users.

    Only administrators are allowed
    to access user-management data.
    """

    try:
        users = (
            db.query(User)
            .order_by(
                User.user_id.asc()
            )
            .all()
        )

        return [
            {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
            }
            for user in users
        ]

    except Exception as error:
        print(
            "Users API error:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to load platform users.",
        ) from error