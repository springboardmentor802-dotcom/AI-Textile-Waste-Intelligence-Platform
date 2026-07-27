from .knowledge_base import FABRIC_RULES


def build_response(fabric_type: str, confidence: float):
    """
    Builds the final AI analysis report returned to the frontend.
    """

    fabric_info = FABRIC_RULES.get(fabric_type)

    if fabric_info is None:
        return {
            "success": False,
            "message": "Unknown fabric type."
        }

    return {
        "success": True,
        "fabric_type": fabric_type,
        "confidence": round(confidence, 2),
        "quality": fabric_info["quality"],
        "reusability": fabric_info["reusability"],
        "recyclability": fabric_info["recyclability"],
        "recycling_method": fabric_info["recycling_method"],
        "recommended_products": fabric_info["recommended_products"],
        "environmental_impact": fabric_info["environmental_impact"]
    }