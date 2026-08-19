from fastapi import Depends, HTTPException, status

from app.utils.auth_dependency import get_current_user


def normalize_role(role):
    """
    Normalize role values so:
    Admin, ADMIN, admin -> ADMIN
    Industry -> INDUSTRY
    Recycler -> RECYCLER
    NGO, ngo -> NGO
    """

    if role is None:
        return ""

    return str(role).strip().upper()


def require_role(allowed_roles):
    """
    FastAPI dependency used to restrict an endpoint
    to specific user roles.

    Example:

    @router.get("/")
    def route(
        current_user=Depends(
            require_role(["ADMIN", "NGO"])
        )
    ):
        ...
    """

    normalized_allowed_roles = {
        normalize_role(role)
        for role in allowed_roles
    }

    def role_checker(
        current_user: dict = Depends(
            get_current_user
        ),
    ):
        current_role = normalize_role(
            current_user.get("role")
        )

        if (
            not current_role
            or current_role
            not in normalized_allowed_roles
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action"
                ),
            )

        return current_user

    return role_checker