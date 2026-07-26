"""
Textile Image Analysis Pipeline
Orchestrates: Material Recognition → YOLO Defect Detection →
Color Analysis → Texture Analysis → Pattern Analysis
"""

import cv2
import numpy as np
import logging
from PIL import Image
import io

from app.services.ml_service import predict_material
from app.services.yolo_service import detect_defects
from app.services.opencv.color_analysis import analyze_color
from app.services.opencv.texture_analysis import analyze_texture
from app.services.opencv.pattern_analysis import analyze_pattern

logger = logging.getLogger(__name__)


def _bytes_to_bgr(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes to OpenCV BGR numpy array."""
    image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image_pil)
    return cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)


def run_full_pipeline(image_bytes: bytes, filename: str = "") -> dict:
    """
    Run the complete textile image analysis pipeline.

    Pipeline order:
    1. Material Recognition (CNN)
    2. Defect Detection (YOLOv8)
    3. Color Analysis (OpenCV + KMeans)
    4. Texture Analysis (GLCM)
    5. Pattern Analysis (Canny + Hough)
    6. Waste Categorization
    7. Recyclability Assessment
    8. Sustainability Intelligence
    9. Waste Scoring

    Args:
        image_bytes: Raw image bytes from upload
        filename: Original filename for metadata

    Returns:
        Unified analysis result dict
    """
    logger.info(f"Starting full analysis pipeline for: {filename}")

    # Convert to OpenCV format for OpenCV modules
    image_bgr = _bytes_to_bgr(image_bytes)

    # Step 1: Material Recognition
    logger.info("Running material recognition...")
    material_result = predict_material(image_bytes)

    # Step 2: Defect Detection
    logger.info("Running defect detection...")
    defect_result = detect_defects(image_bytes)

    # Step 3: Color Analysis
    logger.info("Running color analysis...")
    color_result = analyze_color(image_bgr)

    # Step 4: Texture Analysis
    logger.info("Running texture analysis...")
    texture_result = analyze_texture(image_bgr)

    # Step 5: Pattern Analysis
    logger.info("Running pattern analysis...")
    pattern_result = analyze_pattern(image_bgr)

    # Step 6: Waste Categorization
    from app.services.waste_categorization import categorize_waste
    waste_category = categorize_waste(material_result, defect_result, texture_result)

    # Step 7: Recyclability Assessment
    from app.services.recyclability_service import assess_recyclability
    recyclability = assess_recyclability(material_result, defect_result, texture_result, pattern_result)

    # Step 8: Sustainability Intelligence
    from app.services.sustainability_service import generate_sustainability_report
    sustainability = generate_sustainability_report(material_result, waste_category, recyclability)

    # Step 9: Waste Scoring
    from app.services.scoring_service import calculate_scores
    scores = calculate_scores(material_result, defect_result, texture_result, recyclability)

    result = {
        "filename": filename,
        "status": "success",
        "material_recognition": material_result,
        "defect_detection": defect_result,
        "color_analysis": color_result,
        "texture_analysis": texture_result,
        "pattern_analysis": pattern_result,
        "waste_categorization": waste_category,
        "recyclability_assessment": recyclability,
        "sustainability_intelligence": sustainability,
        "waste_scores": scores,
    }

    logger.info(f"Pipeline complete for: {filename}")
    return result