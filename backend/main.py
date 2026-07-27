import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.user import router as user_router
from app.api.manufacturer import router as manufacturer_router
from app.api.inventory import router as inventory_router
from app.api import sustainability_dataset

# New Router
from app.api.material_analysis import router as material_analysis_router


app = FastAPI(
    title="Textile Waste Intelligence Platform"
)

# -----------------------------------------------------
# CORS Configuration
# -----------------------------------------------------

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# Create Upload Directory
# -----------------------------------------------------

os.makedirs("uploads/textile_images", exist_ok=True)

# -----------------------------------------------------
# Static Files
# Uploaded images will be accessible via:
# http://localhost:8000/uploads/textile_images/<image_name>
# -----------------------------------------------------

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

# -----------------------------------------------------
# API Routers
# -----------------------------------------------------

app.include_router(user_router)
app.include_router(manufacturer_router)
app.include_router(inventory_router)
app.include_router(sustainability_dataset.router)

# Material Analysis Router
app.include_router(material_analysis_router)

# -----------------------------------------------------
# Root Endpoint
# -----------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }