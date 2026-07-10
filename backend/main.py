from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import client
from auth_endpoints import router as auth_router
from inventory_collection import router as inventory_router
from ml_endpoints import router as ml_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"Failed to connect to MongoDB. Error: {e}")
    
    yield
    
    client.close()
    print("MongoDB connection closed.")

app = FastAPI(
    title="AI Textile Waste Intelligence API",
    description="Backend API for managing textile waste workflows and AI integrations.",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(ml_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Textile Waste Intelligence Platform API"}