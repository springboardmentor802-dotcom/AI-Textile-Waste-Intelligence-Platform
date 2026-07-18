from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import users, inventory, uploads, recommendations, auth

from app.database import Base, engine

from app.models.user import User
from app.models.textile_inventory import TextileInventory
from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Textile Waste Intelligence Platform",
    description="Backend API for textile waste classification and management",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(uploads.router)
app.include_router(recommendations.router)
app.include_router(auth.router)


@app.get("/")
def home():
    return {
        "message": "AI Textile Waste Intelligence Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "Backend is healthy"
    }