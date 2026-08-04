from pydantic import BaseModel


class InventoryCreate(BaseModel):

    batch_id: str

    material_profile: str

    waste_origin: str

    condition_grade: str

    recovery_potential: str

    processing_status: str

    waste_weight: float