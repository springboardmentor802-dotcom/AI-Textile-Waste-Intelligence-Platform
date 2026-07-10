from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db
from app.auth.dependencies import get_current_user

from app.models.user import User
from app.models.manufacturer import Manufacturer

from app.schemas.manufacturer import (
    ManufacturerCreate,
    ManufacturerResponse
)

router = APIRouter(
    prefix="/manufacturers",
    tags=["Manufacturers"]
)


@router.post(
    "",
    response_model=ManufacturerResponse
)
def create_manufacturer_profile(
    manufacturer: ManufacturerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only manufacturers can create profile
    if current_user.role != "Manufacturer":
        raise HTTPException(
            status_code=403,
            detail="Only manufacturers can create a manufacturer profile."
        )

    # Check if profile already exists
    existing_profile = db.query(Manufacturer).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Manufacturer profile already exists."
        )

    # Check GST uniqueness (if provided)
    if manufacturer.gst_number:
        gst_exists = db.query(Manufacturer).filter(
            Manufacturer.gst_number == manufacturer.gst_number
        ).first()

        if gst_exists:
            raise HTTPException(
                status_code=400,
                detail="GST number already exists."
            )

    new_profile = Manufacturer(
        user_id=current_user.id,
        company_name=manufacturer.company_name,
        gst_number=manufacturer.gst_number,
        industry_type=manufacturer.industry_type,
        address=manufacturer.address,
        city=manufacturer.city,
        state=manufacturer.state,
        pincode=manufacturer.pincode,
        contact_person=manufacturer.contact_person,
        phone=manufacturer.phone,
        website=manufacturer.website,
        description=manufacturer.description
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get(
    "/me",
    response_model=ManufacturerResponse
)
def get_my_manufacturer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only manufacturers can access
    if current_user.role != "Manufacturer":
        raise HTTPException(
            status_code=403,
            detail="Only manufacturers can access this endpoint."
        )

    profile = db.query(Manufacturer).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    return profile


@router.put(
    "/me",
    response_model=ManufacturerResponse
)
def update_manufacturer_profile(
    manufacturer_data: ManufacturerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only manufacturers can update
    if current_user.role != "Manufacturer":
        raise HTTPException(
            status_code=403,
            detail="Only manufacturers can update their profile."
        )

    profile = db.query(Manufacturer).filter(
        Manufacturer.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer profile not found."
        )

    # Check GST uniqueness
    if manufacturer_data.gst_number:

        existing_gst = db.query(Manufacturer).filter(
            Manufacturer.gst_number == manufacturer_data.gst_number,
            Manufacturer.id != profile.id
        ).first()

        if existing_gst:
            raise HTTPException(
                status_code=400,
                detail="GST number already exists."
            )

    profile.company_name = manufacturer_data.company_name
    profile.gst_number = manufacturer_data.gst_number
    profile.industry_type = manufacturer_data.industry_type
    profile.address = manufacturer_data.address
    profile.city = manufacturer_data.city
    profile.state = manufacturer_data.state
    profile.pincode = manufacturer_data.pincode
    profile.contact_person = manufacturer_data.contact_person
    profile.phone = manufacturer_data.phone
    profile.website = manufacturer_data.website
    profile.description = manufacturer_data.description

    db.commit()
    db.refresh(profile)

    return profile




@router.get(
    "",
    response_model=ManufacturerListResponse
)
def get_all_manufacturers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    manufacturers = db.query(Manufacturer).all()

    return {
        "manufacturers": manufacturers
    }






@router.get(
    "/{manufacturer_id}",
    response_model=ManufacturerResponse
)
def get_manufacturer_by_id(
    manufacturer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    manufacturer = db.query(Manufacturer).filter(
        Manufacturer.id == manufacturer_id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer not found."
        )

    return manufacturer




@router.delete("/{manufacturer_id}")
def delete_manufacturer(
    manufacturer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):

    manufacturer = db.query(Manufacturer).filter(
        Manufacturer.id == manufacturer_id
    ).first()

    if manufacturer is None:
        raise HTTPException(
            status_code=404,
            detail="Manufacturer not found."
        )

    db.delete(manufacturer)
    db.commit()

    return {
        "message": "Manufacturer deleted successfully."
    }


    