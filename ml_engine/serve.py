import io
import json
from pathlib import Path
import torch
from torchvision import transforms
from PIL import Image

from .vision_model_colab import build_classifier, DEVICE, IMAGE_SIZE
from .color_analyzer import analyze_colors
from .texture_pattern_analyzer import analyze_texture_and_pattern

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

INFER_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

TASKS = ["garment", "material", "waste"]
_loaded = {} 

def _load_task(task_name: str):
    weights_path = MODELS_DIR / f"{task_name}_classifier.pt"
    labels_path = MODELS_DIR / f"{task_name}_labels.json"

    if not (weights_path.exists() and labels_path.exists()):
        print(f"[serve] {task_name} model not found -- train it first (vision_model.py)")
        return None, None

    with open(labels_path, "r") as f:
        labels = json.load(f)

    model = build_classifier(num_classes=len(labels))
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE, weights_only=False))
    model.eval()
    return model, labels

def _load_all_models():
    for task_name in TASKS:
        _loaded[task_name] = _load_task(task_name)
_load_all_models()

@torch.no_grad()
def _predict(task_name: str, image_tensor: torch.Tensor):
    model, labels = _loaded.get(task_name, (None, None))
    if model is None:
        return None, None

    outputs = model(image_tensor.unsqueeze(0).to(DEVICE))
    probs = torch.softmax(outputs, dim=1)[0]
    top_idx = int(probs.argmax())
    return labels[top_idx], float(probs[top_idx])

MATERIAL_TRANSFORM = transforms.Compose([
    transforms.CenterCrop(int(IMAGE_SIZE * 0.6)),
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def analyze_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    standard_tensor = INFER_TRANSFORM(image)
    material_tensor = MATERIAL_TRANSFORM(image)

    result = {}

    label, confidence = _predict("garment", standard_tensor)
    result["garment_type"] = {"label": label, "confidence": round(confidence, 4)} if label else None

    label, confidence = _predict("material", material_tensor)
    result["material_type"] = {"label": label, "confidence": round(confidence, 4)} if label else None

    label, confidence = _predict("waste", standard_tensor)
    result["waste_status"] = {"label": label, "confidence": round(confidence, 4)} if label else None

    texture_pattern = analyze_texture_and_pattern(image_bytes)
    result["visual_features"] = {
        "color_analysis": analyze_colors(image_bytes),
        "texture": texture_pattern["texture"],
        "pattern": texture_pattern["pattern"],
    }

    return result

def analyze_defects(image_bytes: bytes) -> dict:
    if "defect" not in _loaded:
        _loaded["defect"] = _load_task("defect")

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = INFER_TRANSFORM(image)
    label, confidence = _predict("defect", tensor)
    return {"defect_type": {"label": label, "confidence": round(confidence, 4)} if label else None}

def analyze_image_full(image_bytes: bytes) -> dict:
    result = analyze_image(image_bytes)
    result.update(analyze_defects(image_bytes))
    return result

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python serve.py <image_path>")
    else:
        with open(sys.argv[1], "rb") as f:
            image_bytes = f.read()
        print(json.dumps(analyze_image_full(image_bytes), indent=2))