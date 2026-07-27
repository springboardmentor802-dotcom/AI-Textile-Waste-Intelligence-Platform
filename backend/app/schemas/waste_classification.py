from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WasteClassificationBase(BaseModel):
    """
    Common fields for waste classification.
    """

    textile_waste_id: int = Field(
        ...,
        gt=0,
        description="Associated Textile Waste ID."
    )

    waste_category: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Predicted waste category."
    )

    waste_condition: Optional[str] = Field(
        None,
        max_length=100,
        description="Condition of the textile waste."
    )

    recyclability_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Recyclability score (0-100)."
    )

    recyclable: bool = Field(
        ...,
        description="Whether the textile is recyclable."
    )

    recommended_recycling_method: Optional[str] = Field(
        None,
        max_length=150,
        description="Suggested recycling method."
    )

    disposal_method: Optional[str] = Field(
        None,
        max_length=150,
        description="Suggested disposal method if recycling is not possible."
    )

    carbon_saving_estimate: Optional[float] = Field(
        None,
        ge=0,
        description="Estimated carbon saving in kilograms."
    )

    sustainability_score: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Overall sustainability score."
    )

    remarks: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional remarks."
    )

    model_name: str = Field(
        ...,
        max_length=100,
        description="Model used for classification."
    )

    model_version: str = Field(
        ...,
        max_length=50,
        description="Version of the classification model."
    )


class WasteClassificationCreate(WasteClassificationBase):
    """
    Used internally when saving a new waste classification.
    """
    pass


class WasteClassificationUpdate(BaseModel):
    """
    Used for updating waste classification results.
    """

    waste_category: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100
    )

    waste_condition: Optional[str] = Field(
        None,
        max_length=100
    )

    recyclability_score: Optional[float] = Field(
        None,
        ge=0,
        le=100
    )

    recyclable: Optional[bool] = None

    recommended_recycling_method: Optional[str] = Field(
        None,
        max_length=150
    )

    disposal_method: Optional[str] = Field(
        None,
        max_length=150
    )

    carbon_saving_estimate: Optional[float] = Field(
        None,
        ge=0
    )

    sustainability_score: Optional[float] = Field(
        None,
        ge=0,
        le=100
    )

    remarks: Optional[str] = Field(
        None,
        max_length=1000
    )


class WasteClassificationResponse(WasteClassificationBase):
    """
    Response schema returned to clients.
    """

    id: int
    classified_at: datetime
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class WasteClassificationListResponse(BaseModel):
    """
    Response schema for multiple waste classification records.
    """

    total: int
    items: list[WasteClassificationResponse]