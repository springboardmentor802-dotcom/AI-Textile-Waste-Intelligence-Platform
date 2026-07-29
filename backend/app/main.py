import io
import json
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text

from .database import db_session, init_db, USING_POSTGRES
from . import auth
from .auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user, require_roles, ROLES,
)
from .schemas import (
    RegisterRequest, LoginRequest, RefreshRequest, InventoryCreate, InventoryUpdate,
    UpdateProfileRequest, ChangePasswordRequest, NotificationPreferences,
)
from . import cv_analysis
from .material_classifier import classify_material
from . import scoring
from . import mongo

app = FastAPI(title="Textile Waste Intelligence Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "database": "postgresql" if USING_POSTGRES else "sqlite (fallback)"}


# ================================================================= AUTH ====
@app.post("/api/auth/register", response_model=None)
def register(payload: RegisterRequest):
    if payload.role not in ROLES:
        raise HTTPException(400, f"Role must be one of {ROLES}")
    with db_session() as conn:
        existing = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": payload.email}).first()
        if existing:
            raise HTTPException(400, "Email already registered")
        conn.execute(
            text("INSERT INTO users (full_name, email, hashed_password, role) VALUES (:n,:e,:p,:r)"),
            {"n": payload.full_name, "e": payload.email, "p": hash_password(payload.password), "r": payload.role},
        )
    return {"message": "Registered successfully. Please log in."}


@app.post("/api/auth/login")
def login(payload: LoginRequest):
    with db_session() as conn:
        row = conn.execute(
            text("SELECT id, full_name, hashed_password, role FROM users WHERE email=:e"),
            {"e": payload.email},
        ).mappings().first()
    if not row or not verify_password(payload.password, row["hashed_password"]):
        raise HTTPException(401, "Invalid email or password")

    access = create_access_token(row["id"], row["role"])
    refresh = create_refresh_token(row["id"])
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer",
            "role": row["role"], "full_name": row["full_name"]}


# OAuth2-compatible login (so a standard OAuth2PasswordRequestForm / Swagger "Authorize" button also works)
@app.post("/api/auth/token")
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends()):
    return login(LoginRequest(email=form_data.username, password=form_data.password))


@app.post("/api/auth/refresh")
def refresh_token(payload: RefreshRequest):
    data = decode_token(payload.refresh_token)
    if data.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")
    with db_session() as conn:
        row = conn.execute(
            text("SELECT id, role FROM users WHERE id=:id"), {"id": int(data["sub"])}
        ).mappings().first()
    if not row:
        raise HTTPException(401, "User not found")
    return {"access_token": create_access_token(row["id"], row["role"]), "token_type": "bearer"}


@app.post("/api/auth/logout")
def logout(payload: RefreshRequest, user=Depends(get_current_user)):
    with db_session() as conn:
        conn.execute(text("UPDATE refresh_tokens SET revoked=1 WHERE token=:t"), {"t": payload.refresh_token})
    return {"message": "Logged out"}


@app.get("/api/auth/profile")
def profile(user=Depends(get_current_user)):
    return user


@app.put("/api/auth/profile")
def update_profile(payload: UpdateProfileRequest, user=Depends(get_current_user)):
    fields = {k: v for k, v in payload.dict().items() if v is not None}
    if not fields:
        return {"message": "Nothing to update"}
    if "email" in fields:
        with db_session() as conn:
            clash = conn.execute(
                text("SELECT id FROM users WHERE email=:e AND id != :id"),
                {"e": fields["email"], "id": user["id"]},
            ).first()
        if clash:
            raise HTTPException(400, "Email already in use")
    set_clause = ", ".join([f"{k}=:{k}" for k in fields])
    with db_session() as conn:
        conn.execute(text(f"UPDATE users SET {set_clause} WHERE id=:id"), {**fields, "id": user["id"]})
    return {"message": "Profile updated"}


