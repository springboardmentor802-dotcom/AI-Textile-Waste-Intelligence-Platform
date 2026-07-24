import json
import numpy as np
import tensorflow as tf

from pathlib import Path
from PIL import Image


BASE_DIR = Path(__file__).resolve().parents[3]

MODEL_PATH = BASE_DIR / "models" / "fabric_classifier.keras"
CONFIG_PATH = BASE_DIR / "models" / "preprocessing_config.json"


model = tf.keras.models.load_model(MODEL_PATH)


with open(CONFIG_PATH, "r") as file:
    config = json.load(file)


def preprocess_image(image_path):

    image_size = tuple(config["image_size"])

    image = Image.open(image_path).convert("RGB")

    image = image.resize(image_size)

    image = np.array(image)

    image = image.astype("float32") / 255.0

    image = np.expand_dims(image, axis=0)

    return image


def predict_image(image_path):

    image = preprocess_image(image_path)

    prediction = model.predict(image, verbose=0)

    index = np.argmax(prediction)

    confidence = float(np.max(prediction))

    reverse_mapping = {
        value:key
        for key,value in config["class_mapping"].items()
    }
    print("MODEL INDEX:", index)
    print("CLASS MAPPING:", reverse_mapping)


    return {
        "predicted_class": reverse_mapping[index],
        "confidence": round(confidence*100,2)
}