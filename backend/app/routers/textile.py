from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.textile_batch import (
    TextileBatchCreate,
    TextileBatchUpdate,
    TextileBatchResponse,
    TextileBatchListResponse,
)
from app.services.textile_service import (
    create_textile_batch,
    get_all_batches,
    get_single_batch,
    update_textile_batch,
    delete_textile_batch,
)
from app.middleware.auth_middleware import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/inventory", tags=["Textile Inventory"])


@router.post(
    "/",
    response_model=TextileBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_batch(
    data: TextileBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return create_textile_batch(db, data, created_by=current_user.id)


@router.get("/", response_model=TextileBatchListResponse)
def list_batches(
    search: Optional[str] = Query(None, description="Search by batch ID, source, or color"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_all_batches(db, search=search, skip=skip, limit=limit)


@router.get("/{batch_id}", response_model=TextileBatchResponse)
def get_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_single_batch(db, batch_id)


@router.put("/{batch_id}", response_model=TextileBatchResponse)
def update_batch(
    batch_id: str,
    data: TextileBatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return update_textile_batch(db, batch_id, data, updated_by=current_user.id)


@router.delete("/{batch_id}")
def delete_batch(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return delete_textile_batch(db, batch_id)