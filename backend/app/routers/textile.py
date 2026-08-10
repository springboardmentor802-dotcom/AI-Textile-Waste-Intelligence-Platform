from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sqlfunc
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
from app.models.textile_batch import TextileBatch

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


@router.get("/analytics")
def get_inventory_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Aggregated inventory analytics for Chart.js visualizations.
    Queries the textile_batches table directly — no client-side aggregation needed.
    Returns fabric type distribution, condition distribution, and quantity by fabric type.
    """
    total = db.query(TextileBatch).count()

    # Fabric type distribution (count per type)
    fabric_rows = (
        db.query(
            TextileBatch.fabric_type,
            sqlfunc.count(TextileBatch.id).label("count"),
            sqlfunc.sum(TextileBatch.quantity).label("total_quantity"),
        )
        .filter(TextileBatch.fabric_type.isnot(None))
        .group_by(TextileBatch.fabric_type)
        .order_by(sqlfunc.count(TextileBatch.id).desc())
        .all()
    )

    # Condition distribution (count per condition)
    condition_rows = (
        db.query(
            TextileBatch.condition,
            sqlfunc.count(TextileBatch.id).label("count"),
        )
        .filter(TextileBatch.condition.isnot(None))
        .group_by(TextileBatch.condition)
        .all()
    )

    # ML analyzed status distribution
    ml_status_rows = (
        db.query(
            TextileBatch.ml_analyzed,
            sqlfunc.count(TextileBatch.id).label("count"),
        )
        .group_by(TextileBatch.ml_analyzed)
        .all()
    )

    # Total quantity in inventory
    total_quantity = (
        db.query(sqlfunc.sum(TextileBatch.quantity))
        .filter(TextileBatch.quantity.isnot(None))
        .scalar()
    )

    def r(val):
        return round(float(val), 2) if val is not None else 0.0

    return {
        "total_batches": total,
        "total_quantity_kg": r(total_quantity),
        "fabric_type_distribution": [
            {
                "fabric_type": str(row.fabric_type.value) if hasattr(row.fabric_type, "value") else str(row.fabric_type),
                "count": row.count,
                "total_quantity_kg": r(row.total_quantity),
            }
            for row in fabric_rows
        ],
        "condition_distribution": [
            {
                "condition": str(row.condition.value) if hasattr(row.condition, "value") else str(row.condition),
                "count": row.count,
            }
            for row in condition_rows
        ],
        "ml_status_distribution": [
            {
                "status": row.ml_analyzed or "pending",
                "count": row.count,
            }
            for row in ml_status_rows
        ],
    }


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