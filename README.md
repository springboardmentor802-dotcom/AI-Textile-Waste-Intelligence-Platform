# AI Textile Waste Management System

## Project Overview

The AI Textile Waste Management System is a web-based application developed to manage textile waste efficiently using Artificial Intelligence. The system helps organizations register textile waste, manage inventory, classify textile materials, and support sustainable recycling practices.

This project is being developed using Django REST Framework for the backend and React (Vite) for the frontend.

## Technologies Used

### Frontend
- React.js
- Vite
- Axios
- React Router DOM
- Bootstrap (UI Framework)
- Recharts (data visualization)

### Backend
- Django
- Django REST Framework (DRF)
- Simple JWT Authentication
- CORS Headers
- ReportLab (PDF generation)
- PyTorch / OpenCV (AI engines)

### Database
- SQLite

## Project Structure

```
AI-TextileWaste/
│
├── backend/
│   ├── config/
│   ├── inventory/
│   ├── sustainability/
│   ├── db.sqlite3
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   └── App.jsx
    └── package.json
```

## Features Implemented

### Backend Configuration
- Django project setup
- Django REST Framework configuration
- SQLite database configuration
- CORS configuration
- JWT Authentication setup
- REST API development

### Frontend Configuration
- React + Vite setup
- React Router configuration
- Axios API integration
- Login page
- Registration page
- Dashboard page
- Sustainability Dashboard page

### User Authentication

**Completed Features**
- User Registration
- User Login
- JWT Authentication
- Protected APIs
- Token Generation
- Token Refresh
- Password Encryption

### Textile Inventory Management

**Implemented**
- TextileWaste Model
- Textile Inventory REST API
- Inventory Serializer
- Inventory ViewSet
- Dashboard Inventory Display
- SQLite Database Storage

**Current Fields**
- Material Type
- Quantity
- Color
- Source
- Date Added

## Database

**SQLite Database**

Reason for Choosing SQLite:
- Lightweight
- Easy configuration
- Built-in Django support
- No separate database server required
- Suitable for development and testing

## REST APIs

### Authentication APIs
- POST `/api/register/`
- POST `/api/token/`
- POST `/api/token/refresh/`

### Inventory APIs
- GET `/api/textiles/`
- POST `/api/textiles/`
- PUT `/api/textiles/{id}/`
- DELETE `/api/textiles/{id}/`

## Project Workflow

```
User Registration
        │
        ▼
User Login
        │
        ▼
JWT Authentication
        │
        ▼
Protected Dashboard
        │
        ▼
Textile Inventory API
        │
        ▼
SQLite Database
        │
        ▼
AI Analysis & Classification
        │
        ▼
Sustainability Intelligence Engine
        │
        ▼
Circular Economy Analytics Dashboard
```

---

## Milestone 1 Progress

**Completed**
- Project Initialization
- Frontend Setup
- Backend Setup
- Database Configuration
- REST API Development
- User Registration
- User Login
- JWT Authentication
- Textile Inventory Model
- Textile Inventory APIs
- Dashboard Integration

**In Progress**
- Role-Based Access Control
- Bootstrap UI Framework
- UI Wireframes
- Inventory Enhancement

**Pending**
- OAuth Login
- User Profile Management
- AI Image Analysis
- Material Classification
- Waste Classification
- Recommendation Engine
- Sustainability Analytics
- Reports
- Deployment

---

## Milestone 2 Progress

Milestone 2 focused on turning the Milestone 1 groundwork into a working AI-driven waste intelligence workflow — image-based material detection, waste categorization, recyclability scoring, batch processing, PDF reporting, and a fully functional inventory management dashboard with role-based controls.

