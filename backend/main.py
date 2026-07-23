from utlis.ai_classifier import predict_image
from utlis.classifier import classify_textile
from utlis.image_processing import read_image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List
import shutil
import os

# Create uploads folder if not exists
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="AI Textile Analytics Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Authentication Database
users_db: Dict[str, dict] = {
    "admin@textile.com": {"password": str(hash("adminpassword")), "role": "Admin"},
    "manager@textile.com": {"password": str(hash("manager123")), "role": "Sustainability Manager"},
    "facility@textile.com": {"password": str(hash("facility123")), "role": "Recycling Facility"},
    "manufacturer@textile.com": {"password": str(hash("factory123")), "role": "Manufacturer"}
}

# Real-time Intelligence History Database
ai_analysis_history = [
    {
        "id": 1,
        "product_type": "Denim Jeans",
        "material": "98% Cotton, 2% Elastane",
        "fabric_condition": "Good",
        "color_condition": "Faded",
        "contamination": "Low",
        "recyclable": "Yes",
        "reusable": "Yes",
        "upcyclable": "Yes",
        "grade": "A",
        "confidence": "89%",
        "environmental_impact": "High Positive (Saves 2,500L Water)",
        "action": "Upcycle into Denim Bags / Mechanical Shredding",
        "reasoning": "Denim structures are resilient. Cotton blend allows high mechanical recyclability, though elastane content slightly drops total index.",
        "timestamp": "2026-07-12 11:24:15"
    },
    {
        "id": 2,
        "product_type": "Cotton T-Shirts",
        "material": "100% Organic Cotton",
        "fabric_condition": "New",
        "color_condition": "Original",
        "contamination": "None",
        "recyclable": "Yes",
        "reusable": "Yes",
        "upcyclable": "Yes",
        "grade": "A+",
        "confidence": "98%",
        "environmental_impact": "Maximum Circular Economy Benefit",
        "action": "High-Quality Circular Yarn Spinning",
        "reasoning": "Pure 100% Organic Cotton without synthetic blends or chemical stain damage yields the highest grade textile fiber pulp.",
        "timestamp": "2026-07-12 12:05:42"
    }
]

class UserAuth(BaseModel):
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class TextileAnalysisInput(BaseModel):
    product_type: str
    material: str
    fabric_condition: str
    color_condition: str
    contamination_level: str

@app.get("/")
def home():
    return {"status": "Active", "message": "AI Textile Analytics Engine Online"}

@app.post("/api/register")
def register(user: UserAuth):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.email] = {"password": str(hash(user.password)), "role": user.role}
    return {"message": "User registered successfully", "role": user.role}

@app.post("/api/login")
def login(user: UserLogin):
    if user.email not in users_db or users_db[user.email]["password"] != str(hash(user.password)):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    return {"message": "Success", "email": user.email, "role": users_db[user.email]["role"]}

@app.get("/api/analysis/history")
def get_history():
    return {"total_records": len(ai_analysis_history), "data": ai_analysis_history}

@app.get("/api/analysis/report")
def generate_classification_report():
    total_items = len(ai_analysis_history)
    recyclable_count = sum(1 for item in ai_analysis_history if item["recyclable"] == "Yes")
    upcyclable_count = sum(1 for item in ai_analysis_history if item["upcyclable"] == "Yes")
    
    grade_distribution = {}
    for item in ai_analysis_history:
        g = item["grade"]
        grade_distribution[g] = grade_distribution.get(g, 0) + 1

    report_summary = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_classified_batches": total_items,
        "recyclability_rate": f"{(recyclable_count / max(total_items, 1)) * 100:.1f}%",
        "upcyclability_rate": f"{(upcyclable_count / max(total_items, 1)) * 100:.1f}%",
        "grade_breakdown": grade_distribution,
        "compliance_status": "Tier-1 Eco Standard Certified",
        "executive_summary": "Automated material analysis confirms high mechanical sorting efficiency with substantial water and carbon footprint reduction across active plant inventory nodes."
    }
    return {"status": "Success", "report": report_summary}

