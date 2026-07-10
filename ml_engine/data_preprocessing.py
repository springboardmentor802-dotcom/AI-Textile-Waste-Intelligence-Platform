import os
import json
import csv
import random
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
TAXONOMY_PATH = BASE_DIR / "taxonomy.json"

RANDOM_SEED = 42
VAL_SPLIT = 0.15


def load_taxonomy() -> dict:
    with open(TAXONOMY_PATH, "r") as f:
        return json.load(f)


def _closest_label(raw_label: str, valid_labels: list[str]) -> str:
    
    raw = raw_label.strip().lower()
    for label in valid_labels:
        if label.lower() in raw or raw in label.lower():
            return label
    for fallback in ("Mixed/Unknown", "Other", "Pending"):
        if fallback in valid_labels:
            return fallback
    return valid_labels[-1]

def _write_csv(rows: list[dict], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df = pd.DataFrame(rows)
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows -> {out_path}")

def _assign_splits(rows: list[dict]) -> list[dict]:
    """Adds a 'split' column (train/val) if the source didn't already provide one."""
    if rows and "split" in rows[0] and rows[0]["split"]:
        return rows
    train_rows, val_rows = train_test_split(
        rows, test_size=VAL_SPLIT, random_state=RANDOM_SEED
    )
    for r in train_rows:
        r["split"] = "train"
    for r in val_rows:
        r["split"] = "val"
    return train_rows + val_rows

def prepare_imagefolder_dataset(dataset_name: str, valid_labels: list[str]) -> list[dict]:
    
    root = DATASETS_DIR / dataset_name
    rows = []
    if not root.exists():
        print(f"[skip] {root} not found -- download/extract the dataset first.")
        return rows

    for class_dir in root.iterdir():
        if not class_dir.is_dir():
            continue
        mapped_label = _closest_label(class_dir.name, valid_labels)
        for img_path in class_dir.glob("*.*"):
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp"):
                continue
            rows.append({"image_path": str(img_path), "label": mapped_label, "split": None})
    return rows

def prepare_tips(valid_labels: list[str]) -> list[dict]:
    return prepare_imagefolder_dataset("tips", valid_labels)

def prepare_fabric_kaggle(valid_labels: list[str]) -> list[dict]:
    return prepare_imagefolder_dataset("fabric_kaggle", valid_labels)

def prepare_deepfashion(valid_labels: list[str]) -> list[dict]:
    
    root = DATASETS_DIR / "deepfashion"
    cat_cloth_path = root / "Anno" / "list_category_cloth.txt"
    cat_img_path = root / "Anno" / "list_category_img.txt"
    partition_path = root / "Eval" / "list_eval_partition.txt"

    if not (cat_cloth_path.exists() and cat_img_path.exists()):
        print(f"[skip] DeepFashion annotation files not found under {root}")
        return []
    
    id_to_name = {}
    with open(cat_cloth_path, "r") as f:
        lines = f.readlines()[2:]  # first 2 lines are header/count
        for idx, line in enumerate(lines, start=1):
            name = line.split()[0]
            id_to_name[idx] = name

    split_map = {}
    if partition_path.exists():
        with open(partition_path, "r") as f:
            for line in f.readlines()[2:]:
                parts = line.split()
                img_name, split_name = parts[0], parts[1]
                split_map[img_name] = "val" if split_name != "train" else "train"

    rows = []
    with open(cat_img_path, "r") as f:
        for line in f.readlines()[2:]:
            img_name, cat_id = line.split()
            raw_label = id_to_name.get(int(cat_id), "Other")
            mapped_label = _closest_label(raw_label, valid_labels)
            rows.append({
                "image_path": str(root / img_name),
                "label": mapped_label,
                "split": split_map.get(img_name),
            })
    return rows

FASHION_MNIST_CLASSES = [
    "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
    "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot",
]

def prepare_fashion_mnist(valid_labels: list[str]) -> list[dict]:
    
    try:
        from torchvision.datasets import FashionMNIST
    except ImportError:
        print("[skip] torchvision not installed -- pip install torchvision")
        return []

    out_root = DATASETS_DIR / "fashion_mnist" / "images"
    out_root.mkdir(parents=True, exist_ok=True)

    rows = []
    for split_name, is_train in (("train", True), ("val", False)):
        ds = FashionMNIST(root=str(DATASETS_DIR / "fashion_mnist"), train=is_train, download=True)
        for i, (img, label_idx) in enumerate(ds):
            raw_label = FASHION_MNIST_CLASSES[label_idx]
            mapped_label = _closest_label(raw_label, valid_labels)
            img_path = out_root / f"{split_name}_{i}.jpg"
            if not img_path.exists():
                img.convert("RGB").save(img_path)
            rows.append({"image_path": str(img_path), "label": mapped_label, "split": split_name})
    return rows

def prepare_sustainable_fashion(valid_labels: list[str]) -> list[dict]:
    """
    Assumes the same ImageFolder-style layout as the fabric datasets, with
    class folder names describing condition/recyclability
    (e.g. "recyclable", "reusable", "damaged"). Adjust _closest_label
    fallback behaviour if the real folder names don't fuzzy-match well.
    """
    return prepare_imagefolder_dataset("sustainable_fashion", valid_labels)

def main():
    random.seed(RANDOM_SEED)
    taxonomy = load_taxonomy()

    garment_rows = []
    garment_rows += prepare_deepfashion(taxonomy["garment_type"])
    garment_rows += prepare_fashion_mnist(taxonomy["garment_type"])
    if garment_rows:
        _write_csv(_assign_splits(garment_rows), DATASETS_DIR / "garment_dataset.csv")

    material_rows = []
    material_rows += prepare_tips(taxonomy["material_type"])
    material_rows += prepare_fabric_kaggle(taxonomy["material_type"])
    if material_rows:
        _write_csv(_assign_splits(material_rows), DATASETS_DIR / "material_dataset.csv")

    waste_rows = prepare_sustainable_fashion(taxonomy["waste_status"])
    if waste_rows:
        _write_csv(_assign_splits(waste_rows), DATASETS_DIR / "waste_dataset.csv")

    if not (garment_rows or material_rows or waste_rows):
        print(
            "No datasets found under ml_engine/datasets/. "
            "Download and extract each dataset there first -- see the "
            "folder names referenced in each prepare_* function above."
        )


if __name__ == "__main__":
    main()