from fastapi import APIRouter, UploadFile, File, Depends
from pathlib import Path
import shutil
import uuid

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.waste_upload import WasteUpload
from app.models.recommendation import Recommendation

from app.services.model_service import predict_image
from app.services.recommendation_service import get_recommendation
from app.services.decision_service import assess_textile_condition
from app.services.condition_service import analyze_condition



router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)



UPLOAD_DIR = Path("temp_uploads")

UPLOAD_DIR.mkdir(exist_ok=True)





@router.post("/")
async def predict_textile(

    file: UploadFile = File(...),

    db: Session = Depends(get_db)

):


    # -----------------------------
    # Save Uploaded Image
    # -----------------------------


    file_name = f"{uuid.uuid4()}_{file.filename}"


    file_path = UPLOAD_DIR / file_name



    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )






    # -----------------------------
    # CNN Material Prediction
    # -----------------------------


    prediction = predict_image(

        file_path

    )







    # -----------------------------
    # Material Intelligence
    # -----------------------------


    recommendation = get_recommendation(

        prediction["predicted_class"]

    )







    # -----------------------------
    # Condition Assessment
    # -----------------------------


    condition_result = analyze_condition(

        file_path

    )







    # -----------------------------
    # Circular Decision Engine
    # -----------------------------


    decision = assess_textile_condition(

        material=recommendation["material"],

        condition=condition_result["condition"],

        defect=condition_result["defect"],

        contamination=condition_result["contamination"]

    )







    print("Prediction:", prediction)

    print("Recommendation:", recommendation)

    print("Condition:", condition_result)

    print("Decision:", decision)







    # -----------------------------
    # Save Waste Upload Record
    # -----------------------------


    upload_record = WasteUpload(


        image_path=str(file_path),


        predicted_class=prediction["predicted_class"],


        confidence=prediction["confidence"],


        material=recommendation["material"],


        material_type=recommendation["type"],


        recycling_method=recommendation["recyclable_method"],


        environmental_impact=recommendation["environmental_impact"],


        biodegradable=recommendation["biodegradable"],


        reusable=recommendation["reusable"],



        defect_status=condition_result["defect"],


        defect_severity=condition_result["severity"],


        contamination_status=condition_result["contamination"],


        condition=condition_result["condition"],


        final_decision=decision["final_decision"],


        uploaded_by=1

    )







    db.add(upload_record)








    # -----------------------------
    # Save Recommendation Record
    # -----------------------------


    recommendation_record = Recommendation(


        waste_type=prediction["predicted_class"],


        recommendation=recommendation["recyclable_method"]

    )





    db.add(recommendation_record)





    db.commit()





    db.refresh(upload_record)

    db.refresh(recommendation_record)







    # -----------------------------
    # API Response
    # -----------------------------


    return {


        "status": "success",



        "upload_id": upload_record.upload_id,




        "fabric_prediction": {


            "class": prediction["predicted_class"],


            "confidence": prediction["confidence"]

        },





        "material_analysis": recommendation,





        "condition_analysis": condition_result,





        "decision_analysis": decision


    }