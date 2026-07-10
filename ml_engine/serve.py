import io
import json
from pathlib import Path
import torch
from torchvision import transforms
from PIL import Image

from vision_model import build_classifier, DEVICE, IMAGE_SIZE

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
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE))
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


def analyze_image(image_bytes: bytes) -> dict:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = INFER_TRANSFORM(image)

    result = {}
    for task_name, taxonomy_key in zip(TASKS, ["garment_type", "material_type", "waste_status"]):
        label, confidence = _predict(task_name, image_tensor)
        result[taxonomy_key] = (
            {"label": label, "confidence": round(confidence, 4)} if label else None
        )
    return result

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python serve.py <image_path>")
    else:
        with open(sys.argv[1], "rb") as f:
            print(json.dumps(analyze_image(f.read()), indent=2))