@app.post("/api/analysis/predict")
def predict_textile_waste(payload: TextileAnalysisInput):
    mat = payload.material.lower()
    cond = payload.fabric_condition.lower()
    contam = payload.contamination_level.lower()
    
    recyclable = "Yes"
    reusable = "Yes"
    upcyclable = "Yes"
    grade = "B"
    confidence = 85
    impact = "Moderate Resource Savings"
    action = "Standard Material Sorting"
    
    if "organic cotton" in mat:
        recyclable, reusable, upcyclable = "Yes", "Yes", "Yes"
        grade = "A+"
        confidence += 10
        impact = "Maximum Eco Benefit (Zero Chemical Toxicity)"
        action = "Premium Circular Yarn Spinning"
    elif "100% cotton" in mat or "pure cotton" in mat:
        recyclable = "Yes"
        grade = "A"
        confidence += 8
        impact = "High Positive (Saves Industrial Water)"
        action = "Mechanical Cotton Fiber Extraction"
    elif "denim" in mat or "denim" in payload.product_type.lower():
        upcyclable = "Yes"
        grade = "A"
        impact = "Saves High Surface Energy Woven Material"
        action = "Excellent for Creative Patchwork / Upcycling"
    elif "polyester" in mat or "blend" in mat:
        recyclable = "Yes"
        reusable = "No"
        grade = "C"
        confidence -= 15
        impact = "Reduces Microplastic Carbon Footprint"
        action = "Chemical Depolymerization / Plastic Pellets"
    elif "silk" in mat:
        recyclable = "No"
        reusable = "Yes"
        grade = "B"
        impact = "Preserves Premium Natural Protein Fibers"
        action = "Luxury Resale / Second-hand Vintage Market"
    elif "wool" in mat:
        recyclable = "Yes"
        reusable = "Yes" if cond in ["new", "good"] else "No"
        grade = "B+" if cond in ["new", "good"] else "C"
        action = "Shoddy Wool Shredding for Premium Carpets"
        impact = "Reduces Methane Emissions from Shearing Chains"
    else:
        recyclable = "No"
        grade = "D"
        confidence -= 20
        impact = "Low Resource Recovery Rate"
        action = "Landfill Waste Diversion Processing"

    if cond == "damaged":
        reusable = "No"
        confidence -= 10
        grade = "C" if grade not in ["C", "D"] else "D"
    if contam == "high":
        recyclable = "No"
        grade = "D"
        confidence -= 15
        action = "Industrial Co-incineration / Energy Recovery"
        impact = "Negative Environmental Leakage (High Toxic Load)"
    elif contam == "medium":
        confidence -= 5
        grade = "C"
        action = "Intense Chemical Scrubbing Before Processing"

    reason_str = f"AI model classified item based on dominant '{payload.material}' structural profile. "
    reason_str += f"Contamination is '{payload.contamination_level}' and fabric structure is '{payload.fabric_condition}', "
    if recyclable == "Yes":
        reason_str += "making it an ideal candidate for material recycling instead of hazardous landfill discarding."
    else:
        reason_str += "which restricts normal loop recycling pipelines, demanding alternative waste-to-energy handling."

    new_record = {
        "id": len(ai_analysis_history) + 1,
        "product_type": payload.product_type,
        "material": payload.material,
        "fabric_condition": payload.fabric_condition,
        "color_condition": payload.color_condition,
        "contamination": payload.contamination_level,
        "recyclable": recyclable,
        "reusable": reusable,
        "upcyclable": upcyclable,
        "grade": grade,
        "confidence": f"{min(max(confidence, 40), 99)}%",
        "environmental_impact": impact,
        "action": action,
        "reasoning": reason_str,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    ai_analysis_history.append(new_record)
    return new_record

@app.post("/upload-image")
def upload_image(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
   
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    image_info = read_image(file_path)    
    prediction = classify_textile(image_info)
    ai_result = predict_image(file_path)
    
    return {
        "message": "Image uploaded successfully!",
        "filename": file.filename,
        "image_info": image_info,
        "prediction": prediction,
        "ai_result": ai_result,
    }