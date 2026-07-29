"""
Material classification: Cotton, Polyester, Silk, Denim, Wool, Rayon, Linen,
Acrylic, Nylon, Mixed Fabric -- per the project doc.

Loads the XGBoost model trained by scripts/train_material_classifier.py on
your TFD Kaggle download, if it exists. If you haven't trained it yet (or
are demoing before training finishes), this falls back to a deterministic
color+texture rule-based classifier so the pipeline still returns a real,
explainable answer -- never a crash on stage.
"""
import os
import json

import numpy as np
import joblib

from .features import extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "material_model.joblib")
LABELS_PATH = os.path.join(os.path.dirname(__file__), "material_labels.json")

MATERIAL_INFO = {
    "Cotton": dict(fiber="Natural (plant-based) fibre", recyclability="High",
                   reuse="High", method="Mechanical Recycling",
                   note="Cotton is a natural fibre. It can be reused multiple times and has high recycling potential."),
    "Polyester": dict(fiber="Synthetic (petroleum-based) fibre", recyclability="Medium",
                       reuse="Medium", method="Chemical Recycling",
                       note="Polyester is a synthetic fibre. It is durable and can be chemically recycled into new fibre."),
    "Silk": dict(fiber="Natural (protein-based) fibre", recyclability="Medium",
                 reuse="High", method="Fabric Reuse",
                 note="Silk is a delicate natural fibre, best suited for reuse or donation rather than mechanical recycling."),
    "Denim": dict(fiber="Natural (cotton twill weave)", recyclability="High",
                   reuse="High", method="Mechanical Recycling",
                   note="Denim is a sturdy cotton-based fabric with strong potential for mechanical recycling or upcycling."),
    "Wool": dict(fiber="Natural (animal-based) fibre", recyclability="High",
                 reuse="High", method="Mechanical Recycling",
                 note="Wool is a resilient natural fibre well suited to mechanical recycling and reuse."),
    "Rayon": dict(fiber="Semi-synthetic (regenerated cellulose) fibre", recyclability="Medium",
                  reuse="Medium", method="Chemical Recycling",
                  note="Rayon is a regenerated cellulose fibre; it recycles best through chemical processing."),
    "Linen": dict(fiber="Natural (plant-based) fibre", recyclability="High",
                  reuse="High", method="Mechanical Recycling",
                  note="Linen is a durable natural fibre with high recyclability and reuse potential."),
    "Acrylic": dict(fiber="Synthetic fibre", recyclability="Low",
                    reuse="Low", method="Industrial Recovery",
                    note="Acrylic is a synthetic fibre with limited recycling infrastructure; industrial recovery is recommended."),
    "Nylon": dict(fiber="Synthetic (polyamide) fibre", recyclability="Medium",
                  reuse="Medium", method="Chemical Recycling",
                  note="Nylon can be chemically recycled back into raw polyamide material."),
    "Mixed Fabric": dict(fiber="Blended fibre composition", recyclability="Low",
                          reuse="Medium", method="Donation",
                          note="Blended fabrics are harder to separate for recycling; donation or upcycling is usually the best route."),
}

_model = None
_labels = None
_model_loaded = False


def _try_load_model():
    global _model, _labels, _model_loaded
    if _model_loaded:
        return
    _model_loaded = True
    if os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH):
        _model = joblib.load(MODEL_PATH)
        with open(LABELS_PATH) as f:
            _labels = json.load(f)
        print(f"[material_classifier] Loaded trained model with classes: {_labels}")
    else:
        print("[material_classifier] No trained model found yet -- using rule-based fallback. "
              "Run scripts/train_material_classifier.py against your TFD download to enable the trained model.")


def _rule_based_classify(img, color_result: dict, texture_result: dict) -> tuple[str, float]:
    """Deterministic fallback using color + texture heuristics. Always available, zero setup."""
    r, g, b = color_result["dominant_color_rgb"]
    smoothness = texture_result["smoothness_pct"]
    roughness = texture_result["surface_roughness_pct"]
    uniformity = color_result["uniformity_pct"]
    saturation = color_result["saturation_pct"]

    is_blue_dark = b > r and b > 60 and (r + g + b) < 420
    if is_blue_dark and roughness > 35:
        return "Denim", 78.5
    if smoothness > 78 and uniformity > 75 and saturation > 40:
        return "Silk", 74.0
    if smoothness > 70 and uniformity > 80:
        return "Polyester", 71.5
    if roughness > 55 and texture_result["pattern_regularity_pct"] < 40:
        return "Wool", 69.0
    if smoothness > 60 and roughness < 30 and saturation < 30:
        return "Linen", 66.5
    if uniformity > 70 and smoothness > 55:
        return "Cotton", 72.0
    if roughness > 45:
        return "Nylon", 63.0
    if smoothness > 65:
        return "Rayon", 60.5
    if uniformity < 45:
        return "Mixed Fabric", 58.0
    return "Acrylic", 55.0


def classify_material(img, color_result: dict, texture_result: dict) -> dict:
    _try_load_model()

    if _model is not None:
        feats = extract_features(img).reshape(1, -1)
        proba = _model.predict_proba(feats)[0]
        idx = int(np.argmax(proba))
        material = _labels[idx]
        confidence = round(float(proba[idx]) * 100, 1)
        source = "trained_model"
    else:
        material, confidence = _rule_based_classify(img, color_result, texture_result)
        source = "rule_based_fallback"

    info = MATERIAL_INFO.get(material, MATERIAL_INFO["Mixed Fabric"])

    return {
        "material": material,
        "confidence": confidence,
        "classifier_source": source,
        "fiber_composition": info["fiber"],
        "blend_identification": "Single-fibre" if material != "Mixed Fabric" else "Blended composition detected",
        "fabric_category": "Woven" if material in ("Denim", "Cotton", "Linen") else "Knit/Other",
        "material_quality": texture_result["texture_quality"],
        "recyclability": info["recyclability"],
        "reuse_potential": info["reuse"],
        "recommended_recycling_method": info["method"],
        "explanation": f"This appears to be {material} fabric. {info['note']}",
    }
