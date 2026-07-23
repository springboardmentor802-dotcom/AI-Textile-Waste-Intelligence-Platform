import torch
from ultralytics import YOLO
import threading

# Limit PyTorch CPU threads
torch.set_num_threads(1)

_model = None
_model_lock = threading.Lock()


def get_model(model_path: str = "utlis/best.pt"):
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = YOLO(model_path)
    return _model


def predict_image(image_path: str):
    model = get_model()

    # Run prediction
    results = model.predict(image_path, verbose=False)

    # First result
    result = results[0]

    # Top prediction
    class_id = int(result.probs.top1)
    confidence = float(result.probs.top1conf)
    class_name = model.names[class_id]

    return {
        "status": "Prediction completed",
        "predicted_class": class_name,
        "confidence": round(confidence, 4)
    }