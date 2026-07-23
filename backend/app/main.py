from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.config.database import db
from app.routes.users import router as users_router
from app.routes.inventory import router as inventory_router

app = FastAPI(
    title="AI Textile Waste Intelligence Platform API",
    version="1.0.0",
    debug=True,
)

app.include_router(inventory_router)
app.include_router(auth_router)
app.include_router(users_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Backend running!"
    }


@app.get("/health")
async def health():
    await db.command("ping")
    return {
        "status": "MongoDB Connected"
    }