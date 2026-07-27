from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MaterialClassificationBase(BaseModel):
    """
    Common fields for material classification.
    """

    textile_waste_id: int = Field(
        ...,
        gt=0,
        description="Associated Textile Waste ID."
    )

    predicted_material: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Predicted material name."
    )

    confidence_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Prediction confidence percentage."
    )

    material_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Material category."
    )

    fibre_composition: Optional[str] = Field(
        None,
        max_length=255,
        description="Detailed fibre composition."
    )

    model_name: str = Field(
        ...,
        max_length=100,
        description="AI model name."
    )

    model_version: str = Field(
        ...,
        max_length=50,
        description="Model version."
    )

    processing_time: Optional[float] = Field(
        None,
        ge=0,
        description="Inference time in seconds."
    )


class MaterialClassificationCreate(MaterialClassificationBase):
    """
    Used internally by the service after AI inference.
    """
    pass


class MaterialClassificationUpdate(BaseModel):
    """
    Used when updating a classification result.
    """

    predicted_material: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100
    )

    confidence_score: Optional[float] = Field(
        None,
        ge=0,
        le=100
    )

    material_type: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100
    )

    fibre_composition: Optional[str] = Field(
        None,
        max_length=255
    )


class MaterialClassificationResponse(MaterialClassificationBase):
    """
    Response schema returned to clients.
    """

    id: int
    classified_at: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class MaterialClassificationListResponse(BaseModel):
    """
    Response schema for multiple material classifications.
    """

    total: int
    items: list[MaterialClassificationResponse]