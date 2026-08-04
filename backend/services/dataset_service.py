from pathlib import Path

import pandas as pd


DATASET_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "synthetic_textile_sustainability_dataset.csv"
)


def load_dataset():
    """
    Load the synthetic sustainability dataset.
    """

    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    return pd.read_csv(DATASET_PATH)