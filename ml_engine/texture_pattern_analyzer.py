import cv2
import numpy as np

TEXTURE_THRESHOLDS = {
    "smooth_max": 80.0,      
    "textured_max": 400.0,   
}

SOLID_EDGE_ENERGY_MAX = 8.0
DOMINANT_ORIENTATION_RATIO = 0.35
N_ORIENTATION_BINS = 18  

def _to_gray(image_bytes: bytes) -> np.ndarray:
    image_np = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.resize(gray, (256, 256), interpolation=cv2.INTER_AREA)

def _classify_texture(gray: np.ndarray) -> dict:
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    if laplacian_var < TEXTURE_THRESHOLDS["smooth_max"]:
        label = "Smooth"
    elif laplacian_var < TEXTURE_THRESHOLDS["textured_max"]:
        label = "Textured"
    else:
        label = "Rough/Coarse"

    return {"label": label, "laplacian_variance": round(laplacian_var, 2)}

def _classify_pattern(gray: np.ndarray) -> dict:
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = np.sqrt(sobel_x ** 2 + sobel_y ** 2)
    orientation = (np.degrees(np.arctan2(sobel_y, sobel_x)) + 180) % 180  # 0-180
    mean_edge_energy = float(magnitude.mean())
    strong_mask = magnitude > (magnitude.mean() + magnitude.std() * 0.5)
    strong_orientations = orientation[strong_mask]
    strong_weights = magnitude[strong_mask]

    if strong_orientations.size == 0 or mean_edge_energy < SOLID_EDGE_ENERGY_MAX:
        return {
            "label": "Solid",
            "mean_edge_energy": round(mean_edge_energy, 2),
            "dominant_orientation_ratio": 0.0,
        }

    hist, _ = np.histogram(
        strong_orientations, bins=N_ORIENTATION_BINS, range=(0, 180), weights=strong_weights
    )
    total = hist.sum()
    dominant_ratio = float(hist.max() / total) if total > 0 else 0.0
    top_two = np.sort(hist)[-2:]
    two_band_ratio = float(top_two.sum() / total) if total > 0 else 0.0

    if dominant_ratio >= DOMINANT_ORIENTATION_RATIO:
        if two_band_ratio - dominant_ratio > 0.15:
            label = "Plaid/Check"
        else:
            label = "Striped"
    else:
        label = "Patterned"

    return {
        "label": label,
        "mean_edge_energy": round(mean_edge_energy, 2),
        "dominant_orientation_ratio": round(dominant_ratio, 3),
    }

def analyze_texture_and_pattern(image_bytes: bytes) -> dict:
    gray = _to_gray(image_bytes)
    return {
        "texture": _classify_texture(gray),
        "pattern": _classify_pattern(gray),
    }

if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) != 2:
        print("Usage: python texture_pattern_analyzer.py <image_path>")
    else:
        with open(sys.argv[1], "rb") as f:
            print(json.dumps(analyze_texture_and_pattern(f.read()), indent=2))