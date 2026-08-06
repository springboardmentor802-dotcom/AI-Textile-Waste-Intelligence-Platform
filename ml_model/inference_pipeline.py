import os
import json
import time
import cv2
import numpy as np
import tensorflow as tf

class TextileInferencePipeline:
    """
    Production-ready inference pipeline for textile waste material classification
    and circular economics metrics calculation.
    """
    def __init__(self, model_path="models/textile_model.keras", config_path="models/prediction_config.json", labels_path="models/class_labels.json"):
        self.model_path = model_path
        self.config_path = config_path
        self.labels_path = labels_path
        self.model = None
        self.config = None
        self.classes = [
            "Cotton", "Polyester", "Wool", "Silk", "Linen",
            "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"
        ]
        self._load_resources()

    def _load_resources(self):
        """Loads Keras model and configuration JSON files."""
        if os.path.exists(self.labels_path):
            with open(self.labels_path, 'r') as f:
                data = json.load(f)
                self.classes = data.get("classes", self.classes)

        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {"input_shape": [224, 224, 3], "top_k": 5}

        if not os.path.exists(self.model_path):
            # Fallback path check
            alt_path = os.path.join(os.path.dirname(__file__), "textile_model.keras")
            if os.path.exists(alt_path):
                self.model_path = alt_path
            else:
                raise FileNotFoundError(f"Model file missing at {self.model_path}")

        print(f"[InferencePipeline] Loading TensorFlow Keras model from {self.model_path}...")
        self.model = tf.keras.models.load_model(self.model_path)
        print("[InferencePipeline] Model successfully initialized.")

    def preprocess_image_bytes(self, image_bytes):
        """Decodes image byte stream, resizes to target shape, and normalizes pixels."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Failed to decode image bytes. Supported formats are PNG, JPG, JPEG.")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        target_w, target_h = self.config.get("input_shape", [224, 224])[0:2]
        img_resized = cv2.resize(img_rgb, (target_w, target_h), interpolation=cv2.INTER_AREA)
        
        # Min-Max Normalization to [0.0, 1.0]
        normalized_tensor = img_resized.astype(np.float32) / 255.0
        
        # Image quality analytics (brightness & contrast stddev)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        avg_brightness = float(np.mean(gray))
        contrast_std = float(np.std(gray))

        return normalized_tensor, img_resized, {
            "original_shape": list(img_bgr.shape),
            "resized_shape": [target_w, target_h, 3],
            "average_brightness": avg_brightness,
            "contrast_std": contrast_std
        }

    def compute_circular_metrics(self, material, brightness, contrast):
        """Derives recyclability score, waste category stream, and processing recommendations."""
        base_scores = {
            "Linen": 90, "Cotton": 85, "Denim": 80, "Polyester": 75,
            "Wool": 70, "Silk": 65, "Nylon": 60, "Rayon": 50,
            "Acrylic": 45, "Mixed Fabrics": 20
        }
        score = base_scores.get(material, 50)

        if brightness < 80:
            score -= 10
            condition = "Soiled / High Wear"
        elif contrast > 60:
            score += 5
            condition = "Excellent / Virgin Quality"
        else:
            condition = "Good / Moderate Use"

        score = max(5, min(98, score))

        if score >= 80:
            grade, grade_text = "Green", "Highly Recyclable"
        elif score >= 60:
            grade, grade_text = "Yellow", "Moderate Recyclability"
        elif score >= 30:
            grade, grade_text = "Orange", "Limited Recyclability"
        else:
            grade, grade_text = "Red", "Disposal Recommended"

        waste_map = {
            "Linen": ("Compostable", 88.0), "Cotton": ("Recyclable", 92.5),
            "Denim": ("Upcyclable", 85.0), "Polyester": ("Recyclable", 90.0),
            "Wool": ("Reusable", 82.0), "Silk": ("Reusable", 78.5),
            "Nylon": ("Recyclable", 84.0), "Rayon": ("Recyclable", 70.0),
            "Acrylic": ("Recyclable", 65.0), "Mixed Fabrics": ("Upcyclable", 60.0)
        }
        waste_cat, waste_conf = waste_map.get(material, ("Recyclable", 75.0))

        recs = [
            f"Route this batch to a specialized {waste_cat.lower()} facility for {material}.",
            "Trim buttons, zippers, and foreign elastane threads prior to mechanical processing."
        ]

        return {
            "wasteCategory": waste_cat,
            "wasteConfidence": float(round(waste_conf, 1)),
            "recyclabilityScore": int(score),
            "recyclabilityGrade": grade,
            "recyclabilityGradeText": grade_text,
            "condition": condition,
            "recommendations": recs
        }

    def predict(self, image_bytes):
        """Runs end-to-end inference on raw image bytes."""
        t0 = time.time()
        tensor, img_resized, metadata = self.preprocess_image_bytes(image_bytes)
        
        # Add batch dimension: (1, H, W, C)
        input_batch = np.expand_dims(tensor, axis=0)

        probs = self.model.predict(input_batch, verbose=0)[0]
        top_idx = int(np.argmax(probs))
        predicted_material = self.classes[top_idx]
        material_confidence = float(round(probs[top_idx] * 100, 1))

        # Build Top-5 Predictions Breakdown
        top_5_indices = np.argsort(probs)[::-1][:5]
        top_predictions = [
            {
                "material": self.classes[i],
                "confidence": float(round(probs[i] * 100, 1))
            }
            for i in top_5_indices
        ]

        t1 = time.time()
        inference_time_ms = float(round((t1 - t0) * 1000, 2))

        circular_metrics = self.compute_circular_metrics(
            predicted_material,
            metadata["average_brightness"],
            metadata["contrast_std"]
        )

        return {
            "predictedMaterial": predicted_material,
            "materialConfidence": material_confidence,
            "topPredictions": top_predictions,
            "inferenceTimeMs": inference_time_ms,
            "wasteCategory": circular_metrics["wasteCategory"],
            "wasteConfidence": circular_metrics["wasteConfidence"],
            "recyclabilityScore": circular_metrics["recyclabilityScore"],
            "recyclabilityGrade": circular_metrics["recyclabilityGrade"],
            "recyclabilityGradeText": circular_metrics["recyclabilityGradeText"],
            "condition": circular_metrics["condition"],
            "recommendations": circular_metrics["recommendations"],
            "preprocessingMetadata": metadata
        }

if __name__ == "__main__":
    print("Testing TextileInferencePipeline...")
    pipeline = TextileInferencePipeline()
    # Test with dummy image bytes
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', dummy_img)
    res = pipeline.predict(buffer.tobytes())
    print("Prediction Result:", json.dumps(res, indent=2))
