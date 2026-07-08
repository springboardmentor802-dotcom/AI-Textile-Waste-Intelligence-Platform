from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db
from app.auth.hashing import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

from app.schemas.user import UserLogin, Token
from app.auth.hashing import verify_password
from app.auth.jwt_handler import create_access_token

from app.auth.dependencies import get_current_user
from app.schemas.user import UserProfile
from app.auth.dependencies import get_current_admin
from app.auth.dependencies import get_current_admin
from app.schemas.user import UserUpdate
from app.schemas.user import PasswordChange
from app.schemas.user import UserListResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/register", response_model=UserResponse)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )
    

    ALLOWED_ROLES = [
    "Manufacturer",
    "Recycler"
    ]

    if user.role not in ALLOWED_ROLES:
        raise HTTPException(
          status_code=400,
          detail="Invalid role selected."
    )

    # Create new user
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "user_id": db_user.id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UserProfile
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):

    return current_user





@router.get("/admin")
def admin_dashboard(
    current_user: User = Depends(get_current_admin)
):
    return {
        "message": "Welcome Admin!",
        "user": current_user.name
    }

@router.get(
    "",
    response_model=UserListResponse
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    users = db.query(User).all()

    return {
        "users": users
    }


@router.get(
    "/{user_id}",
    response_model=UserResponse
)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


@router.put(
    "/profile",
    response_model=UserResponse
)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_user = db.query(User).filter(
        User.email == user_data.email,
        User.id != current_user.id
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    current_user.name = user_data.name
    current_user.email = user_data.email

    db.commit()
    db.refresh(current_user)

    return current_user

@router.put("/change-password")
def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
           status_code=400,
           detail="New password cannot be the same as the old password."
    )

    if not verify_password(
        password_data.old_password,
        current_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Old password is incorrect"
        )

    current_user.password = hash_password(
        password_data.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully"
    }


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Prevent admin from deleting themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account."
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }