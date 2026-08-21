"""
Material Classification Engine
--------------------------------
Loads the trained PyTorch CNN model (fabric_model.pth) and uses it to
predict fabric fiber type from an uploaded image.

This is Milestone 2, Task 2 -- fabric type classification / fiber
composition prediction.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

# Same model architecture used during training in Jupyter --
# must match exactly, or the saved weights won't load correctly.


class SimpleFabricCNN(nn.Module):
    def __init__(self, num_classes=2):
        super(SimpleFabricCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(64 * 16 * 16, 128)
        self.fc2 = nn.Linear(128, num_classes)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x


# Class labels, in the SAME order used during training
# (acrylic_pct -> 0, polyamide_pct -> 1)
FIBER_CLASSES = ["acrylic", "polyamide"]

# Load the model ONCE when this module is first imported (not on every
# request) -- much faster than reloading the model file every time.
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fabric_model.pth")

_model = SimpleFabricCNN(num_classes=len(FIBER_CLASSES))
_model.load_state_dict(torch.load(
    MODEL_PATH, map_location=torch.device("cpu")))
_model.eval()  # inference mode -- disables dropout etc.

_transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
])


def predict_fabric_type(image_path: str) -> dict:
    """
    Takes a path to an image file, runs it through the trained model,
    and returns the predicted fiber type with a confidence score.
    """
    image = Image.open(image_path).convert("RGB")
    image_tensor = _transform(image).unsqueeze(0)  # add batch dimension

    with torch.no_grad():
        outputs = _model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)
        confidence, predicted_idx = torch.max(probabilities, 1)

    predicted_fiber = FIBER_CLASSES[predicted_idx.item()]

    return {
        "predicted_fiber_type": predicted_fiber,
        "confidence": round(confidence.item() * 100, 2),
    }


# ---------------------------------------------------------------
# Quick manual test
# ---------------------------------------------------------------
if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python material_classification_service.py <path_to_image>")
    else:
        result = predict_fabric_type(sys.argv[1])
        print(json.dumps(result, indent=2))
