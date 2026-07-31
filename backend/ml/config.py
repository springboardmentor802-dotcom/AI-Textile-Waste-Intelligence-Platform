from pathlib import Path
import torch

# Base directory of backend/ml
BASE_DIR = Path(__file__).resolve().parent

# Dataset Path
DATASET_PATH = BASE_DIR.parent.parent / "datasets" / "TenFabrics"

# Model Path
MODEL_PATH = BASE_DIR.parent / "models" / "material_model.pth"

# Image Parameters
IMAGE_SIZE = 224

# Training Parameters
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001

# Device
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Number of Classes
NUM_CLASSES = 10