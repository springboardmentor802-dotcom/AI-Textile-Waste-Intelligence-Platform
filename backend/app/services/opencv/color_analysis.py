"""
Color Analysis Module
Algorithm: OpenCV + KMeans Clustering
Extracts dominant colors from textile images.
"""

import cv2
import numpy as np
from sklearn.cluster import KMeans
import logging

logger = logging.getLogger(__name__)

N_COLORS = 5


def analyze_color(image: np.ndarray) -> dict:
    """
    Extract dominant colors from a textile image using KMeans clustering.

    Args:
        image: BGR numpy array from OpenCV (H, W, 3)

    Returns:
        dict with dominant_colors (list of RGB triplets) and
        hex_colors (list of hex strings)
    """
    try:
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Resize for faster clustering (max 200x200)
        h, w = image_rgb.shape[:2]
        scale = min(200 / h, 200 / w, 1.0)
        if scale < 1.0:
            new_h, new_w = int(h * scale), int(w * scale)
            image_rgb = cv2.resize(image_rgb, (new_w, new_h))

        # Flatten pixels: (H*W, 3)
        pixels = image_rgb.reshape(-1, 3).astype(np.float32)

        # Apply KMeans clustering
        n_colors = min(N_COLORS, len(pixels))
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)

        # Extract cluster centers as dominant colors
        centers = kmeans.cluster_centers_.astype(int).tolist()

        # Calculate percentage of each color in the image
        labels = kmeans.labels_
        label_counts = np.bincount(labels)
        percentages = (label_counts / len(labels) * 100).tolist()

        # Sort by percentage descending
        sorted_pairs = sorted(
            zip(centers, percentages), key=lambda x: x[1], reverse=True
        )
        sorted_colors = [pair[0] for pair in sorted_pairs]
        sorted_percentages = [round(pair[1], 2) for pair in sorted_pairs]

        # Convert to hex
        hex_colors = [
            "#{:02x}{:02x}{:02x}".format(r, g, b)
            for r, g, b in sorted_colors
        ]

        # Determine overall color category
        primary_rgb = sorted_colors[0]
        color_category = _classify_color_category(primary_rgb)

        return {
            "dominant_colors": sorted_colors,
            "hex_colors": hex_colors,
            "color_percentages": sorted_percentages,
            "primary_color_hex": hex_colors[0] if hex_colors else "#000000",
            "color_category": color_category,
            "colors_analyzed": n_colors,
        }

    except Exception as e:
        logger.error(f"Color analysis failed: {e}")
        return {
            "dominant_colors": [],
            "hex_colors": [],
            "color_percentages": [],
            "primary_color_hex": "#000000",
            "color_category": "Unknown",
            "colors_analyzed": 0,
            "error": str(e),
        }


def _classify_color_category(rgb: list) -> str:
    """
    Classify an RGB color into a broad color category name.
    """
    r, g, b = rgb
    max_val = max(r, g, b)
    min_val = min(r, g, b)
    brightness = (max_val + min_val) / 2

    if brightness > 200:
        return "Light / White"
    if brightness < 50:
        return "Dark / Black"

    # Determine dominant channel
    if r > g and r > b:
        return "Red / Warm"
    if g > r and g > b:
        return "Green"
    if b > r and b > g:
        return "Blue / Cool"
    if r > 150 and g > 100 and b < 80:
        return "Brown / Earthy"
    if abs(r - g) < 20 and abs(g - b) < 20:
        return "Gray / Neutral"
    return "Mixed"