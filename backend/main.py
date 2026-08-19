from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import client, ensure_indexes
from auth_endpoints import router as auth_router
from inventory_collection import router as inventory_router
from ml_endpoints import router as ml_router
from sustainability_endpoints import router as sustainability_router
from notifications_endpoints import router as notifications_router
from admin_endpoints import router as admin_router
from notifications_scheduler import scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"Failed to connect to MongoDB. Error: {e}")

    await ensure_indexes()

    if not scheduler.running:
        scheduler.start()
        
    yield
    
    if scheduler.running:
        scheduler.shutdown()
    client.close()
    print("MongoDB connection closed and scheduler stopped.")

app = FastAPI(
    title="AI Textile Waste Intelligence API",
    description="Backend API for managing textile waste workflows and AI integrations.",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://15.252.180.26", "http://13.235.118.152"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|13\.235\.118\.152)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(ml_router)
app.include_router(sustainability_router)
app.include_router(notifications_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Textile Waste Intelligence Platform API"}
