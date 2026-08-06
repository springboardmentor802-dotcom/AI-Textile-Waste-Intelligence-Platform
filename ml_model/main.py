import os
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from predictor import predict_textile

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ai_waste_platform")

app = FastAPI(
    title="AI Textile Waste Recognition & Circular Economy Classification API",
    description="Microservice for OpenCV preprocessing, TensorFlow CNN classification, and recyclability scoring",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", summary="Health check endpoint")
async def health_check():
    """
    Checks the service and model state.
    """
    try:
        from predictor import get_model
        # Check model loading state
        get_model()
        return {"status": "healthy", "model_loaded": True}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}

@app.post("/predict", summary="Upload and analyze a textile image")
async def predict(file: UploadFile = File(...)):
    """
    Uploads a textile image, performs OpenCV preprocessing (resize, denoise, normalise),
    runs TensorFlow CNN material prediction, determines waste category, and outputs recyclability score.
    """
    logger.info(f"Received prediction request. File: {file.filename}, Content-Type: {file.content_type}")
    
    # Format validation using both extension and content_type header
    filename_lower = (file.filename or "").lower()
    content_type_lower = (file.content_type or "").lower()

    allowed_exts = ('.jpg', '.jpeg', '.png', '.webp')
    allowed_mimes = ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/pjpeg')

    is_ext_valid = any(filename_lower.endswith(ext) for ext in allowed_exts)
    is_mime_valid = any(mime in content_type_lower for mime in allowed_mimes)

    if not (is_ext_valid or is_mime_valid):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only JPG, JPEG, PNG, and WEBP images are supported."
        )
    
    try:
        # Read file bytes
        image_bytes = await file.read()
        
        # Execute prediction
        result = predict_textile(image_bytes)
        
        logger.info(f"Prediction successful for {file.filename}: {result['predictedMaterial']} ({result['materialConfidence']}%)")
        return result
    except ValueError as val_err:
        logger.warning(f"Validation error: {val_err}")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        logger.error(f"Prediction error for file {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")

@app.post("/train", summary="Retrain the classification model")
async def train_model():
    """
    Retriggers CNN training using synthetic data and saves the updated weights.
    """
    logger.info("Retraining requested.")
    try:
        from train import main as train_main
        train_main()
        
        # Force model reload on next prediction
        import predictor
        predictor._MODEL = None
        
        logger.info("Model retrained successfully.")
        return {"success": True, "message": "Model retrained and loaded successfully."}
    except Exception as e:
        logger.error(f"Training error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

if __name__ == "__main__":
    logger.info("Starting AI Microservice...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
