"""
Textile Image Analysis Engine
------------------------------
This module extracts basic visual information from an uploaded textile
image BEFORE any AI/ML prediction happens. Think of this as step 1:
"look at the image and describe what we see" -- color, brightness,
size, and whether it looks damaged/contaminated.

Later (Task 2), a separate service will use a trained PyTorch model
to actually PREDICT the fabric type. This file does NOT do that --
it just extracts raw visual features.
"""

import cv2
import numpy as np
from PIL import Image


def load_image(image_path: str):
    """
    Opens an image file from disk and returns it as an OpenCV image
    (a NumPy array of pixel values). OpenCV reads images in BGR order
    (Blue-Green-Red), not the usual RGB order, so we convert it.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image at path: {image_path}")

    # Convert from BGR (OpenCV's default) to RGB (the normal order)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image_rgb


def get_basic_info(image_rgb) -> dict:
    """
    Returns basic facts about the image: its width, height,
    and how many color channels it has (should be 3 for RGB).
    """
    height, width, channels = image_rgb.shape
    return {
        "width": int(width),
        "height": int(height),
        "channels": int(channels),
    }


def analyze_color(image_rgb) -> dict:
    """
    Calculates the average color of the whole image.
    This is a simple form of 'color analysis' -- it tells us
    the dominant overall tone (e.g. mostly blue, mostly white, etc.)

    We average every pixel's R, G, and B values separately.
    """
    avg_color_per_channel = image_rgb.mean(
        axis=(0, 1))  # average over height & width
    r, g, b = avg_color_per_channel

    return {
        "average_red": round(float(r), 2),
        "average_green": round(float(g), 2),
        "average_blue": round(float(b), 2),
    }


def analyze_brightness(image_rgb) -> dict:
    """
    Converts the image to grayscale and calculates average brightness.
    Grayscale brightness ranges from 0 (pure black) to 255 (pure white).

    Why this matters: very dark or very bright images might indicate
    poor lighting conditions during photo capture, which could affect
    how reliable later AI predictions are.
    """
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    avg_brightness = float(gray.mean())

    return {
        "average_brightness": round(avg_brightness, 2),
        "brightness_level": (
            "dark" if avg_brightness < 85
            else "bright" if avg_brightness > 170
            else "normal"
        ),
    }


def analyze_texture(image_rgb) -> dict:
    """
    A simple texture analysis using edge detection.
    We convert to grayscale, then use the Canny edge detector to find
    edges (like weave patterns, stitching, or fabric texture lines).

    We then count what percentage of the image consists of edges.
    A fabric with lots of visible texture/pattern will have a higher
    edge percentage than a smooth, plain fabric.
    """
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, threshold1=100, threshold2=200)

    edge_pixel_count = int(np.count_nonzero(edges))
    total_pixel_count = edges.size
    edge_percentage = round((edge_pixel_count / total_pixel_count) * 100, 2)

    return {
        "edge_percentage": edge_percentage,
        "texture_complexity": (
            "high" if edge_percentage > 15
            else "low" if edge_percentage < 5
            else "medium"
        ),
    }


def detect_damage_or_contamination(image_rgb) -> dict:
    """
    A SIMPLE heuristic check for damage/contamination -- not a trained
    AI model, just basic image processing rules. This looks for:

    1. Very dark, irregular patches (could indicate stains/holes)
    2. Unusually high color variation in small regions (could indicate
       stains, dirt, or contamination)

    This is intentionally simple for Milestone 2 -- a more advanced
    version could use a trained defect-detection model later.
    """
    gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)

    # Threshold to find unusually dark spots (potential stains/holes)
    _, dark_spots = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    dark_spot_percentage = round(
        (np.count_nonzero(dark_spots) / dark_spots.size) * 100, 2
    )

    # Check color variation (standard deviation) -- high variation
    # across small patches can indicate stains or contamination
    std_dev = float(image_rgb.std())

    contamination_suspected = dark_spot_percentage > 8 or std_dev > 70

    return {
        "dark_spot_percentage": dark_spot_percentage,
        "color_variation": round(std_dev, 2),
        "contamination_suspected": contamination_suspected,
    }


def analyze_textile_image(image_path: str) -> dict:
    """
    MAIN FUNCTION -- call this one from your API route.

    Runs all the analysis steps above and combines them into a single
    report dictionary. This is what Task 1 ("Implement textile image
    analysis engine") actually delivers.
    """
    image_rgb = load_image(image_path)

    report = {
        "basic_info": get_basic_info(image_rgb),
        "color_analysis": analyze_color(image_rgb),
        "brightness_analysis": analyze_brightness(image_rgb),
        "texture_analysis": analyze_texture(image_rgb),
        "damage_contamination_check": detect_damage_or_contamination(image_rgb),
    }

    return report


# ---------------------------------------------------------------
# Quick manual test -- run this file directly to try it on one image
# Example: python image_analysis_service.py path/to/some_image.jpg
# ---------------------------------------------------------------
if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python image_analysis_service.py <path_to_image>")
    else:
        test_image_path = sys.argv[1]
        result = analyze_textile_image(test_image_path)
        print(json.dumps(result, indent=2))
