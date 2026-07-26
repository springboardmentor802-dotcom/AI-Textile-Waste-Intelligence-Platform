"""
Pattern Analysis Module
Algorithms: Canny Edge Detection + Probabilistic Hough Line Transform
Determines surface pattern type of textile fabrics.
"""

import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


def analyze_pattern(image: np.ndarray) -> dict:
    """
    Analyze surface pattern using edge detection and line orientation analysis.

    Args:
        image: BGR numpy array from OpenCV (H, W, 3)

    Returns:
        dict with surface_pattern, total_lines, vertical_lines,
        horizontal_lines, diagonal_lines
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Resize for consistency
        gray = cv2.resize(gray, (224, 224))

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Canny edge detection
        edges = cv2.Canny(blurred, threshold1=50, threshold2=150)

        # Probabilistic Hough Line Transform
        lines = cv2.HoughLinesP(
            edges,
            rho=1,
            theta=np.pi / 180,
            threshold=30,
            minLineLength=20,
            maxLineGap=10,
        )

        if lines is None:
            return {
                "surface_pattern": "Plain",
                "total_lines": 0,
                "vertical_lines": 0,
                "horizontal_lines": 0,
                "diagonal_lines": 0,
                "edge_density": 0.0,
            }

        total_lines = len(lines)
        vertical_lines = 0
        horizontal_lines = 0
        diagonal_lines = 0

        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))

            if angle < 20 or angle > 160:
                horizontal_lines += 1
            elif 70 < angle < 110:
                vertical_lines += 1
            else:
                diagonal_lines += 1

        # Determine surface pattern based on line distribution
        surface_pattern = _classify_pattern(
            total_lines, vertical_lines, horizontal_lines, diagonal_lines
        )

        # Calculate edge density as an additional metric
        edge_density = float(np.sum(edges > 0)) / (edges.shape[0] * edges.shape[1])

        return {
            "surface_pattern": surface_pattern,
            "total_lines": total_lines,
            "vertical_lines": vertical_lines,
            "horizontal_lines": horizontal_lines,
            "diagonal_lines": diagonal_lines,
            "edge_density": round(edge_density, 4),
        }

    except Exception as e:
        logger.error(f"Pattern analysis failed: {e}")
        return {
            "surface_pattern": "Unknown",
            "total_lines": 0,
            "vertical_lines": 0,
            "horizontal_lines": 0,
            "diagonal_lines": 0,
            "edge_density": 0.0,
            "error": str(e),
        }


def _classify_pattern(
    total: int,
    vertical: int,
    horizontal: int,
    diagonal: int,
) -> str:
    """
    Classify the pattern based on line counts and orientation distribution.

    Rules:
    - Very few lines → Plain
    - Mostly vertical → Striped
    - Both vertical and horizontal present → Checked
    - Mostly diagonal or mixed → Patterned
    """
    if total < 10:
        return "Plain"

    v_ratio = vertical / total if total > 0 else 0
    h_ratio = horizontal / total if total > 0 else 0
    d_ratio = diagonal / total if total > 0 else 0

    if v_ratio > 0.6:
        return "Striped"
    if v_ratio > 0.3 and h_ratio > 0.2:
        return "Checked"
    if d_ratio > 0.5:
        return "Patterned"
    if total > 80:
        return "Patterned"
    return "Plain"