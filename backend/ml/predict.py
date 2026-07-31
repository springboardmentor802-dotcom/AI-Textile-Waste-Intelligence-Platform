import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from ml.config import MODEL_PATH, IMAGE_SIZE, DEVICE, NUM_CLASSES

# -------------------------------
# Class Labels
# -------------------------------
CLASS_NAMES = [
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
    "009",
    "010"
]

# -------------------------------
# Fabric Information
# -------------------------------
FABRIC_INFO = {

    "001": {
        "surface": "Plain Weave",
        "material": "Polyester Canvas",
        "recyclability": "Medium",
        "reuse": "Industrial felt, bags, polyester fiber recovery"
    },

    "002": {
        "surface": "Plain Weave",
        "material": "Cotton Poplin",
        "recyclability": "High",
        "reuse": "Cleaning cloths, recycled yarn, insulation"
    },

    "003": {
        "surface": "Twill Weave",
        "material": "Cotton Twill",
        "recyclability": "High",
        "reuse": "Cleaning cloths, recycled yarn, insulation"
    },

    "004": {
        "surface": "Twill Weave",
        "material": "Polyester Twill",
        "recyclability": "Medium",
        "reuse": "Polyester fiber recovery, bags, upholstery"
    },

    "005": {
        "surface": "Dense Woven Surface",
        "material": "Jacquard Fabric",
        "recyclability": "Medium",
        "reuse": "Home furnishings, cushion covers, upholstery"
    },

    "006": {
        "surface": "Plain Weave",
        "material": "Cotton Shirting Fabric",
        "recyclability": "High",
        "reuse": "Cleaning cloths, recycled yarn, quilting"
    },

    "007": {
        "surface": "Twill Weave",
        "material": "Denim (Heavy Cotton Twill)",
        "recyclability": "High",
        "reuse": "Bags, insulation, recycled denim products"
    },

    "008": {
        "surface": "Knitted Surface",
        "material": "Polyester Jersey Knit",
        "recyclability": "Medium",
        "reuse": "Sportswear fibers, stuffing, recycled textiles"
    },

    "009": {
        "surface": "Patterned Surface",
        "material": "Denim (Indigo Twill)",
        "recyclability": "High",
        "reuse": "Fashion accessories, insulation, recycled denim"
    },

    "010": {
        "surface": "Dense Woven Surface",
        "material": "Jacquard Upholstery Fabric",
        "recyclability": "Medium",
        "reuse": "Furniture upholstery, decorative products"
    }

}

# -------------------------------
# Image Transform
# -------------------------------
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -------------------------------
# Load Model
# -------------------------------
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model.to(DEVICE)
model.eval()

# -------------------------------
# Prediction Function
# -------------------------------
def predict_image(image_path):

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        outputs = model(image)

        probabilities = torch.softmax(outputs, dim=1)

        confidence, pred = torch.max(probabilities, 1)

    predicted_class = CLASS_NAMES[pred.item()]
    fabric = FABRIC_INFO[predicted_class]

    return predicted_class, fabric, confidence.item() * 100


# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":

    image_path = input("Enter image path: ")

    predicted_class, fabric, confidence = predict_image(image_path)

    print("\n" + "=" * 55)
    print("          TEXTILE FABRIC ANALYSIS REPORT")
    print("=" * 55)

    print(f"Class ID            : {predicted_class}")
    print(f"Surface Type        : {fabric['surface']}")
    print(f"Estimated Material  : {fabric['material']}")
    print(f"Recyclability       : {fabric['recyclability']}")
    print(f"Recommended Reuse   : {fabric['reuse']}")
    print(f"Model Confidence    : {confidence:.2f}%")

    print("=" * 55)