**Completed**
- Role-Based Access Control (Recycling Facility Operator, Sustainability Manager, Textile Manufacturer Administrator)
- AI Image Analysis Engine
- Material Classification Engine
- Waste Categorization Engine
- Recyclability / Circularity Scoring Engine
- Single-Image "Predict" Workflow with Full AI Report
- Downloadable PDF Report (Single Image)
- Batch Image Analysis (Multiple Images at Once)
- Combined Batch PDF Report Generation
- Inventory Summary / Monitoring Dashboard (By Material, By Status)
- Register New Waste Batch Form (with auto-generated Batch ID)
- Textile Inventory Table View (filterable by material, status, source)
- Status Update per Batch (Registered → Collected → In Processing → Processed)
- Delete Waste Batch
- status field added to TextileWaste model + migration
- Updated Serializer, Views, and URLs to support new inventory workflow

**New / Updated Fields on TextileWaste**
- Material Type
- Quantity (kg)
- Color
- Source
- Condition (New Surplus, Lightly Used, Worn, Damaged, Contaminated)
- Status (Registered, Collected, In Processing, Processed)
- Collection Date
- Batch ID (auto-generated, e.g. WB-9CC3D5B1)
- Created By (linked to authenticated user)
- Date Added

**In Progress**
- OAuth Login
- User Profile Management
- Notification System

**Pending**
- Deployment
- Docker Containerization
- Advanced Reporting

### Milestone 2 — Results & Screenshots

**1. Single Image Analysis — AI Report**

An uploaded fabric image is classified by material type, with confidence score, texture assessment, contamination/brightness checks, and a circularity recommendation — all generated in one "Predict" action.

Example result:
- Detected Material: Acrylic
- Confidence: 99.37%
- Texture: Medium
- Contamination: Suspected
- Brightness: Normal
- Condition Used: Good

**2. Material Intelligence & Recyclability Assessment**

Based on the detected material and condition, the system generates a circularity recommendation along with a recyclability score and category.

Example result:
- Circularity Recommendation: Hazardous Textile Waste (contamination detected — requires special handling before further processing)
- Circularity Index: 51.25%
- Category: Moderate Recovery Potential

**3. Batch Analysis & Inventory Monitoring**

Multiple images can be analyzed together, producing a combined downloadable PDF report. The Inventory Monitoring panel summarizes total batches and quantity, broken down by material type and status.

Example result:
- Total Batches: 3
- Total Quantity: 120 kg
- By Material: Cotton — 100 kg (2), Wool — 20 kg (1)
- By Status: 100 kg (2), 20 kg (1)

**4. Register New Waste Batch & Textile Inventory Table**

Authorized roles can register new waste batches through a form, and view/manage all registered batches in a filterable inventory table with inline status updates and delete actions.

Example inventory entries:

| Batch ID | Material | Quantity | Color | Source | Condition | Collected | Status |
|---|---|---|---|---|---|---|---|
| WB-9CC3D5B1 | Wool | 20 kg | Red | Factory 1 | Damaged | 2026-01-23 | Registered |
| WB-3937F338 | Cotton | 50 kg | Green | Factory B | Worn | 2026-07-26 | Registered |

---

## Milestone 3 Progress

Milestone 3 focused on turning Milestone 2's per-batch AI classification into facility-wide sustainability intelligence — environmental impact quantification, rule-based recycling recommendations, and circular economy analytics with a live dashboard.

**Completed**
- Sustainability Intelligence Engine (CO₂ savings estimation, water savings estimation)
- Recycling Recommendation Engine (rule-based: Fabric Reuse/Donation, Mechanical Recycling, Chemical Recycling, Upcycling, Industrial Recovery)
- Environmental Impact Assessment per waste batch
- Circular Economy Analytics:
  - Material-wise CO₂/water breakdown
  - Monthly CO₂ trend analysis
  - Waste category breakdown (Recyclable, Reusable, Hazardous, etc.)
  - Material-level recovery rate (Processed vs. total quantity)