@app.post("/api/auth/change-password")
def change_password(payload: ChangePasswordRequest, user=Depends(get_current_user)):
    with db_session() as conn:
        row = conn.execute(
            text("SELECT hashed_password FROM users WHERE id=:id"), {"id": user["id"]}
        ).mappings().first()
        if not verify_password(payload.current_password, row["hashed_password"]):
            raise HTTPException(400, "Current password is incorrect")
        conn.execute(
            text("UPDATE users SET hashed_password=:p WHERE id=:id"),
            {"p": hash_password(payload.new_password), "id": user["id"]},
        )
    return {"message": "Password changed successfully"}


DEFAULT_SETTINGS = {
    "waste_collection_alerts": True,
    "recycling_opportunity_notifications": True,
    "sustainability_milestone_alerts": True,
    "inventory_warnings": True,
    "platform_announcements": True,
}


@app.get("/api/settings")
def get_settings(user=Depends(get_current_user)):
    with db_session() as conn:
        row = conn.execute(
            text("SELECT * FROM user_settings WHERE user_id=:id"), {"id": user["id"]}
        ).mappings().first()
    if not row:
        return DEFAULT_SETTINGS
    return {k: bool(v) for k, v in dict(row).items() if k != "user_id"}


@app.put("/api/settings")
def update_settings(payload: NotificationPreferences, user=Depends(get_current_user)):
    with db_session() as conn:
        existing = conn.execute(text("SELECT user_id FROM user_settings WHERE user_id=:id"), {"id": user["id"]}).first()
        data = payload.dict()
        if existing:
            set_clause = ", ".join([f"{k}=:{k}" for k in data])
            conn.execute(text(f"UPDATE user_settings SET {set_clause} WHERE user_id=:id"), {**data, "id": user["id"]})
        else:
            cols = ", ".join(["user_id"] + list(data.keys()))
            vals = ", ".join([":user_id"] + [f":{k}" for k in data])
            conn.execute(text(f"INSERT INTO user_settings ({cols}) VALUES ({vals})"), {**data, "user_id": user["id"]})
    return {"message": "Settings saved"}


# ============================================================ INVENTORY ====
@app.get("/api/inventory")
def list_inventory(search: str = "", user=Depends(get_current_user)):
    with db_session() as conn:
        if search:
            rows = conn.execute(
                text("SELECT * FROM inventory WHERE batch_id ILIKE :s OR fabric_type ILIKE :s ORDER BY id DESC"
                     if USING_POSTGRES else
                     "SELECT * FROM inventory WHERE batch_id LIKE :s OR fabric_type LIKE :s ORDER BY id DESC"),
                {"s": f"%{search}%"},
            ).mappings().all()
        else:
            rows = conn.execute(text("SELECT * FROM inventory ORDER BY id DESC")).mappings().all()
    return [dict(r) for r in rows]


@app.post("/api/inventory")
def create_inventory(payload: InventoryCreate,
                      user=Depends(require_roles("admin", "manufacturer", "recycling_operator"))):
    with db_session() as conn:
        existing = conn.execute(text("SELECT id FROM inventory WHERE batch_id=:b"), {"b": payload.batch_id}).first()
        if existing:
            raise HTTPException(400, "Batch ID already exists")
        conn.execute(
            text("""INSERT INTO inventory (batch_id, fabric_type, source, quantity, color, condition,
                    collection_date, created_by) VALUES (:batch_id,:fabric_type,:source,:quantity,:color,
                    :condition,:collection_date,:created_by)"""),
            {**payload.dict(), "created_by": user["id"]},
        )
    return {"message": "Inventory record created"}


@app.put("/api/inventory/{item_id}")
def update_inventory(item_id: int, payload: InventoryUpdate,
                      user=Depends(require_roles("admin", "manufacturer", "recycling_operator"))):
    fields = {k: v for k, v in payload.dict().items() if v is not None}
    if not fields:
        return {"message": "Nothing to update"}
    set_clause = ", ".join([f"{k}=:{k}" for k in fields])
    with db_session() as conn:
        conn.execute(text(f"UPDATE inventory SET {set_clause} WHERE id=:id"), {**fields, "id": item_id})
    return {"message": "Updated"}


