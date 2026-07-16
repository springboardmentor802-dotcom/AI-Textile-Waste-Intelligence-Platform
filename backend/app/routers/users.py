from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    profile_data: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.organization is not None:
        current_user.organization = profile_data.organization
    if profile_data.password is not None:
        if len(profile_data.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        current_user.hashed_password = auth.get_password_hash(profile_data.password)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("", response_model=List[schemas.UserResponse])
def list_users(
    admin_user: models.User = Depends(auth.RoleChecker(["Administrator"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    return users

@router.put("/{user_id}/role", response_model=schemas.UserResponse)
def update_user_role(
    user_id: int,
    role_data: schemas.UserRoleUpdate,
    admin_user: models.User = Depends(auth.RoleChecker(["Administrator"])),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-demotion from Admin role to avoid locking out the system
    if user.id == admin_user.id and role_data.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot demote themselves to prevent system lockouts."
        )

    user.role = role_data.role
    db.commit()
    db.refresh(user)
    return user
