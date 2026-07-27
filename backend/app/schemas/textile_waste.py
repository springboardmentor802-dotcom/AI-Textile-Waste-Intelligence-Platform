from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TextileWasteBase(BaseModel):
    """
    Common fields shared across Textile Waste schemas.
    """

    inventory_id: int = Field(
        ...,
        gt=0,
        description="Associated inventory ID."
    )

    textile_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Name of the textile item."
    )

    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional description of the textile waste."
    )


class TextileWasteCreate(TextileWasteBase):
    """
    Schema used when uploading a new textile waste item.

    The image file will be received separately using
    UploadFile in the FastAPI endpoint.
    """
    pass


class TextileWasteUpdate(BaseModel):
    """
    Schema used for updating textile waste information.
    """

    textile_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255
    )

    description: Optional[str] = Field(
        None,
        max_length=1000
    )

    analysis_status: Optional[str] = Field(
        None,
        max_length=50
    )


class TextileWasteResponse(TextileWasteBase):
    """
    Schema returned to the client.
    """

    id: int
    image_path: str
    uploaded_by: int
    analysis_status: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class TextileWasteListResponse(BaseModel):
    """
    Response schema for a list of textile waste records.
    """

    total: int
    items: list[TextileWasteResponse]