@app.delete("/api/inventory/{item_id}")
def delete_inventory(item_id: int, user=Depends(require_roles("admin", "recycling_operator"))):
    with db_session() as conn:
        conn.execute(text("DELETE FROM inventory WHERE id=:id"), {"id": item_id})
    return {"message": "Deleted"}


# ================================================================ ANALYZE ====
@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    start = datetime.utcnow()
    image_bytes = await file.read()
    try:
        img = cv_analysis.load_image(image_bytes)
    except ValueError as e:
        raise HTTPException(400, str(e))

    h, w = img.shape[:2]

    color_result = cv_analysis.analyze_color(img)
    texture_result = cv_analysis.analyze_texture(img)
    damage_result = cv_analysis.analyze_damage(img)
    contamination_result = cv_analysis.analyze_contamination(img)
    material_result = classify_material(img, color_result, texture_result)

    scores = scoring.compute_scores(material_result, texture_result, damage_result, contamination_result)
    waste_result = scoring.classify_waste(material_result, damage_result, contamination_result, scores)
    recycling_result = scoring.recommend_recycling(material_result, waste_result, scores)
    sustainability_result = scoring.sustainability_assessment(material_result, scores)
    environmental_result = scoring.environmental_impact(sustainability_result, scores)

    processing_time_ms = round((datetime.utcnow() - start).total_seconds() * 1000, 1)

    result = {
        "filename": file.filename,
        "image_info": {"width": w, "height": h, "size_bytes": len(image_bytes),
                        "processing_time_ms": processing_time_ms},
        "material_classification": material_result,
        "texture_analysis": texture_result,
        "color_analysis": color_result,
        "damage_detection": damage_result,
        "contamination_detection": contamination_result,
        "waste_classification": waste_result,
        "recycling_recommendation": recycling_result,
        "sustainability_assessment": sustainability_result,
        "environmental_impact": environmental_result,
        "scores": scores,
    }

    mongo_doc_id = mongo.save_analysis_document(result)
    result["mongo_doc_id"] = mongo_doc_id

    with db_session() as conn:
        conn.execute(
            text("""INSERT INTO analyses (filename, material, confidence, fiber_composition, recyclability,
                    circularity_score, waste_category, recommendation, mongo_doc_id, created_by)
                    VALUES (:filename,:material,:confidence,:fiber,:recyclability,:circ,:waste,:rec,:mongo_id,:uid)"""),
            {
                "filename": file.filename,
                "material": material_result["material"],
                "confidence": material_result["confidence"],
                "fiber": material_result["fiber_composition"],
                "recyclability": material_result["recyclability"],
                "circ": scores["circularity_score"],
                "waste": waste_result["waste_category"],
                "rec": recycling_result["best_recommendation"],
                "mongo_id": mongo_doc_id,
                "uid": user["id"],
            },
        )

    return result


@app.get("/api/history")
def history(user=Depends(get_current_user)):
    with db_session() as conn:
        rows = conn.execute(text("SELECT * FROM analyses ORDER BY id DESC LIMIT 200")).mappings().all()
    return [dict(r) for r in rows]


# ================================================================ REPORTS ====
@app.get("/api/reports")
def list_reports(material: str = "", waste_category: str = "", user=Depends(get_current_user)):
    query = "SELECT * FROM analyses WHERE 1=1"
    params = {}
    if material:
        query += " AND material = :material"
        params["material"] = material
    if waste_category:
        query += " AND waste_category = :waste_category"
        params["waste_category"] = waste_category
    query += " ORDER BY id DESC LIMIT 500"
    with db_session() as conn:
        rows = conn.execute(text(query), params).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/reports/summary")
