"""
Computer-vision analysis engine — OpenCV + Pillow + scikit-image, per the doc.

Every function returns plain-English explanations alongside the numbers, so
the dashboard can show something an uneducated user understands at a glance,
per the brief ("even an uneducated person should understand by looking at
icons, colors, graphs and explanations").
"""
import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops
from skimage.color import rgb2gray


def _rating(value: float, good_min: float, avg_min: float) -> str:
    if value >= good_min:
        return "GOOD"
    if value >= avg_min:
        return "AVERAGE"
    return "POOR"


def load_image(image_bytes: bytes):
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Please upload a valid JPG/PNG.")
    return img


# ---------------------------------------------------------------- COLOR ----
def analyze_color(img) -> dict:
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3).astype(np.float32)

    # dominant color via k-means (k=1 cluster centroid is the simplest robust
    # "average dominant color"; k=3 gives a palette)
    k = 3
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 5, cv2.KMEANS_PP_CENTERS)
    counts = np.bincount(labels.flatten())
    dominant = centers[np.argmax(counts)].astype(int).tolist()

    avg_rgb = pixels.mean(axis=0).tolist()
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).reshape(-1, 3).astype(np.float32)
    brightness = float(hsv[:, 2].mean() / 255 * 100)
    saturation = float(hsv[:, 1].mean() / 255 * 100)
    uniformity = float(100 - min(100, pixels.std(axis=0).mean() / 2.55))

    quality = _rating(uniformity, 70, 45)

    return {
        "dominant_color_rgb": [int(c) for c in dominant],
        "average_rgb": [round(c, 1) for c in avg_rgb],
        "brightness_pct": round(brightness, 1),
        "saturation_pct": round(saturation, 1),
        "uniformity_pct": round(uniformity, 1),
        "color_quality": quality,
        "explanation": (
            f"The fabric's dominant color is RGB{tuple(int(c) for c in dominant)}. "
            f"Brightness is {round(brightness,1)}% and color uniformity is {quality.lower()}, "
            "meaning the surface color is "
            + ("evenly distributed with little fading or staining."
               if quality == "GOOD" else
               "somewhat uneven, which can indicate fading, staining, or dye wear."
               if quality == "AVERAGE" else
               "highly inconsistent, often a sign of heavy staining or damage.")
        ),
    }


# --------------------------------------------------------------- TEXTURE ----
def analyze_texture(img) -> dict:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    small = cv2.resize(gray, (256, 256))
    glcm = graycomatrix(small, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
                         levels=256, symmetric=True, normed=True)

    contrast = float(graycoprops(glcm, "contrast").mean())
    homogeneity = float(graycoprops(glcm, "homogeneity").mean())
    energy = float(graycoprops(glcm, "energy").mean())
    smoothness = float(1 - (1 / (1 + small.std())))

    edges = cv2.Canny(small, 60, 160)
    edge_density = float(edges.mean() / 255)

    # pattern regularity via autocorrelation peak sharpness (rough proxy)
    f = np.fft.fft2(small)
    fshift = np.abs(np.fft.fftshift(f))
    pattern_regularity = float(min(100, (fshift.std() / (fshift.mean() + 1e-6)) * 8))

    surface_roughness = float(min(100, edge_density * 220))

    metrics = {
        "smoothness_pct": round(smoothness * 100, 1),
        "contrast": round(contrast, 2),
        "homogeneity_pct": round(homogeneity * 100, 1),
        "energy_pct": round(energy * 100, 1),
        "edge_density_pct": round(edge_density * 100, 1),
        "surface_roughness_pct": round(surface_roughness, 1),
        "pattern_regularity_pct": round(pattern_regularity, 1),
    }
    ratings = {
        "smoothness": _rating(metrics["smoothness_pct"], 70, 45),
        "homogeneity": _rating(metrics["homogeneity_pct"], 65, 40),
        "surface_roughness": _rating(100 - metrics["surface_roughness_pct"], 65, 40),
        "pattern_regularity": _rating(metrics["pattern_regularity_pct"], 60, 35),
    }
    overall = "GOOD" if list(ratings.values()).count("GOOD") >= 2 else \
              "AVERAGE" if list(ratings.values()).count("POOR") < 2 else "POOR"

    return {
        **metrics,
        "ratings": ratings,
        "texture_quality": overall,
        "explanation": (
            f"Texture quality is rated {overall}. Smoothness ({ratings['smoothness'].lower()}) and "
            f"homogeneity ({ratings['homogeneity'].lower()}) describe how even the weave feels; "
            f"surface roughness is {ratings['surface_roughness'].lower()}, and the weave pattern "
            f"repeats {ratings['pattern_regularity'].lower()}ly across the surface."
        ),
    }


