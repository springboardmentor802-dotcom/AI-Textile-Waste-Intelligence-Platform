AI-Textile Waste Intelligence Platform
# AI Textile Waste Management System

## Project Overview

The AI Textile Waste Management System is a web-based application developed to manage textile waste efficiently using Artificial Intelligence. The system helps organizations register textile waste, manage inventory, classify textile materials, assess recyclability, quantify environmental impact, and support sustainable recycling practices.

This project is being developed using Django REST Framework for the backend and React (Vite) for the frontend.

---

# Technologies Used

## Frontend
- React.js
- Vite
- Axios
- React Router DOM
- Recharts (data visualization)
- Bootstrap (UI Framework)

## Backend
- Django
- Django REST Framework (DRF)
- Simple JWT Authentication
- CORS Headers

## AI / Machine Learning
- PyTorch (CNN for fiber/material classification)
- OpenCV (image analysis, texture and contamination detection)
- Pillow (image handling)

## Reports & Export
- ReportLab (PDF report generation)
- openpyxl (Excel report generation)

## Database
- SQLite

## Testing & Deployment
- Django's built-in test framework (unittest-based)
- Docker & Docker Compose

---

# Project Structure

```
AI-TextileWaste/
│
├── backend/
│   ├── config/
│   ├── inventory/
│   │   ├── services/
│   │   │   ├── image_analysis_service.py
│   │   │   ├── material_classification_service.py
│   │   │   ├── waste_categorization_service.py
│   │   │   ├── recyclability_scoring_service.py
│   │   │   ├── pdf_report_service.py
│   │   │   ├── excel_report_service.py
│   │   │   └── fabric_model.pth
│   │   ├── signals.py
│   │   ├── permissions.py
│   │   └── tests.py
│   ├── sustainability/
│   │   ├── services.py
│   │   ├── signals.py
│   │   ├── models.py
│   │   └── tests.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── db.sqlite3
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SustainabilityDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
└── docs/
    └── QA_Test_Sheet_Milestone4.xlsx
```

---

# Features Implemented

## Backend Configuration
- Django project setup
- Django REST Framework configuration
- SQLite database configuration
- CORS configuration
- JWT Authentication setup
- REST API development

## Frontend Configuration
- React + Vite setup
- React Router configuration
- Axios API integration
- Login page
- Registration page
- Dashboard page
- Sustainability Dashboard page
- Image upload and prediction UI
- Batch image upload UI
- Downloadable PDF and Excel report buttons
- In-app notification bell with unread count

---

## User Authentication

Completed Features
- User Registration
- User Login
- JWT Authentication
- Protected APIs
- Token Generation
- Token Refresh
- Password Encryption
- Role-based access control (Recycling Facility Operator, Sustainability Manager, Textile Manufacturer Administrator)

---

## Textile Inventory Management

Implemented
- TextileWaste Model
- Textile Inventory REST API
- Inventory Serializer
- Inventory ViewSet
- Dashboard Inventory Display
- SQLite Database Storage
- Filtering by material, source, status, and condition

Current Fields
- Batch ID
- Material Type
- Quantity
- Color
- Source
- Condition
- Status
- Detected Material (AI-populated)
- Circularity Score (AI-populated)
- Waste Category (AI-populated)
- Collection Date
- Date Added

---

## AI Textile Image Analysis Engine

Implemented
- Image upload and processing pipeline
- Basic image info extraction (dimensions, channels)
- Color analysis (average RGB values)
- Brightness analysis (dark / normal / bright classification)
- Texture analysis using Canny edge detection
- Contamination / damage detection heuristic

---

## Material Classification Engine

Implemented
- Custom PyTorch CNN (3 convolutional layers + fully connected layers)
- Trained on the Annotated Textile Fabric Image Dataset (fiber composition metadata: cotton, polyester, polyamide, elastane, acrylic percentages)
- Dominant fiber label derived from fiber percentage columns
- Train/test split performed on available fabric samples
- **84.94% test accuracy** on held-out images
- Trained model (`fabric_model.pth`) integrated into the Django backend for live prediction via API

---

## Textile Waste Classification Engine

