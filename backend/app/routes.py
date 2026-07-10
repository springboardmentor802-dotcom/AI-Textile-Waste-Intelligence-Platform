from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Inventory, FabricTypeEnum, ConditionEnum, StatusEnum
from app.schemas import UserCreate, UserLogin, UserResponse, InventoryCreate, InventoryUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

# Single router definition for the whole file
router = APIRouter(prefix="/auth", tags=["Authentication & Inventory"])

# ==========================================
# 🔐 USER AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)

    token_claims = {
        "sub": str(user.id),  # standard practice id tracking ke liye
        "role": role_value
    }
    access_token = create_access_token(data=token_claims)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": role_value
    }

# ==========================================
# 📦 TEXTILE INVENTORY ENDPOINTS
# ==========================================

# 1. Create - Waste Registration
@router.post("/inventory/", status_code=status.HTTP_201_CREATED)
def register_waste(payload: InventoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Batch ID uniqueness check
    existing_batch = db.query(Inventory).filter(Inventory.batch_id == payload.batch_id).first()
    if existing_batch:
        raise HTTPException(status_code=400, detail="Waste Batch ID already exists!")
    
    new_item = Inventory(
        user_id=current_user.id,
        batch_id=payload.batch_id,
        fabric_type=payload.fabric_type,
        source=payload.source,
        quantity=payload.quantity,
        color=payload.color,
        condition=payload.condition,
        collection_date=payload.collection_date
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Waste item registered successfully", "id": new_item.id}

# 2. Read - Get All Inventory Items
@router.get("/inventory/")
def get_inventory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Admin & Sustainability Manager can see everything, others see only their own entries
    if current_user.role in ["Admin", "Sustainability Manager"]:
        items = db.query(Inventory).all()
    else:
        items = db.query(Inventory).filter(Inventory.user_id == current_user.id).all()
        
    return {"data": items}

# 3. Update - Batch Management / Monitoring
@router.put("/inventory/{item_id}")
def update_inventory(item_id: int, payload: InventoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    # Authorization Check
    if item.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=401, detail="Not authorized to update this batch")
        
    # Dynamically updating fields if they are sent in request body
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    db.commit()
    db.refresh(item)
    return {"message": "Inventory updated successfully"}

# 4. Delete - Remove Waste Record
@router.delete("/inventory/{item_id}")
def delete_inventory(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    if item.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=401, detail="Not authorized to delete this batch")
        
    db.delete(item)
    db.commit()
    return {"message": "Inventory item removed successfully"}