from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Import all models so SQLAlchemy knows about them
# This must happen before create_all
from app.models import User

# Create FastAPI app instance
app = FastAPI(
    title="Textile Waste Intelligence Platform",
    description="AI-powered textile waste classification and sustainability analytics",
    version="1.0.0"
)

# CORS middleware
# This allows your React frontend (running on port 3000)
# to make requests to this backend (running on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create all database tables on startup
# If tables already exist, this does nothing (safe to run multiple times)
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")


# Root endpoint to verify the API is running
@app.get("/")
async def root():
    return {
        "message": "Textile Waste Intelligence Platform API",
        "status": "running",
        "version": "1.0.0"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}