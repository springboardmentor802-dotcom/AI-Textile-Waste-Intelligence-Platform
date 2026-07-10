import json
from pathlib import Path

import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"
TAXONOMY_PATH = BASE_DIR / "taxonomy.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMAGE_SIZE = 224
TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
EVAL_TRANSFORM = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

class CSVImageDataset(Dataset):
    """Reads (image_path, label, split) rows produced by data_preprocessing.py."""

    def __init__(self, csv_path: Path, split: str, label_to_idx: dict, transform):
        df = pd.read_csv(csv_path)
        self.df = df[df["split"] == split].reset_index(drop=True)
        self.label_to_idx = label_to_idx
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        image = Image.open(row["image_path"]).convert("RGB")
        image = self.transform(image)
        label = self.label_to_idx[row["label"]]
        return image, label

def build_classifier(num_classes: int) -> nn.Module:
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    return model.to(DEVICE)

def train_classifier(
    task_name: str,
    csv_filename: str,
    taxonomy_key: str,
    epochs: int = 10,
    batch_size: int = 32,
    lr: float = 1e-4,
):
    with open(TAXONOMY_PATH, "r") as f:
        taxonomy = json.load(f)
    labels = taxonomy[taxonomy_key]
    label_to_idx = {label: i for i, label in enumerate(labels)}

    csv_path = DATASETS_DIR / csv_filename
    if not csv_path.exists():
        raise FileNotFoundError(
            f"{csv_path} not found -- run data_preprocessing.py first."
        )

    train_ds = CSVImageDataset(csv_path, "train", label_to_idx, TRAIN_TRANSFORM)
    val_ds = CSVImageDataset(csv_path, "val", label_to_idx, EVAL_TRANSFORM)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    model = build_classifier(num_classes=len(labels))
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_val_acc = 0.0
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, targets in train_loader:
            images, targets = images.to(DEVICE), targets.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        train_loss = running_loss / len(train_ds)
        val_acc = evaluate(model, val_loader)
        print(f"[{task_name}] epoch {epoch + 1}/{epochs}  train_loss={train_loss:.4f}  val_acc={val_acc:.4f}")

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODELS_DIR / f"{task_name}_classifier.pt")
            with open(MODELS_DIR / f"{task_name}_labels.json", "w") as f:
                json.dump(labels, f)

    print(f"[{task_name}] best val_acc={best_val_acc:.4f} -- saved to models/{task_name}_classifier.pt")
    return best_val_acc

@torch.no_grad()
def evaluate(model: nn.Module, loader: DataLoader) -> float:
    model.eval()
    correct, total = 0, 0
    for images, targets in loader:
        images, targets = images.to(DEVICE), targets.to(DEVICE)
        outputs = model(images)
        preds = outputs.argmax(dim=1)
        correct += (preds == targets).sum().item()
        total += targets.size(0)
    return correct / total if total else 0.0

if __name__ == "__main__":
    tasks = [
        ("garment", "garment_dataset.csv", "garment_type"),
        ("material", "material_dataset.csv", "material_type"),
        ("waste", "waste_dataset.csv", "waste_status"),
    ]
    for task_name, csv_filename, taxonomy_key in tasks:
        if (DATASETS_DIR / csv_filename).exists():
            train_classifier(task_name, csv_filename, taxonomy_key)
        else:
            print(f"[skip] {csv_filename} not found -- run data_preprocessing.py first")