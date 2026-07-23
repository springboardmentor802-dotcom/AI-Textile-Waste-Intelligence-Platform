from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

# Allowed roles
RoleType = Literal[
    "administrator",
    "manufacturer",
    "recycler",
    "manager"
]


class User(BaseModel):
    id: Optional[str] = None

    full_name: str
    email: EmailStr

    # Store only the hashed password
    hashed_password: str

    role: RoleType = "manufacturer"

    is_active: bool = True
    is_verified: bool = False

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )