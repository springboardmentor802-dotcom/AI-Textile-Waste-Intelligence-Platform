from fastapi import FastAPI

app = FastAPI(
    title="AI Textile Waste Intelligence Platform",
    description="Backend API for textile waste classification and management",
    version="1.0"
)


@app.get("/")
def home():
    return {
        "message": "AI Textile Waste Intelligence Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "Backend is healthy"
    }