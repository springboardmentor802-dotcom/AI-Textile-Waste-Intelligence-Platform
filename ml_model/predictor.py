import os
import cv2
import numpy as np
import base64
from inference_pipeline import TextileInferencePipeline

_PIPELINE = None

def get_pipeline():
    """Returns singleton instance of TextileInferencePipeline."""
    global _PIPELINE
    if _PIPELINE is None:
        model_path = os.path.join(os.path.dirname(__file__), "..", "models", "textile_model.keras")
        if not os.path.exists(model_path):
            model_path = os.path.join(os.path.dirname(__file__), "textile_model.keras")
        
        config_path = os.path.join(os.path.dirname(__file__), "..", "models", "prediction_config.json")
        labels_path = os.path.join(os.path.dirname(__file__), "..", "models", "class_labels.json")

        _PIPELINE = TextileInferencePipeline(
            model_path=model_path,
            config_path=config_path if os.path.exists(config_path) else None,
            labels_path=labels_path if os.path.exists(labels_path) else None
        )
    return _PIPELINE

def predict_textile(image_bytes):
    """
    Main prediction function called by FastAPI & microservice handlers.
    Runs real TensorFlow model inference on raw image bytes.
    """
    pipeline = get_pipeline()
    result = pipeline.predict(image_bytes)

    # OpenCV Preprocessing Visual Generation (Bilateral Denoising + Canny Edge Extraction)
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is not None:
        target_w, target_h = pipeline.config.get("input_shape", [224, 224])[0:2]
        img_resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_AREA)
        
        # 1. Bilateral Denoising Filter
        denoised = cv2.bilateralFilter(img_resized, 9, 75, 75)
        
        # 2. Grayscale & CLAHE Contrast Equalization
        gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        equalized = clahe.apply(gray)
        
        # 3. Canny Edge Feature Extraction
        edges = cv2.Canny(equalized, 50, 150)
        
        # 4. Green edge contour overlay matrix
        edge_overlay = np.zeros_like(img_resized)
        edge_overlay[edges > 0] = [0, 255, 100]
        
        equalized_bgr = cv2.cvtColor(equalized, cv2.COLOR_GRAY2BGR)
        preprocessed_visual = cv2.addWeighted(equalized_bgr, 0.70, edge_overlay, 0.30, 0)
        
        # 5. Burn OpenCV feature tag into visual frame
        cv2.putText(preprocessed_visual, "OPENCV PREPROCESSED", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 120), 1, cv2.LINE_AA)
        
        _, buffer = cv2.imencode('.png', preprocessed_visual)
        preprocessed_base64 = base64.b64encode(buffer).decode('utf-8')
    else:
        preprocessed_base64 = ""

    result["preprocessedBase64"] = preprocessed_base64
    return result

def get_model():
    """Exposes model object for health checks."""
    pipeline = get_pipeline()
    return pipeline.model

if __name__ == "__main__":
    print("Testing predictor.py...")
    # Create test dummy image bytes
    dummy = np.ones((224, 224, 3), dtype=np.uint8) * 128
    _, buf = cv2.imencode('.jpg', dummy)
    res = predict_textile(buf.tobytes())
    print("Material Predicted:", res["predictedMaterial"], f"({res['materialConfidence']}%)")
