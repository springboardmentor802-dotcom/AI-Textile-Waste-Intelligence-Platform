"""
AI Textile Intelligence Report Service
--------------------------------------
Generates a structured report after image analysis.
"""

from datetime import datetime
import uuid


def generate_report(result: dict):

    report = {
        "report_id": str(uuid.uuid4())[:8].upper(),
        "generated_on": datetime.now().strftime("%d-%m-%Y"),
        "generated_time": datetime.now().strftime("%I:%M %p"),

        "material": result.get("material"),
        "surface": result.get("surface"),

        "material_confidence": result.get("material_confidence"),
        "defect": result.get("defect"),
        "defect_confidence": result.get("defect_confidence"),

        "waste_category": result.get("waste_category"),
        "recyclability": result.get("recyclability"),
        "reuse": result.get("reuse"),

        "sustainability_score": result.get("sustainability_score"),
        "environmental_impact": result.get("environmental_impact"),
        "carbon_footprint": result.get("carbon_footprint"),
        "water_consumption": result.get("water_consumption"),

        "recommendation": result.get("recycling_recommendation"),

        "summary":
            f"The uploaded textile was identified as "
            f"{result.get('material')} with "
            f"{result.get('defect')}.\n\n"
            f"The waste category is "
            f"{result.get('waste_category')}.\n\n"
            f"Recommended action: "
            f"{result.get('recycling_recommendation')}.\n\n"
            f"Overall Sustainability Score: "
            f"{result.get('sustainability_score')}."
    }

    return report