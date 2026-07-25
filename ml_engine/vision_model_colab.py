import json
from pathlib import Path
import argparse
import sys
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import time
import random

try:
    BASE_DIR = Path(PROJECT_DIR)  
except NameError:
    BASE_DIR = Path(__file__).resolve().parent  

DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"          
TAXONOMY_PATH = BASE_DIR / "taxonomy.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DEVICE_NAME = f"CUDA ({torch.cuda.get_device_name(0)})" if torch.cuda.is_available() else "CPU"
print(f"Training on: {DEVICE_NAME}")
if DEVICE.type == "cpu":
    print("WARNING: no GPU detected. In Colab, go to Runtime > Change runtime type > GPU.")

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

    def __init__(self, csv_path: Path, split: str, label_to_idx: dict, transform, sample_size: int = None):
        df = pd.read_csv(csv_path)
        self.df = df[df["split"] == split].reset_index(drop=True)
        if sample_size is not None and len(self.df) > sample_size:
            self.df = self.df.sample(sample_size, random_state=42).reset_index(drop=True)
        self.label_to_idx = label_to_idx
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        for _ in range(10):
            row = self.df.iloc[idx]
            image_path = row["image_path"].replace("\\", "/")
            full_path = DATASETS_DIR / image_path
            t_start = time.time()
            try:
                image = Image.open(full_path).convert("RGB")
                image = self.transform(image)
                label = self.label_to_idx[row["label"]]
                t_elapsed = time.time() - t_start
                if idx < 50:
                    print(f"  __getitem__ idx={idx} path={full_path} time={t_elapsed:.3f}s")
                return image, label
            except (OSError, FileNotFoundError):
                idx = random.randint(0, len(self.df) - 1)
        raise RuntimeError("Failed to load a valid image after 10 random attempts")

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
            f"{csv_path} not found -- upload/regenerate the datasets in Drive first."
        )

    train_ds = CSVImageDataset(csv_path, "train", label_to_idx, TRAIN_TRANSFORM)
    val_ds = CSVImageDataset(csv_path, "val", label_to_idx, EVAL_TRANSFORM)
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    model = build_classifier(num_classes=len(labels))
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    best_val_acc = 0.0
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    checkpoint_path = MODELS_DIR / f"{task_name}_checkpoint.pt" 
    start_epoch = 0

    if checkpoint_path.exists():
        checkpoint = torch.load(checkpoint_path, map_location=DEVICE)
        model.load_state_dict(checkpoint["model_state"])
        optimizer.load_state_dict(checkpoint["optimizer_state"])
        start_epoch = checkpoint["epoch"] + 1
        best_val_acc = checkpoint["best_val_acc"]
        print(f"[{task_name}] resuming from epoch {start_epoch} (best_val_acc so far={best_val_acc:.4f})")

    for epoch in range(start_epoch, epochs):
        model.train()
        running_loss = 0.0
        num_batches = len(train_loader)
        batch_start = time.time()
        for batch_idx, (images, targets) in enumerate(train_loader):
            fetch_time = time.time() - batch_start
            t0 = time.time()
            images, targets = images.to(DEVICE), targets.to(DEVICE)
            t1 = time.time()
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, targets)
            t2 = time.time()
            loss.backward()
            optimizer.step()
            t3 = time.time()
            running_loss += loss.item() * images.size(0)

            if batch_idx < 10:
                print(f"batch {batch_idx}: fetch={fetch_time:.3f}s to_device={t1-t0:.3f}s forward+loss={t2-t1:.3f}s backward+step={t3-t2:.3f}s")
            batch_start = time.time()
            if (batch_idx + 1) % 20 == 0 or (batch_idx + 1) == num_batches:
                print(f"[{task_name}] epoch {epoch + 1}/{epochs}  batch {batch_idx + 1}/{num_batches}  "
                      f"running_loss={running_loss / ((batch_idx + 1) * train_loader.batch_size):.4f}")

        train_loss = running_loss / len(train_ds)
        val_acc = evaluate(model, val_loader)
        print(f"[{task_name}] epoch {epoch + 1}/{epochs}  train_loss={train_loss:.4f}  val_acc={val_acc:.4f}")

        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "best_val_acc": max(best_val_acc, val_acc),
        }, checkpoint_path)

        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODELS_DIR / f"{task_name}_classifier.pt")
            with open(MODELS_DIR / f"{task_name}_labels.json", "w") as f:
                json.dump(labels, f)

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

def run_training(fresh=None, task_epochs=None):

    fresh = fresh or []
    task_epochs = task_epochs or {"garment": 3, "material": 10, "waste": 10}

    tasks = [
        ("garment", "garment_dataset.csv", "garment_type"),
        ("material", "material_dataset.csv", "material_type"),
        ("waste", "waste_dataset.csv", "waste_status"),
    ]

    fresh_tasks = {t[0] for t in tasks} if "all" in fresh else set(fresh)
    for task_name in fresh_tasks:
        checkpoint_path = MODELS_DIR / f"{task_name}_checkpoint.pt"
        if checkpoint_path.exists():
            checkpoint_path.unlink()
            print(f"[fresh] deleted checkpoint for '{task_name}' -- will restart from epoch 0")

    for task_name, csv_filename, taxonomy_key in tasks:
        if (DATASETS_DIR / csv_filename).exists():
            train_classifier(task_name, csv_filename, taxonomy_key, epochs=task_epochs[task_name])
        else:
            print(f"[skip] {csv_filename} not found -- run data_preprocessing.py first")

if __name__ == "__main__":
    if "ipykernel" in sys.modules:
        print("Detected notebook environment -- call run_training(...) directly from a cell instead of running this as __main__.")
    else:
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--fresh",
            nargs="+",
            choices=["garment", "material", "waste", "all"],
            default=[],
        )
        args = parser.parse_args()
        run_training(fresh=args.fresh)