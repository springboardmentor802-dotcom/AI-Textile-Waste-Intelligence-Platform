from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.inventory import router as inventory_router
from app.api.upload import router as upload_router
from app.api.material_analysis import router as material_router
from app.api.defect_analysis import router as defect_router
from app.api.waste_classification import router as waste_router
from app.api.sustainability import router as sustainability_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(inventory_router)
api_router.include_router(upload_router)
api_router.include_router(material_router)
api_router.include_router(defect_router)
api_router.include_router(waste_router)
api_router.include_router(sustainability_router)
