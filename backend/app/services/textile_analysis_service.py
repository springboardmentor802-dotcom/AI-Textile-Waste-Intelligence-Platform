from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.textile_waste import TextileWaste

from app.services.image_service import image_service
from app.services.material_classification_service import (
    material_classification_service,
)
from app.services.waste_classification_service import (
    waste_classification_service,
)


class TextileAnalysisService:
    """
    Orchestrates the complete textile analysis workflow.
    """

    async def analyze_textile(
        self,
        db: Session,
        *,
        inventory_id: int,
        textile_name: str,
        description: str | None,
        uploaded_by: int,
        image: UploadFile,
    ):
        """
        Complete workflow:

        1. Save image
        2. Create TextileWaste record
        3. Material Classification
        4. Waste Classification
        5. Return complete analysis
        """

        # Save uploaded image
        image_path = await image_service.save_image(image)

        # Create textile waste record
        textile = TextileWaste(
            inventory_id=inventory_id,
            image_path=image_path,
            textile_name=textile_name,
            description=description,
            uploaded_by=uploaded_by,
            analysis_status="Completed",
        )

        db.add(textile)
        db.commit()
        db.refresh(textile)

        # Material Classification
        material = material_classification_service.classify(
            db=db,
            textile_waste=textile,
        )

        # Waste Classification
        waste = waste_classification_service.classify(
            db=db,
            material=material,
        )

        return {
            "textile": textile,
            "material": material,
            "waste": waste,
        }


textile_analysis_service = TextileAnalysisService()