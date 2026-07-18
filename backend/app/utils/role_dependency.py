from fastapi import Depends, HTTPException
from app.utils.auth_dependency import get_current_user


def require_role(allowed_roles):

    def role_checker(
        current_user: dict = Depends(get_current_user)
    ):

        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action"
            )

        return current_user

    return role_checker