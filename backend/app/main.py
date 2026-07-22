"""
Textile Waste Intelligence Platform — FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models.user import User
from app.models.textile_batch import TextileBatch
from app.routers import auth, users, textile, analysis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered textile waste classification and sustainability analytics",
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Step 1: Create all database tables if they do not already exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully")

    # Step 2: Load the ML model into memory
    # The model stays loaded for the lifetime of the server process.
    # If the model file is missing, we log a warning but do NOT crash
    # the server — all other endpoints (auth, inventory, etc.) continue
    # to work normally. Only /analysis endpoints return 503 until the
    # model file is placed correctly.
    try:
        from app.services.ml_service import load_model
        load_model()
    except FileNotFoundError as e:
        logger.warning(
            f"\n{'='*60}\n"
            f"ML MODEL NOT FOUND — Analysis endpoints will return 503\n"
            f"{str(e)}\n"
            f"{'='*60}"
        )
    except RuntimeError as e:
        logger.error(f"ML model failed to load: {e}")
    except Exception as e:
        logger.error(f"Unexpected error loading ML model: {e}")


# Register all routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(textile.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "status": "running",
        "version": settings.APP_VERSION,
    }


@app.get("/health")
async def health_check():
    from app.services.ml_service import is_model_loaded
    return {
        "status": "healthy",
        "ml_model_loaded": is_model_loaded(),
    }