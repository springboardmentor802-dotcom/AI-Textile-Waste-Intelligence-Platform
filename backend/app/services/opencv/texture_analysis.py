"""
Texture Analysis Module
Algorithm: Gray Level Co-occurrence Matrix (GLCM)
Estimates surface texture characteristics of textile images.
"""

import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)


def analyze_texture(image: np.ndarray) -> dict:
    """
    Analyze texture characteristics using GLCM features.

    Args:
        image: BGR numpy array from OpenCV (H, W, 3)

    Returns:
        dict with texture_type, contrast, homogeneity, energy, correlation
    """
    try:
        from skimage.feature import graycomatrix, graycoprops

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Resize for consistency
        gray = cv2.resize(gray, (224, 224))

        # Normalize to 0-255 uint8
        gray = gray.astype(np.uint8)

        # Compute GLCM
        # distances=[1] — adjacent pixels
        # angles=[0] — horizontal direction
        glcm = graycomatrix(
            gray,
            distances=[1],
            angles=[0, np.pi / 4, np.pi / 2, 3 * np.pi / 4],
            levels=256,
            symmetric=True,
            normed=True,
        )

        # Extract GLCM properties (averaged across angles)
        contrast = float(np.mean(graycoprops(glcm, "contrast")))
        homogeneity = float(np.mean(graycoprops(glcm, "homogeneity")))
        energy = float(np.mean(graycoprops(glcm, "energy")))
        correlation = float(np.mean(graycoprops(glcm, "correlation")))

        # Classify texture based on contrast
        if contrast > 15:
            texture_type = "Rough"
        elif contrast > 5:
            texture_type = "Medium"
        else:
            texture_type = "Smooth"

        # Additional texture descriptor
        texture_detail = _describe_texture(energy, homogeneity, correlation)

        return {
            "texture_type": texture_type,
            "texture_detail": texture_detail,
            "contrast": round(contrast, 4),
            "homogeneity": round(homogeneity, 4),
            "energy": round(energy, 4),
            "correlation": round(correlation, 4),
        }

    except Exception as e:
        logger.error(f"Texture analysis failed: {e}")
        return {
            "texture_type": "Unknown",
            "texture_detail": "Analysis failed",
            "contrast": 0.0,
            "homogeneity": 0.0,
            "energy": 0.0,
            "correlation": 0.0,
            "error": str(e),
        }


def _describe_texture(energy: float, homogeneity: float, correlation: float) -> str:
    """
    Generate a descriptive label based on GLCM features.
    """
    if energy > 0.3 and homogeneity > 0.8:
        return "Fine and uniform"
    if correlation > 0.95:
        return "Highly structured"
    if energy < 0.05:
        return "Complex and varied"
    if homogeneity > 0.6:
        return "Moderately uniform"
    return "Variable texture"