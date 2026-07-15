print("MAIN LOADED")
from app.database.database import engine
from app.database.base import Base
from app.models.user import User
from app.routes.auth import router as auth_router

from fastapi import FastAPI

app = FastAPI(
    title="AI Textile Waste Intelligence Platform",
    version="1.0.0",
    description="Backend API for AI Textile Waste Intelligence Platform"
)
Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
print(auth_router.routes)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Textile Waste Intelligence Platform"
    }

@app.get("/health")
def health():
    return {
        "status": "Backend Running Successfully"
    }