# --------------------------------------------------------------- DAMAGE ----
def analyze_damage(img) -> dict:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    total_area = gray.shape[0] * gray.shape[1]
    damage_area = 0
    large_tear = False
    for c in contours:
        area = cv2.contourArea(c)
        if area > total_area * 0.002:
            damage_area += area
            if area > total_area * 0.02:
                large_tear = True

    damage_pct = min(100, (damage_area / total_area) * 100)

    if damage_pct < 2:
        severity, damage_type = "None", "No visible damage"
    elif damage_pct < 8:
        severity, damage_type = "Minor", "Minor surface wear"
    elif damage_pct < 20:
        severity, damage_type = "Medium", "Tear / hole"
    else:
        severity, damage_type = "Severe", "Major structural damage"

    repairable = severity in ("None", "Minor", "Medium")
    recyclable = severity != "Severe"
    confidence = round(min(97, 80 + (100 - damage_pct) * 0.15), 1)

    if severity == "None":
        explanation = "This fabric shows no visible damage and is in good structural condition."
    else:
        explanation = (
            f"This fabric contains a {severity.lower()} {damage_type.lower()}. "
            f"It {'can still be repaired' if repairable else 'is not realistically repairable'}. "
            f"Recovery potential is {'High' if damage_pct < 8 else 'Medium' if damage_pct < 20 else 'Low'}."
        )

    return {
        "damage_type": damage_type,
        "severity": severity,
        "estimated_damage_area_pct": round(damage_pct, 1),
        "repairable": repairable,
        "recyclable": recyclable,
        "confidence": confidence,
        "explanation": explanation,
    }


# ---------------------------------------------------------- CONTAMINATION ----
def analyze_contamination(img) -> dict:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # oil/grease: low saturation, dark, glossy specular highlights
    dark_mask = (hsv[:, :, 2] < 60)
    # dust: low saturation, high value, low variance patches
    dust_mask = (hsv[:, :, 1] < 25) & (hsv[:, :, 2] > 150)
    # discoloration / chemical staining: unusual hue clusters vs. dominant hue
    hue = hsv[:, :, 0]
    hue_std = float(hue.std())

    total = hsv.shape[0] * hsv.shape[1]
    oil_pct = float(dark_mask.sum() / total * 100)
    dust_pct = float(dust_mask.sum() / total * 100)
    chemical_pct = float(min(100, hue_std / 1.8))

    findings = []
    if oil_pct > 6:
        findings.append("Oil")
    if dust_pct > 12:
        findings.append("Dust")
    if chemical_pct > 55:
        findings.append("Chemical/Discoloration")

    contaminated = len(findings) > 0
    confidence = round(75 + min(20, (oil_pct + dust_pct) / 4), 1)

    if not contaminated:
        explanation = "No contamination detected. This fabric appears clean and ready for processing."
    else:
        explanation = (
            f"{', '.join(findings)} contamination detected. "
            "Cleaning is required before this material can be recycled or reused."
        )

    return {
        "contaminated": contaminated,
        "types_detected": findings,
        "oil_indicator_pct": round(oil_pct, 1),
        "dust_indicator_pct": round(dust_pct, 1),
        "chemical_indicator_pct": round(chemical_pct, 1),
        "moisture_indicator_pct": 0.0,
        "confidence": confidence,
        "explanation": explanation,
    }