Implemented
- Rule-based waste categorization logic
- Classifies items into 6 categories:
  - Recyclable
  - Reusable
  - Repairable
  - Upcyclable
  - Compostable
  - Hazardous Textile Waste
- Considers fabric type, condition, and contamination status
- Returns a human-readable reason alongside each classification

---

## Recyclability Assessment Engine

Implemented
- Weighted Circularity Score formula:
  - Material Recyclability — 35%
  - Material Condition — 20%
  - Reuse Potential — 20%
  - Environmental Benefit — 15%
  - Processing Feasibility — 10%
- Maps final score to a Circularity Category:
  - Excellent / High / Moderate / Limited Recovery Potential
  - Disposal Recommended

---

## Combined Waste Classification Report

Implemented
- Single endpoint chaining all four engines together (image analysis → material classification → waste categorization → recyclability scoring)
- JSON report output
- Downloadable, formatted PDF report output
- Downloadable Excel report output
- **Batch analysis**: upload multiple images at once and receive one combined, shareable PDF (summary table + detailed page per item)

---

## Sustainability Intelligence Engine

Implemented
- Carbon footprint (CO₂) savings estimation per batch and in aggregate
- Water savings estimation
- Waste diversion rate calculation (based on processed vs. registered batches)
- Circular economy analytics (average circularity score across inventory)
- Sustainability Dashboard with live metric cards, trend charts, and category breakdowns

## Recommendation Engine

Implemented
- Recycling/reuse strategy recommendations derived from waste category and recyclability score
- Material recovery suggestions per fabric type

## Environmental Impact Assessment Engine

Implemented
- CO₂ savings estimation by material type and over time
- Water savings estimation
- Landfill/waste diversion analysis
- Monthly sustainability trend tracking (`/api/sustainability/trends/`)

---

## Notification & Alert System

Implemented
- `Notification` model with type, message, related batch, read status, and timestamp
- Automatic notification creation via Django signals when:
  - A new waste batch is registered
  - A batch is marked as Processed
  - A batch achieves a high circularity score
  - A batch is flagged as Hazardous Textile Waste
- REST API endpoints:
  - List notifications for the logged-in user
  - Mark a notification as read
  - Get unread notification count
- Frontend notification bell with dropdown, unread badge, and mark-as-read interaction

---

## Reports & Export System

Implemented
- Waste classification report — JSON
- Waste classification report — downloadable PDF
- Waste classification report — downloadable Excel
- Batch analysis — combined PDF across multiple images
- Full inventory export — Excel
- Sustainability report — downloadable Excel

---

## Testing & QA

Implemented
- 29 automated tests (Django test framework), covering:
  - Authentication and registration
  - Inventory CRUD and filtering
  - Image analysis, material classification, waste categorization, and recyclability assessment endpoints
  - Combined report generation (JSON, PDF)
  - Batch analysis
  - Notification endpoints
  - Permission/authorization checks
- File upload validation (image type and size limits) added after QA bug review:
  - **TC_IMG_002** — invalid file type previously caused an unhandled server error; now returns a clean 400 validation error
  - **TC_IMG_003** — oversized file previously caused an unhandled server error; now returns a clean 400 validation error with a 10MB limit
- Full QA Test Sheet documented as a submitted deliverable: `docs/QA_Test_Sheet_Milestone4.xlsx`

---

## Deployment

Implemented
- `Dockerfile` for the Django backend
- `Dockerfile` for the React frontend
- Local Docker build confirmed working end-to-end

Not yet completed
- Production deployment to a cloud platform (AWS / Azure)
- Migration from SQLite to PostgreSQL for production use

---

## Database

SQLite Database

Reason for Choosing SQLite
- Lightweight
- Easy configuration
- Built-in Django support
- No separate database server required
- Suitable for development and testing

---

# REST APIs

## Authentication APIs
POST `/api/register/`
POST `/api/token/`
POST `/api/token/refresh/`
GET `/api/me/`

## Inventory APIs
GET `/api/textiles/`
POST `/api/textiles/`
PUT `/api/textiles/{id}/`
PATCH `/api/textiles/{id}/`
DELETE `/api/textiles/{id}/`
GET `/api/inventory-summary/`
GET `/api/inventory-export-excel/`

