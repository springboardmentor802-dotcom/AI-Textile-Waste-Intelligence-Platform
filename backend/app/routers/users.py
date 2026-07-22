from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.user import UserResponse, ChangePasswordRequest, UpdateProfileRequest
from app.services.auth_service import (
    get_all_users,
    get_user_by_id,
    deactivate_user,
    activate_user,
    verify_password,
    hash_password,
)
from app.middleware.auth_middleware import get_current_active_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_all_users(db)


@router.get("/me/profile", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me/profile", response_model=UserResponse)
def update_profile(
    update_data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if update_data.full_name:
        current_user.full_name = update_data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = hash_password(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.id != user_id and current_user.role.value != "Administrator":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
def deactivate(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return deactivate_user(db, user_id)


@router.patch("/{user_id}/activate", response_model=UserResponse)
def activate(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return activate_user(db, user_id)


@router.delete("/{user_id}")
def delete_user_account(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}