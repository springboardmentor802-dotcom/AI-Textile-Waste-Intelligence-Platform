from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import (
    RegisterRequest,
    UserResponse,
    AdminUserResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
)
from config import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# CURRENT USER

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user

# ROLE-BASED ACCESS CONTROL

def require_role(allowed_roles: list[str]):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this",
            )

        return current_user

    return role_checker

# REGISTER

@router.post("/register", response_model=UserResponse)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_pw = hash_password(request.password)

    # SECURITY: Public registration always creates a
    # Recycling Facility Operator. We intentionally do NOT use
    # request.role here, even though RegisterRequest carries a
    # `role` field for the three self-registerable roles.
    #
    # Previously this line used request.role directly, which meant
    # anyone could POST role="administrator" straight to this
    # endpoint (bypassing the frontend dropdown, which only ever
    # showed 3 roles) and receive a full Administrator account.
    # schemas.SelfRegisterableRole now also rejects "administrator"
    # at the validation layer, but this hardcoded value is the real
    # fix: it means this endpoint can NEVER create an administrator,
    # no matter what schema validation allows in the future.
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hashed_pw,
        role="recycling_facility_operator",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# LOGIN

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }

# UPDATE OWN PROFILE
#
# PUT /auth/me updates only the CALLER's own row. The user to update
# is taken exclusively from get_current_user (i.e. from the JWT),
# never from anything in the request body -- there is no user_id
# field on UpdateProfileRequest, so there is nothing for a caller to
# tamper with to target a different account. This mirrors the same
# "identity comes from the token, not the payload" pattern already
# used by every other authenticated route in this file.
@router.put("/auth/me", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.full_name is not None:
        trimmed_name = request.full_name.strip()
        if not trimmed_name:
            raise HTTPException(
                status_code=400,
                detail="Full name cannot be empty",
            )
        if len(trimmed_name) > 100:
            raise HTTPException(
                status_code=400,
                detail="Full name is too long (max 100 characters)",
            )
        current_user.full_name = trimmed_name

    if request.email is not None:
        # EmailStr already validated the format. Only check uniqueness
        # if the email is actually changing -- otherwise a user saving
        # their own unchanged email would incorrectly collide with
        # themselves.
        if request.email != current_user.email:
            existing_user = (
                db.query(User)
                .filter(User.email == request.email)
                .first()
            )
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Email is already in use by another account",
                )
            current_user.email = request.email

    # Note: role is intentionally never touched here. UpdateProfileRequest
    # has no `role` field and forbids extra fields, so a caller cannot
    # even send one -- FastAPI/Pydantic would reject the request with
    # a 422 before this function body runs.

    db.commit()
    db.refresh(current_user)

    return current_user


# CHANGE OWN PASSWORD
#
# POST /auth/change-password. Same identity rule as update_profile:
# the account being changed comes only from the JWT via
# get_current_user. The caller must additionally prove they know the
# CURRENT password (verified with the existing verify_password()
# helper) before a new one is accepted, so a stolen/leaked token alone
# is not enough to lock the real owner out.
@router.post("/auth/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long",
        )

    if request.new_password == request.current_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password",
        )

    current_user.password_hash = hash_password(request.new_password)
    db.commit()

    # Never return the password or the hash -- only a plain confirmation.
    return {"message": "Password updated successfully"}


# ADMIN-ONLY TEST ROUTE

@router.get("/admin-only")
def admin_only_route(
    current_user: User = Depends(
        require_role(["administrator"])
    ),
):
    return {
        "message": (
            f"Welcome, {current_user.full_name}. "
            "You have admin access."
        )
    }

# ADMIN: LIST ALL USERS

@router.get("/admin/users", response_model=list[AdminUserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["administrator"])
    ),
):
    """
    Administrator-only endpoint that returns every registered user.

    Security, step by step:
    1. `oauth2_scheme` (via get_current_user) requires a valid
       'Authorization: Bearer <token>' header -- no token means
       FastAPI returns 401 before this function body ever runs.
    2. `get_current_user` decodes the JWT and loads the matching
       User row from PostgreSQL, so we know exactly who is asking.
    3. `require_role(["administrator"])` checks current_user.role
       and raises 403 for every other role -- this is the exact
       same helper already protecting /admin-only above, so there
       is only one RBAC implementation in the whole backend.
    4. response_model=list[AdminUserResponse] strips the result down
       to id/full_name/email/role for every user in the list --
       password_hash is a real column on the User model, but it is
       not part of AdminUserResponse, so FastAPI/Pydantic drops it
       before the response is ever serialized. It is structurally
       impossible for this endpoint to leak a password hash.
    """
    return db.query(User).all()