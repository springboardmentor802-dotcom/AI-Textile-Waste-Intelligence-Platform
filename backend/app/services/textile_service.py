from ml.predict import predict_image
from ml.predict_defect import predict_defect

from app.services.waste_service import classify_waste
from app.services.sustainability_service import generate_sustainability
from app.services.report_service import generate_report


def analyze_textile(image_path):
    """
    Complete AI Textile Intelligence Pipeline
    """

    # -----------------------------
    # Material Recognition
    # -----------------------------
    material_class, material, material_confidence = predict_image(image_path)

    # -----------------------------
    # Defect Detection
    # -----------------------------
    defect_prediction, defect_confidence = predict_defect(image_path)

    # -----------------------------
    # Waste Classification
    # -----------------------------
    waste = classify_waste(
        material["material"],
        defect_prediction,
        material["recyclability"],
        material["reuse"]
    )

    # -----------------------------
    # Sustainability Intelligence
    # -----------------------------
    sustainability = generate_sustainability(
        material["material"],
        defect_prediction
    )

    # -----------------------------
    # Complete AI Result
    # -----------------------------
    result = {

        "material": material["material"],
        "surface": material["surface"],
        "material_confidence": round(material_confidence, 2),

        "defect": defect_prediction,
        "defect_confidence": round(defect_confidence, 2),

        "condition": waste["condition"],
        "waste_category": waste["waste_category"],
        "reuse_potential": waste["reuse_potential"],
        "processing_recommendation": waste["processing_recommendation"],
        "priority": waste["priority"],

        "recyclability": material["recyclability"],
        "reuse": material["reuse"],

        "sustainability_score": sustainability["sustainability_score"],
        "environmental_impact": sustainability["environmental_impact"],
        "carbon_footprint": sustainability["carbon_footprint"],
        "water_consumption": sustainability["water_consumption"],
        "recycling_recommendation": sustainability["recycling_recommendation"],
        "circular_economy": sustainability["circular_economy"],
        "eco_rating": sustainability["eco_rating"]
    }

    # -----------------------------
    # Generate AI Report
    # -----------------------------
    report = generate_report(result)

    # Add report to response
    result["report"] = report

    return result