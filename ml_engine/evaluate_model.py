import json
from pathlib import Path
import torch
from torch.utils.data import DataLoader
from torchvision import transforms
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pandas as pd

from vision_model_colab import build_classifier, CSVImageDataset, EVAL_TRANSFORM, DEVICE

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models"
TAXONOMY_PATH = BASE_DIR / "taxonomy.json"

def evaluate_task(task_name: str, csv_filename: str, taxonomy_key: str):
    weights_path = MODELS_DIR / f"{task_name}_classifier.pt"
    labels_path = MODELS_DIR / f"{task_name}_labels.json"
    csv_path = DATASETS_DIR / csv_filename

    if not weights_path.exists() or not labels_path.exists():
        print(f"Model weights or labels for '{task_name}' not found. Train it first.")
        return

    with open(labels_path, "r") as f:
        labels = json.load(f)
    label_to_idx = {label: i for i, label in enumerate(labels)}

    val_ds = CSVImageDataset(csv_path, "val", label_to_idx, EVAL_TRANSFORM)
    val_loader = DataLoader(val_ds, batch_size=32, shuffle=False, num_workers=0)

    model = build_classifier(num_classes=len(labels))
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE, weights_only=False))
    model.eval()

    all_preds = []
    all_targets = []

    print(f"\nEvaluating model for task: [{task_name.upper()}] on validation set ({len(val_ds)} images)...")
    
    with torch.no_grad():
        for images, targets in val_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            preds = outputs.argmax(dim=1).cpu().tolist()
            
            all_preds.extend(preds)
            all_targets.extend(targets.tolist())

    acc = accuracy_score(all_targets, all_preds)
    print(f"Overall Accuracy for {task_name}: {acc * 100:.2f}%\n")
    
    import numpy as np
    unique_classes = sorted(list(set(all_targets)))
    active_labels = [labels[i] for i in unique_classes]

    print("Classification Report (Precision, Recall, F1-Score):")
    print(classification_report(all_targets, all_preds, labels=unique_classes, target_names=active_labels, zero_division=0))

if __name__ == "__main__":
    evaluate_task("material", "material_dataset.csv", "material_type")
    evaluate_task("waste", "waste_dataset.csv", "waste_status")
    evaluate_task("garment", "garment_dataset.csv", "garment_type")