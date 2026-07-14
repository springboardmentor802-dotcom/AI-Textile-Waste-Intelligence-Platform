from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.textile_batch import TextileBatch
from app.schemas.textile_batch import TextileBatchCreate, TextileBatchUpdate


def get_batch_by_batch_id(db: Session, batch_id: str):
    return db.query(TextileBatch).filter(TextileBatch.batch_id == batch_id).first()


def get_batch_by_id(db: Session, id: int):
    return db.query(TextileBatch).filter(TextileBatch.id == id).first()


def create_textile_batch(
    db: Session, data: TextileBatchCreate, created_by: int
) -> TextileBatch:
    existing = get_batch_by_batch_id(db, data.batch_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch ID '{data.batch_id}' already exists",
        )
    batch = TextileBatch(
        batch_id=data.batch_id,
        fabric_type=data.fabric_type,
        source=data.source,
        quantity=data.quantity,
        color=data.color,
        condition=data.condition,
        collection_date=data.collection_date,
        created_by=created_by,
        ml_analyzed="pending",
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


def get_all_batches(
    db: Session,
    search: str = None,
    skip: int = 0,
    limit: int = 100,
) -> dict:
    query = db.query(TextileBatch)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                TextileBatch.batch_id.ilike(search_term),
                TextileBatch.source.ilike(search_term),
                TextileBatch.color.ilike(search_term),
            )
        )
    total = query.count()
    items = query.order_by(TextileBatch.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


def get_single_batch(db: Session, batch_id: str) -> TextileBatch:
    batch = get_batch_by_batch_id(db, batch_id)
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Batch '{batch_id}' not found",
        )
    return batch


def update_textile_batch(
    db: Session, batch_id: str, data: TextileBatchUpdate, updated_by: int
) -> TextileBatch:
    batch = get_single_batch(db, batch_id)
    update_fields = data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(batch, field, value)
    db.commit()
    db.refresh(batch)
    return batch


def delete_textile_batch(db: Session, batch_id: str) -> dict:
    batch = get_single_batch(db, batch_id)
    db.delete(batch)
    db.commit()
    return {"message": f"Batch '{batch_id}' deleted successfully"}