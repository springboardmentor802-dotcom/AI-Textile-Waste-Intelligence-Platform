from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

import models
from database import engine
from routes.auth import router as auth_router
from routes.inventory import router as inventory_router
from routes.predict import router as predict_router
from routes.history import router as history_router
from routes.admin import router as admin_router
from routes.notifications import router as notifications_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(admin_router)
app.include_router(notifications_router)

@app.get("/")
def read_root():
    return {"message": "Backend is alive!"}