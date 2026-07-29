# 🧵 Textile Waste Intelligence Platform

AI-powered textile waste analysis: material classification, texture/color/
damage/contamination detection, recycling recommendations, and sustainability
scoring. FastAPI + PostgreSQL + MongoDB backend, React + Tailwind frontend.

## Quick start (fastest path to a working demo)

**Terminal 1 — databases**
```bash
docker compose up -d
```
(Skip this if Docker isn't set up — the backend auto-falls-back to local SQLite.)

**Terminal 2 — backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/train_material_classifier.py /path/to/ten-fabrics-dataset   # optional but recommended
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 — frontend**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, log in with:
- Email: `admin@textilewaste.ai`
- Password: `Admin@123`

API docs: **http://localhost:8000/docs**

## What's implemented

**Milestone 1**
- JWT auth (access + refresh tokens), OAuth2-compatible login endpoint, 4 roles
  (Admin, Manufacturer, Sustainability Manager, Recycling Operator), profile, logout
- Full textile inventory: batch registration, search, update, delete, dashboard stats

**Milestone 2**
- Image upload → color analysis (dominant color, brightness, saturation, uniformity)
- Texture analysis (GLCM: smoothness, homogeneity, energy, edge density, pattern regularity)
- Damage detection (tear/hole severity, repairability, recovery potential)
- Contamination detection (oil, dust, chemical/discoloration indicators)
- Material classification (10 classes) — trained XGBoost model on your TFD dataset,
  with an automatic rule-based fallback if the model hasn't been trained yet
- Waste classification (Reusable/Repairable/Recyclable/Upcyclable/Hazardous/Compostable)
- Recycling recommendation engine (best + alternative method, priority, expected recovery)
- Sustainability assessment + environmental impact (CO₂, water, landfill diversion)
- Weighted circularity score (35/20/20/15/10 exactly as specified) with category rating
- PDF report export
- Full-order results display: Image → Material → Texture → Color → Damage →
  Contamination → Waste Classification → Recycling → Sustainability →
  Environmental Impact → Circularity Score → Overall Report
- Redesigned dashboard: dark theme, green sustainability accents, glassmorphism
  cards, progress bars, circular progress, charts

## Known shortcuts taken for the 1-hour deadline (fix later, not blockers today)
- Material classifier trains on hand-crafted color+texture features + XGBoost,
  not a deep CNN/ViT/YOLOv8 — those need real training time/GPU you don't have
  right now. The interface in `app/material_classifier.py` is ready to swap in
  a PyTorch/TensorFlow model later without touching any other file.
- MongoDB only stores the raw per-image analysis JSON (a real use of a
  secondary/document DB per your stack) — everything queryable (users,
  inventory, summarized analysis) lives in PostgreSQL.
- No Docker image for the app itself yet, only for Postgres/Mongo — add a
  Dockerfile per service after today if you want full `docker compose up`
  for the whole stack.
