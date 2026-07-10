from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import router

# Database tables initialize
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Textile Waste Intelligence Platform")

# CORS Configuration taaki React Frontend safely connect ho sake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React server ka URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Textile Waste Intelligence Backend is Running"}