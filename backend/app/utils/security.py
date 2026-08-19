import os

from datetime import (
    datetime,
    timedelta,
)

from dotenv import load_dotenv

from jose import (
    JWTError,
    jwt,
)

from passlib.context import CryptContext


# ==========================================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================================

load_dotenv()


# ==========================================================
# SECURITY CONFIGURATION
# ==========================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY"
)

ALGORITHM = os.getenv(
    "ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)


if not SECRET_KEY:

    raise RuntimeError(
        "SECRET_KEY environment variable is not configured."
    )


if len(SECRET_KEY) < 32:

    raise RuntimeError(
        "SECRET_KEY must contain at least 32 characters."
    )


# ==========================================================
# PASSWORD HASHING
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ==========================================================
# HASH PASSWORD
# ==========================================================

def hash_password(
    password: str,
) -> str:

    return pwd_context.hash(
        password
    )


# ==========================================================
# VERIFY PASSWORD
# ==========================================================

def verify_password(
    password: str,
    hashed_password: str,
) -> bool:

    return pwd_context.verify(
        password,
        hashed_password,
    )


# ==========================================================
# CREATE JWT ACCESS TOKEN
# ==========================================================

def create_access_token(
    data: dict,
) -> str:

    to_encode = data.copy()

    expire = (
        datetime.utcnow()
        +
        timedelta(
            minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update(
        {
            "exp": expire
        }
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==========================================================
# PASSWORD HASH ALIAS
# ==========================================================

def get_password_hash(
    password: str,
) -> str:

    return hash_password(
        password
    )