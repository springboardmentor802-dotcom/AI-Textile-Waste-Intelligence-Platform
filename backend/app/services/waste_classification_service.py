from sqlalchemy.orm import Session

from app.models.material_classification import MaterialClassification
from app.models.waste_classification import WasteClassification


class WasteClassificationService:
    """
    Service responsible for classifying textile waste based on
    material classification results.

    Currently uses rule-based logic.

    Future versions can replace these rules with an AI model.
    """

    MODEL_NAME = "WasteRuleEngine"

    MODEL_VERSION = "1.0"

    RULES = {
        "Cotton": {
            "category": "Fabric Scrap",
            "condition": "Reusable",
            "score": 96,
            "recyclable": True,
            "method": "Mechanical Recycling",
            "disposal": None,
            "carbon": 4.8,
            "sustainability": 95,
            "remarks": "Natural fibre with high recyclability."
        },

        "Polyester": {
            "category": "Post Industrial Waste",
            "condition": "Reusable",
            "score": 88,
            "recyclable": True,
            "method": "Chemical Recycling",
            "disposal": None,
            "carbon": 3.9,
            "sustainability": 82,
            "remarks": "Synthetic fibre suitable for chemical recycling."
        },

        "Wool": {
            "category": "Fabric Scrap",
            "condition": "Reusable",
            "score": 94,
            "recyclable": True,
            "method": "Mechanical Recycling",
            "disposal": None,
            "carbon": 4.3,
            "sustainability": 90,
            "remarks": "High-value natural fibre."
        },

        "Silk": {
            "category": "Luxury Textile Waste",
            "condition": "Reusable",
            "score": 91,
            "recyclable": True,
            "method": "Upcycling",
            "disposal": None,
            "carbon": 4.1,
            "sustainability": 89,
            "remarks": "Suitable for reuse and upcycling."
        },

        "Linen": {
            "category": "Fabric Scrap",
            "condition": "Reusable",
            "score": 95,
            "recyclable": True,
            "method": "Mechanical Recycling",
            "disposal": None,
            "carbon": 4.6,
            "sustainability": 94,
            "remarks": "Biodegradable natural fibre."
        },

        "Nylon": {
            "category": "Industrial Textile Waste",
            "condition": "Reusable",
            "score": 83,
            "recyclable": True,
            "method": "Chemical Recycling",
            "disposal": None,
            "carbon": 3.5,
            "sustainability": 79,
            "remarks": "Synthetic fibre requiring specialised recycling."
        },

        "Rayon": {
            "category": "Mixed Textile Waste",
            "condition": "Reusable",
            "score": 86,
            "recyclable": True,
            "method": "Chemical Recycling",
            "disposal": None,
            "carbon": 3.8,
            "sustainability": 84,
            "remarks": "Semi-synthetic fibre."
        },

        "Denim": {
            "category": "Garment Waste",
            "condition": "Reusable",
            "score": 92,
            "recyclable": True,
            "method": "Mechanical Recycling",
            "disposal": None,
            "carbon": 4.4,
            "sustainability": 91,
            "remarks": "Can be converted into insulation and yarn."
        },

        "Acrylic": {
            "category": "Synthetic Textile Waste",
            "condition": "Damaged",
            "score": 75,
            "recyclable": False,
            "method": None,
            "disposal": "Energy Recovery",
            "carbon": 2.8,
            "sustainability": 70,
            "remarks": "Limited recycling options."
        },

        "Blended Fabric": {
            "category": "Mixed Textile Waste",
            "condition": "Mixed",
            "score": 68,
            "recyclable": False,
            "method": None,
            "disposal": "Specialised Separation Required",
            "carbon": 2.4,
            "sustainability": 65,
            "remarks": "Blended fibres require advanced separation."
        }
    }

    def classify(
        self,
        db: Session,
        material: MaterialClassification
    ) -> WasteClassification:
        """
        Generate waste classification from
        a material classification result.
        """

        rule = self.RULES.get(
            material.predicted_material
        )

        if rule is None:
            rule = {
                "category": "Unknown",
                "condition": "Unknown",
                "score": 50,
                "recyclable": False,
                "method": None,
                "disposal": "Manual Inspection",
                "carbon": 0.0,
                "sustainability": 50,
                "remarks": "No matching rule found."
            }

        waste = WasteClassification(

            textile_waste_id=material.textile_waste_id,

            waste_category=rule["category"],

            waste_condition=rule["condition"],

            recyclability_score=rule["score"],

            recyclable=rule["recyclable"],

            recommended_recycling_method=rule["method"],

            disposal_method=rule["disposal"],

            carbon_saving_estimate=rule["carbon"],

            sustainability_score=rule["sustainability"],

            remarks=rule["remarks"],

            model_name=self.MODEL_NAME,

            model_version=self.MODEL_VERSION

        )

        db.add(waste)

        db.commit()

        db.refresh(waste)

        return waste


waste_classification_service = WasteClassificationService()