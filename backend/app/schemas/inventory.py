from pydantic import BaseModel, Field, field_validator


class InventoryCreate(BaseModel):

    batch_id: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    material_profile: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    waste_origin: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    condition_grade: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    recovery_potential: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    processing_status: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    waste_weight: float = Field(
        ...,
        gt=0
    )


    @field_validator(
        "batch_id",
        "material_profile",
        "waste_origin",
        "condition_grade",
        "recovery_potential",
        "processing_status"
    )
    @classmethod
    def validate_non_empty_strings(cls, value: str):

        value = value.strip()

        if not value:
            raise ValueError(
                "Field cannot be empty or contain only whitespace"
            )

        return value