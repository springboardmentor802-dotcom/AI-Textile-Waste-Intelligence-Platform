from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.manufacturer import router as manufacturer_router
from app.api.inventory import router as inventory_router
from app.api import sustainability_dataset

from app.api.user import router as user_router

app = FastAPI(
    title="Textile Waste Intelligence Platform"
)

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

app.include_router(user_router)
app.include_router(manufacturer_router)

app.include_router(inventory_router)
app.include_router(sustainability_dataset.router)



@app.get("/")
def home():
    return {"message": "Backend Running"}





