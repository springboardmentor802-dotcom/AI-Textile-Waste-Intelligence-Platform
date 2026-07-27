from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import joinedload
from app.models.textile_waste import TextileWaste
import os

from fastapi.responses import FileResponse

from app.services.report_service import report_service
from app.services.recommendation_service import (
    recommendation_service,
)

from app.models.material_classification import MaterialClassification
from app.models.waste_classification import WasteClassification
from app.database.session import get_db
from app.services.textile_analysis_service import (
    textile_analysis_service,
)

router = APIRouter(
    prefix="/material-analysis",
    tags=["Material Analysis"],
)


@router.post(
    "/analyze",
    status_code=status.HTTP_201_CREATED,
)
async def analyze_textile(
    inventory_id: int = Form(...),
    textile_name: str = Form(...),
    description: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Upload a textile image and perform complete
    material and waste analysis.
    """

    try:
        result = await textile_analysis_service.analyze_textile(
            db=db,
            inventory_id=inventory_id,
            textile_name=textile_name,
            description=description,
            uploaded_by=current_user.id,
            image=image,
        )

        textile = result["textile"]
        material = result["material"]
        waste = result["waste"]
        recommendation = recommendation_service.generate(waste)

        return {
            "message": "Analysis completed successfully.",
            "textile": {
                "id": textile.id,
                "inventory_id": textile.inventory_id,
                "textile_name": textile.textile_name,
                "description": textile.description,
                "image_path": textile.image_path,
                "analysis_status": textile.analysis_status,
                "created_at": textile.created_at,
            },
            "material_classification": {
                "id": material.id,
                "predicted_material": material.predicted_material,
                "confidence_score": material.confidence_score,
                "material_type": material.material_type,
                "fibre_composition": material.fibre_composition,
                "model_name": material.model_name,
                "model_version": material.model_version,
                "processing_time": material.processing_time,
                "classified_at": material.classified_at,
            },
            "waste_classification": {
                "id": waste.id,
                "waste_category": waste.waste_category,
                "waste_condition": waste.waste_condition,
                "recyclability_score": waste.recyclability_score,
                "recyclable": waste.recyclable,
                "recommended_recycling_method": waste.recommended_recycling_method,
                "disposal_method": waste.disposal_method,
                "carbon_saving_estimate": waste.carbon_saving_estimate,
                "sustainability_score": waste.sustainability_score,
                "remarks": waste.remarks,
                "model_name": waste.model_name,
                "model_version": waste.model_version,
                "classified_at": waste.classified_at,
            },
            "recommendation": recommendation,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Textile analysis failed: {str(e)}",
        )
    



@router.get("/history")
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get all textile analyses uploaded by the current user.
    """

    analyses = (
        db.query(TextileWaste)
        .options(
            joinedload(TextileWaste.material_classification),
            joinedload(TextileWaste.waste_classification),
        )
        .filter(
            TextileWaste.uploaded_by == current_user.id
        )
        .order_by(TextileWaste.created_at.desc())
        .all()
    )

    return [
        {
            "id": textile.id,
            "inventory_id": textile.inventory_id,
            "textile_name": textile.textile_name,
            "image_path": textile.image_path,
            "analysis_status": textile.analysis_status,
            "created_at": textile.created_at,

            "material": (
                {
                    "predicted_material": textile.material_classification.predicted_material,
                    "confidence_score": textile.material_classification.confidence_score,
                    "material_type": textile.material_classification.material_type,
                }
                if textile.material_classification
                else None
            ),

            "waste": (
                {
                    "waste_category": textile.waste_classification.waste_category,
                    "recyclability_score": textile.waste_classification.recyclability_score,
                    "recommended_method": textile.waste_classification.recommended_recycling_method,
                }
                if textile.waste_classification
                else None
            ),
        }
        for textile in analyses
    ]


@router.get("/{analysis_id}")
def get_analysis_details(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get complete details of a single textile analysis.
    """

    textile = (
        db.query(TextileWaste)
        .options(
            joinedload(TextileWaste.material_classification),
            joinedload(TextileWaste.waste_classification),
        )
        .filter(
            TextileWaste.id == analysis_id,
            TextileWaste.uploaded_by == current_user.id,
        )
        .first()
    )

    if textile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    material = textile.material_classification
    waste = textile.waste_classification
    recommendation = (
    recommendation_service.generate(waste)
    if waste
    else None
)

    return {
        "textile": {
            "id": textile.id,
            "inventory_id": textile.inventory_id,
            "textile_name": textile.textile_name,
            "description": textile.description,
            "image_path": textile.image_path,
            "analysis_status": textile.analysis_status,
            "created_at": textile.created_at,
        },

        "material_classification": (
            {
                "id": material.id,
                "predicted_material": material.predicted_material,
                "confidence_score": material.confidence_score,
                "material_type": material.material_type,
                "fibre_composition": material.fibre_composition,
                "model_name": material.model_name,
                "model_version": material.model_version,
                "processing_time": material.processing_time,
                "classified_at": material.classified_at,
            }
            if material
            else None
        ),

        "waste_classification": (
            {
                "id": waste.id,
                "waste_category": waste.waste_category,
                "waste_condition": waste.waste_condition,
                "recyclability_score": waste.recyclability_score,
                "recyclable": waste.recyclable,
                "recommended_recycling_method": waste.recommended_recycling_method,
                "disposal_method": waste.disposal_method,
                "carbon_saving_estimate": waste.carbon_saving_estimate,
                "sustainability_score": waste.sustainability_score,
                "remarks": waste.remarks,
                "model_name": waste.model_name,
                "model_version": waste.model_version,
                "classified_at": waste.classified_at,
            }
            if waste
            else None
        ),
        "recommendation": recommendation,
    }



@router.get("/report/{analysis_id}")
def download_analysis_report(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generate and download a PDF report
    for a textile analysis.
    """

    try:

        report_path = report_service.generate_report(
            db=db,
            analysis_id=analysis_id,
            current_user_id=current_user.id,
        )

        filename = os.path.basename(report_path)

        return FileResponse(
            path=report_path,
            media_type="application/pdf",
            filename=filename,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}",
        )