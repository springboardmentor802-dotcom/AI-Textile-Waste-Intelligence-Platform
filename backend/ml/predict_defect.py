import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from ml.config import DEVICE

# -----------------------------
# Configuration
# -----------------------------
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR.parent / "models" / "defect_model.pth"
NUM_CLASSES = 2
IMAGE_SIZE = 224

CLASS_NAMES = [
    "No Defect",
    "Defect"
]

# -----------------------------
# Image Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -----------------------------
# Load Model
# -----------------------------
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# -----------------------------
# Prediction Function
# -----------------------------
def predict_defect(image_path):

    image = Image.open(image_path).convert("RGB")

    image = transform(image)

    image = image.unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        outputs = model(image)

        probabilities = torch.softmax(outputs, dim=1)

        confidence, pred = torch.max(probabilities, 1)

    return CLASS_NAMES[pred.item()], confidence.item() * 100

# -----------------------------
# Main
# -----------------------------
if __name__ == "__main__":

    image_path = input("Enter image path: ")

    prediction, confidence = predict_defect(image_path)

    print("\n" + "=" * 50)
    print("        DEFECT ANALYSIS REPORT")
    print("=" * 50)
    print(f"Prediction        : {prediction}")
    print(f"Confidence        : {confidence:.2f}%")
    print("=" * 50)