## AI / Textile Intelligence APIs
POST `/api/analyze-image/`
POST `/api/classify-material/`
POST `/api/categorize-waste/`
POST `/api/assess-recyclability/`
POST `/api/waste-report/`
POST `/api/waste-report-pdf/`
POST `/api/waste-report-excel/`
POST `/api/batch-waste-report-pdf/`
POST `/api/analyze-and-link/{batch_id}/`

## Sustainability APIs
GET `/api/sustainability/summary/`
GET `/api/sustainability/trends/`
GET `/api/sustainability/category-breakdown/`
GET `/api/sustainability/material-recovery/`
GET `/api/sustainability/export-excel/`

## Notification APIs
GET `/api/notifications/`
PATCH `/api/notifications/{id}/`
GET `/api/notifications/unread-count/`

---

# Project Workflow

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
Textile Inventory API ──► SQLite Database
        │
        ▼
Image Upload
        │
        ▼
Image Analysis Engine (OpenCV)
        │
        ▼
Material Classification Engine (PyTorch CNN)
        │
        ▼
Waste Categorization Engine (rule-based)
        │
        ▼
Recyclability Assessment Engine (weighted scoring)
        │
        ▼
Combined Report (JSON / PDF / Excel / Batch PDF)
        │
        ▼
Sustainability Engine (CO₂, water, circularity trends)
        │
        ▼
Notification Alerts + Sustainability Dashboard
```

---

# Milestone Progress

## Milestone 1 — Completed
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

## Milestone 2 — Completed
- Textile Image Analysis Engine (color, brightness, texture, contamination)
- Material Classification Engine (PyTorch CNN, 84.94% test accuracy)
- Waste Categorization Engine (6-category rule-based classification)
- Recyclability Assessment Engine (weighted circularity scoring)
- Combined Waste Classification Report (JSON + PDF)
- Batch Analysis (multiple images → one combined PDF report)

## Milestone 3 — Completed
- Sustainability Intelligence Engine (CO₂, water, circular economy analytics)
- Recycling Recommendation Engine
- Environmental Impact Assessment Engine
- Sustainability Dashboard with live metric cards and trend charts
- Aggregation/Summary API

## Milestone 4 — Completed
- Automated testing — 29 tests passing
- QA bugs found (TC_IMG_002, TC_IMG_003) → fixed → retested → confirmed via automated regression tests
- QA Test Sheet documented (`docs/QA_Test_Sheet_Milestone4.xlsx`)
- Excel export — waste reports, full inventory, and sustainability reports
- Notification & Alert System — backend (model, signals, API) and frontend (bell UI, unread count, mark-as-read)
- Docker containerization — backend and frontend Dockerfiles, local build confirmed

### Milestone 4 — Remaining / Not Yet Completed
- Production deployment to a cloud platform (AWS / Azure) — currently local Docker build only
- Migration from SQLite to PostgreSQL for production
- OAuth2 login (JWT username/password login is implemented; OAuth2 is not)
- Fully separate role-specific dashboards for all four roles (Recycling Facility Operator, Sustainability Manager, Textile Manufacturer, Administrator) — currently one main Dashboard and one Sustainability Dashboard shared across applicable roles
- Dedicated security and performance testing phase

---

# Installation

## Backend

```bash
cd backend

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py runserver
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

## Docker (backend + frontend)

```bash
docker-compose up --build
```

---

# Database

SQLite

Database File
```
db.sqlite3
```

---

# Authentication

Authentication Method
JWT (JSON Web Token)

Access Token
Refresh Token

Protected APIs
Bearer Authentication

---

# Testing

Run the full automated test suite:

```bash
cd backend
python manage.py test
```

Expected result: **29 tests passing.**

---

# Future Enhancements

- OAuth2 Login
- User Profile Management (self-service editing)
- Full role-specific dashboards for all four user roles
- PostgreSQL migration for production
- Cloud deployment (AWS / Azure)
- MongoDB as a secondary database for unstructured/analytics data
- Expanded material classification training dataset (more fiber types)
- Security and performance testing phase
- CI/CD via GitHub Actions

---

AI Textile Waste Management Project