- Auto-calculation via Django signals — every waste batch automatically gets an `ImpactRecord` on save/update
- Link between Milestone 2's AI pipeline and the database — new `analyze-and-link/<batch_id>/` endpoint saves real material classification, circularity score, and waste category onto each batch
- Sustainability Dashboard (React + Recharts) — 4 live charts pulling real data
- Waste diversion rate calculation, validated against real batch status data
- `STATUS_CHOICES` alignment fix between frontend and backend (Registered, Collected, In Processing, Processed)

**New Backend Components**

`sustainability` Django app:
- `constants.py` — emission factor (kg CO₂/kg) and water savings (L/kg) reference tables per material type
- `services.py` — core calculation functions: `calculate_environmental_impact()`, `recommend_strategy()`
- `models.py` — `ImpactRecord` model (one-to-one with `TextileWaste`)
- `signals.py` — auto-creates/updates `ImpactRecord` on every `TextileWaste` save
- `views.py` — aggregation views: `sustainability_summary`, `sustainability_trends`, `category_breakdown`, `material_recovery`

**New / Updated Fields on TextileWaste**
- `detected_material` (from Milestone 2 AI classification)
- `circularity_score` (from Milestone 2 recyclability assessment)
- `waste_category` (from Milestone 2 waste categorization)

**New REST APIs**

Sustainability Analytics:
- GET `/api/sustainability/summary/`
- GET `/api/sustainability/trends/`
- GET `/api/sustainability/category-breakdown/`
- GET `/api/sustainability/material-recovery/`

AI-to-Inventory Link:
- POST `/api/analyze-and-link/{batch_id}/`

**Example Result — Sustainability Summary**

```json
{
  "total_co2_saved_kg": 213.5,
  "total_water_saved_liters": 164700.0,
  "average_circularity_score": 61.0,
  "total_batches": 4,
  "processed_batches": 1,
  "waste_diversion_rate_percent": 25.0
}
```

**Example Result — Material Recovery**

```json
{
  "material_recovery": [
    {
      "material": "Cotton",
      "total_quantity_kg": 150.0,
      "processed_quantity_kg": 50.0,
      "recovery_rate_percent": 33.33
    },
    {
      "material": "Wool",
      "total_quantity_kg": 20.0,
      "processed_quantity_kg": 0,
      "recovery_rate_percent": 0.0
    }
  ]
}
```

### Sustainability Dashboard

New React page at `/sustainability`, accessible directly from the main dashboard via a "View Sustainability Dashboard" link. Displays:

- **Metric cards**: Total CO₂ Saved, Total Water Saved, Avg. Circularity Score, Waste Diversion Rate, Total Batches, Processed Batches
- **Bar chart**: CO₂ & Water Saved by Material
- **Line chart**: CO₂ Saved Over Time
- **Pie chart**: Waste Category Breakdown
- **Bar chart**: Material Recovery Rate

### Known Limitation

The current Milestone 2 material classification model is trained on only two fiber classes (acrylic, polyamide), which causes most uploaded images to be classified similarly regardless of actual fabric type, and circularity scores to cluster around the "Moderate Recovery Potential" range. This is a Milestone 2 model scope limitation, not a Milestone 3 logic issue — the sustainability engine, recommendation engine, and analytics pipeline all function correctly on whatever classification input they receive. Expanding the training dataset to more fiber classes is a candidate future enhancement.

**In Progress**
- OAuth Login
- User Profile Management
- Notification System

**Pending**
- Deployment
- Docker Containerization
- Advanced Reporting
- Excel Export

---

## Installation

### Backend
```
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## Database

**SQLite**

Database File: `db.sqlite3`

## Authentication

**Authentication Method**: JWT (JSON Web Token)
- Access Token
- Refresh Token
- Protected APIs
- Bearer Authentication

## Future Enhancements

- OAuth Login
- User Profile Management
- Environmental Impact Analysis refinement (cited emission/water reference sources)
- Expanded material classification model (more than 2 fiber classes)
- Notification System
- Advanced Report Generation
- Excel Export
- Docker Deployment

---

**AI Textile Waste Management Project**