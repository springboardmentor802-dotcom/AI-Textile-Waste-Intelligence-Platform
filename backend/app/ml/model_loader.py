import torch
import torch.nn as nn
from torchvision import models

from .class_names import CLASS_NAMES

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


def create_model():

    weights = models.EfficientNet_B0_Weights.DEFAULT

    model = models.efficientnet_b0(weights=weights)

    num_features = model.classifier[1].in_features

    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_features, len(CLASS_NAMES))
    )

    return model


def load_model(model_path):

    model = create_model()

    model.load_state_dict(
        torch.load(
            model_path,
            map_location=DEVICE
        )
    )

    model.to(DEVICE)

    model.eval()

    return model