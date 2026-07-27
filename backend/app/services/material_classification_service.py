import random
import time

from sqlalchemy.orm import Session

from app.models.material_classification import MaterialClassification
from app.models.textile_waste import TextileWaste


class MaterialClassificationService:
    """
    Service responsible for classifying textile materials.

    Currently uses a mock classifier.
    This can later be replaced with a TensorFlow/PyTorch
    inference engine without changing the API layer.
    """

    MATERIALS = [
        ("Cotton", "Natural Fibre"),
        ("Polyester", "Synthetic Fibre"),
        ("Wool", "Natural Fibre"),
        ("Silk", "Natural Fibre"),
        ("Linen", "Natural Fibre"),
        ("Nylon", "Synthetic Fibre"),
        ("Rayon", "Semi-Synthetic Fibre"),
        ("Denim", "Natural Fibre"),
        ("Acrylic", "Synthetic Fibre"),
        ("Blended Fabric", "Blended Fibre")
    ]

    MODEL_NAME = "MaterialNet"

    MODEL_VERSION = "1.0"

    def classify(
        self,
        db: Session,
        textile_waste: TextileWaste
    ) -> MaterialClassification:
        """
        Classify a textile image.

        Currently this is a mock implementation.
        Later it will call the trained AI model.
        """

        start_time = time.time()

        predicted_material, material_type = random.choice(
            self.MATERIALS
        )

        confidence = round(
            random.uniform(90.0, 99.9),
            2
        )

        processing_time = round(
            time.time() - start_time,
            4
        )

        material = MaterialClassification(

            textile_waste_id=textile_waste.id,

            predicted_material=predicted_material,

            confidence_score=confidence,

            material_type=material_type,

            fibre_composition=predicted_material,

            model_name=self.MODEL_NAME,

            model_version=self.MODEL_VERSION,

            processing_time=processing_time

        )

        db.add(material)

        db.commit()

        db.refresh(material)

        return material


material_classification_service = MaterialClassificationService()