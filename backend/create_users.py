from app.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

db = SessionLocal()

users = [
    {
        "username": "admin",
        "email": "admin@textileai.com",
        "password": "admin123",
        "role": "Admin",
    },
    {
        "username": "industry1",
        "email": "industry1@textileai.com",
        "password": "industry123",
        "role": "Industry",
    },
    {
        "username": "recycler1",
        "email": "recycler1@textileai.com",
        "password": "recycler123",
        "role": "Recycler",
    },
    {
        "username": "ngo1",
        "email": "ngo1@textileai.com",
        "password": "ngo123",
        "role": "NGO",
    },
]

for u in users:
    existing = db.query(User).filter(User.username == u["username"]).first()

    if existing:
        print(f"{u['username']} already exists")
        continue

    new_user = User(
        username=u["username"],
        email=u["email"],
        hashed_password=get_password_hash(u["password"]),
        role=u["role"],
    )

    db.add(new_user)

db.commit()

print("Users created successfully!")