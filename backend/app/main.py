from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


from app.api import prediction, analytics


from app.routes import (
    users,
    inventory,
    uploads,
    recommendations,
    auth
)


from app.database import Base, engine


# Import models so SQLAlchemy knows all tables

from app.models.user import User
from app.models.textile_inventory import TextileInventory
from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation




app = FastAPI(

    title="AI Textile Waste Intelligence Platform",

    description="Backend API for textile waste classification and management",

    version="1.0"

)




# --------------------------------
# Database Initialization
# --------------------------------

@app.on_event("startup")
def create_tables():

    Base.metadata.create_all(
        bind=engine
    )




# --------------------------------
# Serve AI inspection images
# --------------------------------

app.mount(

    "/temp_uploads",

    StaticFiles(directory="temp_uploads"),

    name="temp_uploads"

)





# --------------------------------
# CORS Configuration
# --------------------------------


app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:5173",

        "http://127.0.0.1:5173"

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)





# --------------------------------
# API Routers
# --------------------------------


app.include_router(
    analytics.router
)


app.include_router(
    prediction.router
)


app.include_router(
    users.router
)


app.include_router(
    inventory.router
)


app.include_router(
    uploads.router
)


app.include_router(
    recommendations.router
)


app.include_router(
    auth.router
)






# --------------------------------
# Health Routes
# --------------------------------


@app.get("/")
def home():

    return {

        "message":
        "AI Textile Waste Intelligence Backend Running"

    }





@app.get("/health")
def health_check():

    return {

        "status":
        "Backend is healthy"

    }