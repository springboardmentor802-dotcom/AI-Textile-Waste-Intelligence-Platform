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

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
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
    # Database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created")

    # Material Recognition CNN
    try:
        from app.services.ml_service import load_model
        load_model()
    except FileNotFoundError as e:
        logger.warning(f"CNN model not found — /analysis/material-recognition returns 503\n{e}")
    except Exception as e:
        logger.error(f"CNN model load failed: {e}")

    # YOLOv8 Defect Detection
    try:
        from app.services.yolo_service import load_yolo_model
        load_yolo_model()
    except FileNotFoundError as e:
        logger.warning(f"YOLOv8 model not found — defect detection returns 503\n{e}")
    except Exception as e:
        logger.error(f"YOLOv8 model load failed: {e}")


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
    from app.services.yolo_service import is_yolo_loaded
    return {
        "status": "healthy",
        "material_recognition_loaded": is_model_loaded(),
        "defect_detection_loaded": is_yolo_loaded(),
    }