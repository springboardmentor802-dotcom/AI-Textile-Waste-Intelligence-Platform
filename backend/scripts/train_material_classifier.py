"""
Train the material classifier on the Ten Fabrics Dataset (TFD) you downloaded
from Kaggle.

USAGE:
    python train_material_classifier.py /path/to/ten-fabrics-dataset

Expects a folder-per-class layout, e.g.:
    ten-fabrics-dataset/
        Cotton/*.jpg
        Denim/*.jpg
        Silk/*.jpg
        ...

If your unzip produces a nested folder (e.g. an extra top-level folder),
point this script at the folder that directly contains the class subfolders.

This trains in well under a minute on CPU because features are hand-crafted
(color histogram + GLCM texture, see features.py), not raw pixels through a
deep net -- the right tradeoff when you're on the clock before a demo.
"""
import os
import sys
import glob
import json

import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
import joblib

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.features import extract_features  # noqa: E402

MODEL_OUT = os.path.join(os.path.dirname(__file__), "..", "app", "material_model.joblib")
LABELS_OUT = os.path.join(os.path.dirname(__file__), "..", "app", "material_labels.json")


def load_dataset(root_dir: str):
    X, y = [], []
    class_dirs = sorted([d for d in glob.glob(os.path.join(root_dir, "*")) if os.path.isdir(d)])
    if not class_dirs:
        raise SystemExit(f"No class subfolders found in {root_dir}. "
                          f"Point this script at the folder that directly contains one folder per fabric type.")

    print(f"Found {len(class_dirs)} classes: {[os.path.basename(d) for d in class_dirs]}")

    for class_dir in class_dirs:
        label = os.path.basename(class_dir)
        image_paths = []
        for ext in ("*.jpg", "*.jpeg", "*.png", "*.bmp"):
            image_paths.extend(glob.glob(os.path.join(class_dir, ext)))
            image_paths.extend(glob.glob(os.path.join(class_dir, "**", ext), recursive=True))
        image_paths = sorted(set(image_paths))
        print(f"  {label}: {len(image_paths)} images")

        for p in image_paths:
            img = cv2.imread(p)
            if img is None:
                continue
            X.append(extract_features(img))
            y.append(label)

    return np.array(X), np.array(y)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    root_dir = sys.argv[1]
    print(f"Loading dataset from: {root_dir}")
    X, y = load_dataset(root_dir)
    print(f"Total samples: {len(X)}")

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    model = XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="multi:softprob",
        eval_metric="mlogloss",
        random_state=42,
    )
    print("Training XGBoost classifier...")
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\nTest accuracy: {acc*100:.2f}%\n")
    print(classification_report(y_test, preds, target_names=le.classes_))

    joblib.dump(model, MODEL_OUT)
    with open(LABELS_OUT, "w") as f:
        json.dump(list(le.classes_), f)

    print(f"\nSaved model to {MODEL_OUT}")
    print(f"Saved label list to {LABELS_OUT}")
    print("\nRestart the backend and the /api/analyze endpoint will use this trained model automatically.")


if __name__ == "__main__":
    main()