def reports_summary(user=Depends(get_current_user)):
    with db_session() as conn:
        total = conn.execute(text("SELECT COUNT(*) c FROM analyses")).mappings().first()["c"]
        avg_circ = conn.execute(text("SELECT AVG(circularity_score) a FROM analyses")).mappings().first()["a"] or 0
        by_waste = conn.execute(text("SELECT waste_category, COUNT(*) c FROM analyses GROUP BY waste_category")).mappings().all()
        by_material = conn.execute(text("SELECT material, COUNT(*) c FROM analyses GROUP BY material")).mappings().all()
    return {
        "total_reports": total,
        "average_circularity_score": round(avg_circ, 1),
        "by_waste_category": [dict(r) for r in by_waste],
        "by_material": [dict(r) for r in by_material],
    }


@app.get("/api/reports/export/csv")
def export_reports_csv(user=Depends(get_current_user)):
    import csv

    with db_session() as conn:
        rows = conn.execute(text("SELECT * FROM analyses ORDER BY id DESC")).mappings().all()

    buf = io.StringIO()
    if rows:
        writer = csv.DictWriter(buf, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for r in rows:
            writer.writerow(dict(r))
    else:
        buf.write("No analysis records yet.\n")

    byte_buf = io.BytesIO(buf.getvalue().encode("utf-8"))
    return StreamingResponse(byte_buf, media_type="text/csv",
                              headers={"Content-Disposition": "attachment; filename=textile_waste_report.csv"})


# =============================================================== DASHBOARD ====
@app.get("/api/dashboard/summary")
def dashboard_summary(user=Depends(get_current_user)):
    with db_session() as conn:
        total_uploads = conn.execute(text("SELECT COUNT(*) c FROM analyses")).mappings().first()["c"]
        total_inventory = conn.execute(text("SELECT COUNT(*) c FROM inventory")).mappings().first()["c"]
        avg_circularity = conn.execute(text("SELECT AVG(circularity_score) a FROM analyses")).mappings().first()["a"] or 0
        materials = conn.execute(text("SELECT material, COUNT(*) c FROM analyses GROUP BY material")).mappings().all()
        fabric_dist = conn.execute(text("SELECT fabric_type, SUM(quantity) q FROM inventory GROUP BY fabric_type")).mappings().all()

    return {
        "total_uploads": total_uploads,
        "materials_classified": total_uploads,
        "inventory_records": total_inventory,
        "recycling_score": round(avg_circularity, 1),
        "carbon_saving_estimate_kg": round(avg_circularity * total_uploads * 0.04, 1) if total_uploads else 0,
        "waste_diversion_pct": round(min(98, avg_circularity + 8), 1) if avg_circularity else 0,
        "circularity_score": round(avg_circularity, 1),
        "recovery_rate_pct": round(avg_circularity, 1),
        "material_distribution": [dict(m) for m in materials],
        "fabric_type_distribution": [dict(f) for f in fabric_dist],
    }


# ================================================================== REPORT ====
@app.get("/api/report/{analysis_id}/pdf")
def download_report(analysis_id: int, user=Depends(get_current_user)):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    with db_session() as conn:
        row = conn.execute(text("SELECT * FROM analyses WHERE id=:id"), {"id": analysis_id}).mappings().first()
    if not row:
        raise HTTPException(404, "Analysis not found")

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 60

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Textile Waste Intelligence Platform - Analysis Report")
    y -= 30
    c.setFont("Helvetica", 11)
    for label, value in [
        ("File", row["filename"]),
        ("Material", row["material"]),
        ("Confidence", f"{row['confidence']}%"),
        ("Fiber Composition", row["fiber_composition"]),
        ("Recyclability", row["recyclability"]),
        ("Circularity Score", f"{row['circularity_score']}/100"),
        ("Waste Category", row["waste_category"]),
        ("Recommendation", row["recommendation"]),
        ("Generated", str(row["created_at"])),
    ]:
        c.drawString(50, y, f"{label}: {value}")
        y -= 22

    c.showPage()
    c.save()
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf",
                              headers={"Content-Disposition": f"attachment; filename=analysis_{analysis_id}.pdf"})
