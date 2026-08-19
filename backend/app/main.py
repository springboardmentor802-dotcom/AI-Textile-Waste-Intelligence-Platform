from fastapi import FastAPI

from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import (
    CORSMiddleware,
)


# ==========================================================
# API ROUTERS
# ==========================================================

from app.api import (
    prediction,
    analytics,
    dashboard,
)


# ==========================================================
# APPLICATION ROUTERS
# ==========================================================

from app.routes import (
    users,
    inventory,
    uploads,
    recommendations,
    notifications,
    auth,
)


# ==========================================================
# DATABASE
# ==========================================================

from app.database import (
    Base,
    engine,
)


# ==========================================================
# IMPORT MODELS
#
# Import models before create_all() so SQLAlchemy knows
# about every registered database table.
# ==========================================================

from app.models.user import User
from app.models.textile_inventory import TextileInventory
from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation
from app.models.notification import Notification


# ==========================================================
# FASTAPI APPLICATION
# ==========================================================

app = FastAPI(
    title=(
        "AI Textile Waste "
        "Intelligence Platform"
    ),
    description=(
        "Backend API for textile waste "
        "classification, sustainability "
        "analytics, recommendations and "
        "waste management."
    ),
    version="1.0.0",
)


# ==========================================================
# DATABASE INITIALIZATION
# ==========================================================

@app.on_event("startup")
def create_tables():
    """
    Create any missing SQLAlchemy tables when
    the FastAPI application starts.
    """

    Base.metadata.create_all(
        bind=engine
    )


# ==========================================================
# STATIC AI INSPECTION IMAGES
# ==========================================================

app.mount(
    "/temp_uploads",
    StaticFiles(
        directory="temp_uploads"
    ),
    name="temp_uploads",
)


# ==========================================================
# CORS CONFIGURATION
# ==========================================================

allowed_origins = [

    # ------------------------------------------------------
    # LOCAL VITE FRONTEND
    # ------------------------------------------------------

    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # ------------------------------------------------------
    # ALTERNATIVE LOCAL FRONTEND
    # ------------------------------------------------------

    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# ROUTERS
# ==========================================================


# ----------------------------------------------------------
# AUTHENTICATION
# ----------------------------------------------------------

app.include_router(
    auth.router
)


# ----------------------------------------------------------
# USER MANAGEMENT
# ----------------------------------------------------------

app.include_router(
    users.router
)


# ----------------------------------------------------------
# INVENTORY
# ----------------------------------------------------------

app.include_router(
    inventory.router
)


# ----------------------------------------------------------
# WASTE UPLOADS
# ----------------------------------------------------------

app.include_router(
    uploads.router
)


# ----------------------------------------------------------
# AI PREDICTION
# ----------------------------------------------------------

app.include_router(
    prediction.router
)


# ----------------------------------------------------------
# RECOMMENDATIONS
# ----------------------------------------------------------

app.include_router(
    recommendations.router
)


# ----------------------------------------------------------
# SUSTAINABILITY ANALYTICS
# ----------------------------------------------------------

app.include_router(
    analytics.router
)


# ----------------------------------------------------------
# DASHBOARD
# ----------------------------------------------------------

app.include_router(
    dashboard.router
)


# ----------------------------------------------------------
# NOTIFICATIONS
# ----------------------------------------------------------

app.include_router(
    notifications.router
)


# ==========================================================
# ROOT
# ==========================================================

@app.get(
    "/",
    tags=["System"],
)
def home():
    return {
        "message": (
            "AI Textile Waste "
            "Intelligence Backend Running"
        )
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get(
    "/health",
    tags=["System"],
)
def health_check():
    return {
        "status": "Backend is healthy"
    }