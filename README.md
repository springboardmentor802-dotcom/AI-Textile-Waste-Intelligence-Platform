# Textile Waste Intelligence Platform

An AI-powered platform for analyzing textile waste through computer vision — classifying material type, assessing damage and contamination, recommending recycling strategies, and scoring each item's circularity potential. Built across Milestones 1–3 of the Infosys Springboard ML internship.

---

## 1. Architecture Overview

This project is structured as a monorepo:

* **`/backend`**: Python + FastAPI REST API.
  * **Database**: SQLAlchemy ORM against PostgreSQL, with automatic fallback to local SQLite if Postgres is unreachable — no manual setup required to run locally.
  * **Secondary store**: MongoDB for raw analysis JSON documents (optional; the app degrades gracefully if MongoDB isn't running).
  * **Security**: JWT authentication with OAuth2 password flow, bcrypt password hashing.
  * **Computer Vision**: OpenCV, Pillow, and scikit-image for color, texture, damage, and contamination analysis.
  * **Material Classification**: XGBoost model (trainable via `scripts/train_material_classifier.py`) with a deterministic rule-based fallback classifier that requires zero training and is always available.
  * **PDF Reports**: Generated with `reportlab`, both single-image and combined multi-image reports.
* **`/frontend`**: React + Vite + Tailwind CSS SPA.
  * Dark theme with a green sustainability-focused design.
  * Pages: Dashboard, Inventory, Upload Waste (AI Prediction), History, Reports, Sustainability, Profile, Settings.

---

## 2. Quick Setup & Run Instructions

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The backend will attempt to connect to PostgreSQL first; if unavailable, it automatically falls back to a local SQLite database (`textile_waste_fallback.db`) so the app runs out of the box with no database setup required.

Optional — start Postgres + MongoDB via Docker Compose if you want the primary/secondary datastores instead of the SQLite fallback:
```bash
docker compose up -d
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

* **Frontend**: `http://localhost:5173`
* **Backend API docs (Swagger)**: `http://localhost:8000/docs`

### Demo Login
Register a new account from the frontend, or use:
* Email: `admin@textilewaste.ai`
* Password: `Admin@123`

---

## 3. Core Analysis Pipeline

Every uploaded image runs through a 12-stage pipeline:

1. Image Preview
2. Material Classification
3. Texture Analysis
4. Color Analysis
5. Damage Detection
6. Contamination Detection
7. Waste Classification
8. Recycling Recommendation
9. Sustainability Assessment
10. Environmental Impact
11. Circularity Score
12. Overall Report

Images can be analyzed one at a time or in a batch of up to 5 at once, each receiving its own full report, switchable via tabs on the Upload Waste page.

---

## 4. Feature Modules

### Waste Classification Engine
Predicts waste category, assesses recyclability, detects contamination, estimates reuse potential, and recommends disposal method.

**Categories**: Recyclable · Reusable · Repairable · Upcyclable · Compostable · Hazardous

### Recycling Recommendation Engine
Recommends a recycling strategy, detects reuse opportunities, suggests upcycling paths, and proposes waste reduction strategies tiered by circularity score.

**Recycling Options**: Fiber Recycling · Mechanical Recycling · Chemical Recycling · Fabric Reuse · Upcycling · Donation · Industrial Recovery

### Sustainability Intelligence Engine
Estimates carbon footprint and water savings, analyzes waste diversion and circular economy metrics, and benchmarks the user's average circularity score against an industry average and best-in-class reference.

### Environmental Impact Assessment Engine
Estimates CO₂ savings, water savings, landfill reduction percentage, and produces an overall environmental rating.

### Waste Scoring Engine
Combines five weighted factors into a single Circularity Score (0–100):

```
Circularity Score =
  Material Recyclability (35%)
+ Material Condition      (20%)
+ Reuse Potential          (20%)
+ Environmental Benefit    (15%)
+ Processing Feasibility   (10%)
```

**Circularity Categories**: Excellent Recovery Potential · High Recovery Potential · Moderate Recovery Potential · Limited Recovery Potential · Disposal Recommended

---

## 5. Key API Endpoints

### Auth (`/api/auth`)
* `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/token`, `POST /api/auth/refresh`, `POST /api/auth/logout`
* `GET /api/auth/profile`, `PUT /api/auth/profile`, `POST /api/auth/change-password`

### Analysis
* `POST /api/analyze`: Analyze a single image through the full pipeline.
* `POST /api/analyze-batch`: Analyze up to 5 images at once, each returning its own full report.

### Inventory
* `GET /api/inventory`, `POST /api/inventory`, `PUT /api/inventory/{item_id}`, `DELETE /api/inventory/{item_id}`

### History & Reports
* `GET /api/history`
* `GET /api/reports`, `GET /api/reports/summary`, `GET /api/reports/export/csv`
* `GET /api/report/{analysis_id}/pdf`: Single-image PDF report.
* `GET /api/report/batch/pdf?ids=1,2,3`: Combined multi-page PDF for several analyses at once.

### Sustainability
* `GET /api/sustainability/summary`: Aggregated carbon/water savings, trend data, and distribution charts.
* `GET /api/sustainability/benchmark`: User's average circularity score vs. industry benchmark and best-in-class reference.

### Settings
* `GET /api/settings`, `PUT /api/settings`

---

## 6. Local Testing

```bash
cd backend
source venv/bin/activate
python -c "import ast; ast.parse(open('app/main.py').read())"
```

---

## 7. Roadmap

* Train the material classifier on a properly labeled dataset (single-fiber material-type labels, not defect-detection labels) to replace/augment the rule-based fallback with higher-accuracy predictions.
* Extend batch upload beyond 5 images if needed.

## Recent Updates (Milestone 3 continued)

- Fixed material classifier bug where Cotton was being misidentified as Polyester due to overlapping rule thresholds in the fallback classifier
- Added Inventory Edit functionality (previously only Add and Delete were available)
- Fixed CSV export authentication bug — Export All now correctly downloads instead of showing "Not authenticated"
- Built a full Notification & Alert System:
  - Recycling opportunity alerts (triggered when an item scores 75+ circularity)
  - Inventory warnings (triggered when a Hazardous item is detected)
  - Sustainability milestone alerts (triggered at 10, 25, 50, 100, 250, 500 total items analyzed)
  - Waste collection alerts (triggered when a new inventory batch is registered)
  - All alerts respect per-user notification preferences set in Settings
  - Notification bell icon in the sidebar with live unread count, mark-as-read, mark-all-read, and delete
