from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import OAuth2PasswordBearer

from jose import (
    JWTError,
    jwt,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

from app.utils.security import (
    SECRET_KEY,
    ALGORITHM,
)


# ==========================================================
# OAUTH2 CONFIGURATION
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ==========================================================
# VALID APPLICATION ROLES
# ==========================================================

VALID_ROLES = {
    "Admin",
    "Industry",
    "Recycler",
    "NGO",
}


# ==========================================================
# CURRENT AUTHENTICATED USER
# ==========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Decode the JWT token and return the authenticated
    user's CURRENT database identity and role.

    Security rule:
    The role stored in the database is trusted instead
    of the role contained inside an older JWT token.

    This means that if an administrator changes a user's
    role, the user's permissions change immediately even
    when the user still has an older access token.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    # ------------------------------------------------------
    # DECODE JWT
    # ------------------------------------------------------

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")

        if not username:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # ------------------------------------------------------
    # LOAD CURRENT USER FROM DATABASE
    # ------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # ------------------------------------------------------
    # READ CURRENT DATABASE ROLE
    # ------------------------------------------------------

    user_role = getattr(
        user,
        "role",
        None,
    )

    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "User account does not have "
                "a valid role"
            ),
        )

    # ------------------------------------------------------
    # REJECT UNKNOWN / INVALID ROLES
    # ------------------------------------------------------

    if user_role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Unsupported user role: {user_role}"
            ),
        )

    # ------------------------------------------------------
    # AUTHENTICATED USER CONTEXT
    # ------------------------------------------------------

    return {
        "user_id": user.user_id,
        "username": user.username,
        "role": user_role,
    }