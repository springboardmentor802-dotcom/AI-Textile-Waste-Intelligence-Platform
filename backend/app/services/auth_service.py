from sqlalchemy.orm import Session

from app.models.user import User
from app.auth.password import hash_password


def register_user(
    db: Session,
    data
):

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        return None

    new_user = User(

        full_name=data.full_name,

        email=data.email,

        phone_number=data.phone_number,

        company_name=data.company_name,

        role=data.role,

        password_hash=hash_password(data.password)

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user

from app.auth.password import verify_password


def login_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user