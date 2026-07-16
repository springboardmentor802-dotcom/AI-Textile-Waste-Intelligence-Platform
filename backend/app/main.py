import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.routers import auth, users, inventory, datasets, analysis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed DB
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Textile Waste Intelligence Platform API",
    description="Milestone 1 Core API supporting User Authentication, RBAC, and Inventory CRUD.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # default Vite port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(datasets.router)
app.include_router(analysis.router)

# Mount Static Uploads Folder
os.makedirs(os.path.join("app", "static", "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join("app", "static")), name="static")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Textile Waste Intelligence Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }
