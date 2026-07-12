from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database.base import Base

from app.models.user import User
from app.models.inventory import Inventory

from app.api.router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Textile Waste Intelligence Platform"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }