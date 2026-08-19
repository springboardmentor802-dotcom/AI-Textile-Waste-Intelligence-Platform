from pathlib import Path
from time import perf_counter
import csv
import json
import math
import random

import numpy as np
import tensorflow as tf
from PIL import Image

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)


# ==========================================================
# CONFIGURATION
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

DATASET_DIR = (
    PROJECT_ROOT
    / "datasets"
    / "TFD"
    / "TFD Textile Dataset"
)

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "fabric_classifier.keras"
)

CONFIG_PATH = (
    PROJECT_ROOT
    / "models"
    / "preprocessing_config.json"
)

OUTPUT_DIR = (
    Path(__file__).resolve().parent
    / "validation"
    / "model_evaluation"
)

TEST_FRACTION = 0.15

RANDOM_SEED = 42

ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}


# ==========================================================
# PREPARE OUTPUT FOLDER
# ==========================================================

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================================
# LOAD CONFIGURATION
# ==========================================================

with CONFIG_PATH.open(
    "r",
    encoding="utf-8",
) as file:
    config = json.load(file)


IMAGE_SIZE = tuple(
    config["image_size"]
)


CLASS_MAPPING = {
    str(class_id).zfill(3): int(index)
    for class_id, index
    in config["class_mapping"].items()
}


INDEX_TO_CLASS = {
    index: class_id
    for class_id, index
    in CLASS_MAPPING.items()
}


CLASS_IDS = sorted(
    CLASS_MAPPING.keys()
)


# ==========================================================
# LOAD MODEL
# ==========================================================

print()
print("=" * 90)
print("AI TEXTILE WASTE INTELLIGENCE PLATFORM")
print("M4 CNN MODEL EVALUATION")
print("=" * 90)

print()
print("Loading model:")
print(MODEL_PATH)

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False,
)

print("[OK] Model loaded successfully.")


# ==========================================================
# IMAGE PREPROCESSING
# ==========================================================

def preprocess_image(
    image_path: Path,
) -> np.ndarray:

    with Image.open(
        image_path
    ) as image:

        image = image.convert(
            "RGB"
        )

        image = image.resize(
            IMAGE_SIZE,
            Image.Resampling.LANCZOS,
        )

        image_array = np.asarray(
            image,
            dtype=np.float32,
        )

    image_array = (
        image_array / 255.0
    )

    return image_array


# ==========================================================
# COLLECT CLASS IMAGES
# ==========================================================

print()
print("DATASET")
print("-" * 90)

class_images = {}

total_images = 0

for class_id in CLASS_IDS:

    class_dir = (
        DATASET_DIR
        / class_id
    )

    images = sorted(
        [
            file_path
            for file_path
            in class_dir.iterdir()
            if (
                file_path.is_file()
                and
                file_path.suffix.lower()
                in ALLOWED_EXTENSIONS
            )
        ]
    )

    class_images[class_id] = images

    total_images += len(
        images
    )

    print(
        f"Class {class_id}: "
        f"{len(images)} images"
    )


print(
    f"\nTotal images: "
    f"{total_images}"
)


# ==========================================================
# RECONSTRUCTED STRATIFIED EVALUATION SPLIT
# ==========================================================

print()
print("RECONSTRUCTED EVALUATION SPLIT")
print("-" * 90)

print(
    "WARNING:"
)

print(
    "Original training/test membership "
    "was not available."
)

print(
    "This evaluation uses a deterministic "
    "15% stratified sample per class."
)

print(
    "Therefore, this is a retrospective "
    "evaluation on the available labeled dataset,"
)

print(
    "not a guaranteed original held-out "
    "generalization test."
)

rng = random.Random(
    RANDOM_SEED
)

evaluation_samples = []

for class_id in CLASS_IDS:

    images = list(
        class_images[class_id]
    )

    rng.shuffle(
        images
    )

    test_count = max(
        1,
        round(
            len(images)
            *
            TEST_FRACTION
        ),
    )

    selected = images[
        :test_count
    ]

    for image_path in selected:

        evaluation_samples.append(
            (
                image_path,
                class_id,
            )
        )

    print(
        f"Class {class_id}: "
        f"{test_count} evaluation images"
    )


print(
    f"\nEvaluation samples: "
    f"{len(evaluation_samples)}"
)


# ==========================================================
# PREPARE BATCH DATA
# ==========================================================

print()
print("PREPROCESSING")
print("-" * 90)

x_eval = []

y_true = []

paths = []

skipped = []

for (
    image_path,
    class_id,
) in evaluation_samples:

    try:

        image_array = (
            preprocess_image(
                image_path
            )
        )

        x_eval.append(
            image_array
        )

        y_true.append(
            CLASS_MAPPING[
                class_id
            ]
        )

        paths.append(
            image_path
        )

    except Exception as error:

        skipped.append(
            (
                image_path,
                str(error),
            )
        )


x_eval = np.asarray(
    x_eval,
    dtype=np.float32,
)

y_true = np.asarray(
    y_true,
    dtype=np.int32,
)


print(
    f"Successfully prepared: "
    f"{len(x_eval)} images"
)

print(
    f"Skipped images: "
    f"{len(skipped)}"
)


if len(x_eval) == 0:

    raise RuntimeError(
        "No evaluation images "
        "could be processed."
    )


# ==========================================================
# CNN INFERENCE
# ==========================================================

print()
print("MODEL INFERENCE")
print("-" * 90)

start_time = (
    perf_counter()
)

predictions = model.predict(
    x_eval,
    batch_size=32,
    verbose=1,
)

elapsed = (
    perf_counter()
    -
    start_time
)


y_pred = np.argmax(
    predictions,
    axis=1,
)


confidence = np.max(
    predictions,
    axis=1,
)


average_inference_ms = (
    elapsed
    /
    len(x_eval)
    *
    1000
)


print(
    f"\nTotal inference time: "
    f"{elapsed:.2f} seconds"
)

print(
    f"Average model inference time: "
    f"{average_inference_ms:.2f} ms/image"
)


# ==========================================================
# OVERALL METRICS
# ==========================================================

print()
print("OVERALL MODEL METRICS")
print("-" * 90)

accuracy = accuracy_score(
    y_true,
    y_pred,
)


(
    macro_precision,
    macro_recall,
    macro_f1,
    _,
) = precision_recall_fscore_support(
    y_true,
    y_pred,
    average="macro",
    zero_division=0,
)


(
    weighted_precision,
    weighted_recall,
    weighted_f1,
    _,
) = precision_recall_fscore_support(
    y_true,
    y_pred,
    average="weighted",
    zero_division=0,
)


average_confidence = float(
    np.mean(
        confidence
    )
)


correct_mask = (
    y_true
    ==
    y_pred
)


correct_count = int(
    np.sum(
        correct_mask
    )
)


incorrect_count = (
    len(y_true)
    -
    correct_count
)


print(
    f"Accuracy           : "
    f"{accuracy * 100:.2f}%"
)

print(
    f"Macro Precision    : "
    f"{macro_precision * 100:.2f}%"
)

print(
    f"Macro Recall       : "
    f"{macro_recall * 100:.2f}%"
)

print(
    f"Macro F1-score     : "
    f"{macro_f1 * 100:.2f}%"
)

print(
    f"Weighted Precision : "
    f"{weighted_precision * 100:.2f}%"
)

print(
    f"Weighted Recall    : "
    f"{weighted_recall * 100:.2f}%"
)

print(
    f"Weighted F1-score  : "
    f"{weighted_f1 * 100:.2f}%"
)

print(
    f"Average Confidence : "
    f"{average_confidence * 100:.2f}%"
)

print(
    f"Correct            : "
    f"{correct_count}"
)

print(
    f"Incorrect          : "
    f"{incorrect_count}"
)


# ==========================================================
# CLASSIFICATION REPORT
# ==========================================================

print()
print("PER-CLASS RESULTS")
print("-" * 90)

target_names = [
    INDEX_TO_CLASS[
        index
    ]
    for index
    in range(
        len(CLASS_IDS)
    )
]


report_text = (
    classification_report(
        y_true,
        y_pred,
        labels=list(
            range(
                len(CLASS_IDS)
            )
        ),
        target_names=target_names,
        digits=4,
        zero_division=0,
    )
)


print(
    report_text
)


report_dict = (
    classification_report(
        y_true,
        y_pred,
        labels=list(
            range(
                len(CLASS_IDS)
            )
        ),
        target_names=target_names,
        output_dict=True,
        zero_division=0,
    )
)


# ==========================================================
# CONFUSION MATRIX
# ==========================================================

matrix = confusion_matrix(
    y_true,
    y_pred,
    labels=list(
        range(
            len(CLASS_IDS)
        )
    ),
)


print()
print("CONFUSION MATRIX")
print("-" * 90)

print(
    "Rows = actual class"
)

print(
    "Columns = predicted class"
)

print()

header = (
    "ACT\\PRED "
    +
    " ".join(
        f"{class_id:>5}"
        for class_id
        in CLASS_IDS
    )
)

print(
    header
)

for row_index, row in enumerate(
    matrix
):

    print(
        f"{CLASS_IDS[row_index]:>8} "
        +
        " ".join(
            f"{value:>5}"
            for value
            in row
        )
    )


# ==========================================================
# SAVE SUMMARY JSON
# ==========================================================

summary = {
    "evaluation_type":
        "reconstructed_deterministic_stratified_sample",

    "warning":
        (
            "Original training/test membership "
            "was unavailable. Evaluation samples "
            "may overlap with original training data."
        ),

    "dataset":
        "Ten Fabrics Dataset (TFD)",

    "total_dataset_images":
        total_images,

    "evaluation_fraction":
        TEST_FRACTION,

    "random_seed":
        RANDOM_SEED,

    "evaluation_samples":
        int(
            len(y_true)
        ),

    "skipped_images":
        len(
            skipped
        ),

    "accuracy":
        float(
            accuracy
        ),

    "macro_precision":
        float(
            macro_precision
        ),

    "macro_recall":
        float(
            macro_recall
        ),

    "macro_f1":
        float(
            macro_f1
        ),

    "weighted_precision":
        float(
            weighted_precision
        ),

    "weighted_recall":
        float(
            weighted_recall
        ),

    "weighted_f1":
        float(
            weighted_f1
        ),

    "average_confidence":
        average_confidence,

    "correct_predictions":
        correct_count,

    "incorrect_predictions":
        incorrect_count,

    "total_inference_seconds":
        float(
            elapsed
        ),

    "average_inference_ms_per_image":
        float(
            average_inference_ms
        ),

    "class_counts":
        {
            class_id:
                len(
                    class_images[
                        class_id
                    ]
                )

            for class_id
            in CLASS_IDS
        },

    "classification_report":
        report_dict,

    "confusion_matrix":
        matrix.tolist(),
}


summary_path = (
    OUTPUT_DIR
    / "model_evaluation_summary.json"
)


with summary_path.open(
    "w",
    encoding="utf-8",
) as file:

    json.dump(
        summary,
        file,
        indent=4,
    )


# ==========================================================
# SAVE CONFUSION MATRIX CSV
# ==========================================================

matrix_path = (
    OUTPUT_DIR
    / "confusion_matrix.csv"
)


with matrix_path.open(
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.writer(
        file
    )

    writer.writerow(
        [
            "actual\\predicted",
            *CLASS_IDS,
        ]
    )

    for index, row in enumerate(
        matrix
    ):

        writer.writerow(
            [
                CLASS_IDS[
                    index
                ],
                *row.tolist(),
            ]
        )


# ==========================================================
# SAVE PER-IMAGE PREDICTIONS
# ==========================================================

prediction_path = (
    OUTPUT_DIR
    / "prediction_results.csv"
)


with prediction_path.open(
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.writer(
        file
    )

    writer.writerow(
        [
            "image",
            "actual_class",
            "predicted_class",
            "confidence",
            "correct",
        ]
    )

    for (
        image_path,
        actual_index,
        predicted_index,
        prediction_confidence,
    ) in zip(
        paths,
        y_true,
        y_pred,
        confidence,
    ):

        writer.writerow(
            [
                str(
                    image_path
                ),

                INDEX_TO_CLASS[
                    int(
                        actual_index
                    )
                ],

                INDEX_TO_CLASS[
                    int(
                        predicted_index
                    )
                ],

                round(
                    float(
                        prediction_confidence
                    )
                    *
                    100,
                    4,
                ),

                bool(
                    actual_index
                    ==
                    predicted_index
                ),
            ]
        )


# ==========================================================
# SAVE CLASSIFICATION REPORT
# ==========================================================

report_path = (
    OUTPUT_DIR
    / "classification_report.txt"
)


with report_path.open(
    "w",
    encoding="utf-8",
) as file:

    file.write(
        report_text
    )


# ==========================================================
# SAVE EVALUATION SAMPLE LIST
# ==========================================================

sample_path = (
    OUTPUT_DIR
    / "evaluation_sample_manifest.csv"
)


with sample_path.open(
    "w",
    newline="",
    encoding="utf-8",
) as file:

    writer = csv.writer(
        file
    )

    writer.writerow(
        [
            "image",
            "actual_class",
        ]
    )

    for (
        image_path,
        actual_index,
    ) in zip(
        paths,
        y_true,
    ):

        writer.writerow(
            [
                str(
                    image_path
                ),

                INDEX_TO_CLASS[
                    int(
                        actual_index
                    )
                ],
            ]
        )


# ==========================================================
# FINAL RESULT
# ==========================================================

print()
print("=" * 90)
print("M4 CNN MODEL EVALUATION COMPLETE")
print("=" * 90)

print(
    f"Dataset images      : "
    f"{total_images}"
)

print(
    f"Evaluation images   : "
    f"{len(y_true)}"
)

print(
    f"Accuracy            : "
    f"{accuracy * 100:.2f}%"
)

print(
    f"Macro F1-score      : "
    f"{macro_f1 * 100:.2f}%"
)

print(
    f"Weighted F1-score   : "
    f"{weighted_f1 * 100:.2f}%"
)

print(
    f"Average confidence  : "
    f"{average_confidence * 100:.2f}%"
)

print(
    f"Avg inference/image : "
    f"{average_inference_ms:.2f} ms"
)

print()
print(
    "Reports saved to:"
)

print(
    OUTPUT_DIR
)

print()
print(
    "IMPORTANT:"
)

print(
    "These metrics are from a reconstructed "
    "evaluation subset."
)

print(
    "They must NOT be described as results "
    "from the original unseen model test set "
    "unless the original split can later be recovered."
)

print("=" * 90)