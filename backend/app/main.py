from app.routes import auth
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.database import Base, engine
from app.routes import users, inventory, uploads, recommendations

# Import all models so SQLAlchemy knows about them
from app.models.user import User
from app.models.textile_inventory import TextileInventory
from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation

# Create tables if they don't already exist
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
# Register routes
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