# AI Textile Waste Management System

## Project Overview

The AI Textile Waste Management System is a web-based application developed to manage textile waste efficiently using Artificial Intelligence. The system helps organizations register textile waste, manage inventory, classify textile materials, and support sustainable recycling practices.

This project is being developed using Django REST Framework for the backend and React (Vite) for the frontend.

---

# Technologies Used

## Frontend
- React.js
- Vite
- Axios
- React Router DOM
- Bootstrap (UI Framework)

## Backend
- Django
- Django REST Framework (DRF)
- Simple JWT Authentication
- CORS Headers

## Database
- SQLite

---

# Project Structure

```
AI-TextileWaste/
│
├── backend/
│   ├── config/
│   ├── inventory/
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

---

# Features Implemented

## Backend Configuration

- Django project setup
- Django REST Framework configuration
- SQLite database configuration
- CORS configuration
- JWT Authentication setup
- REST API development

---

## Frontend Configuration

- React + Vite setup
- React Router configuration
- Axios API integration
- Login page
- Registration page
- Dashboard page

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

---

## Textile Inventory Management

Implemented

- TextileWaste Model
- Textile Inventory REST API
- Inventory Serializer
- Inventory ViewSet
- Dashboard Inventory Display
- SQLite Database Storage

Current Fields

- Material Type
- Quantity
- Color
- Source
- Date Added

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

Authentication APIs

POST

```
/api/register/
```

POST

```
/api/token/
```

POST

```
/api/token/refresh/
```

Inventory APIs

GET

```
/api/textiles/
```

POST

```
/api/textiles/
```

PUT

```
/api/textiles/{id}/
```

DELETE

```
/api/textiles/{id}/
```

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
Textile Inventory API
        │
        ▼
SQLite Database
```

---

# Milestone 1 Progress

Completed

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

In Progress

- Role-Based Access Control
- Bootstrap UI Framework
- UI Wireframes
- Inventory Enhancement

Pending

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

# Milestone 2 Progress

Milestone 2 focused on turning the Milestone 1 groundwork into a working AI-driven waste intelligence workflow — image-based material detection, waste categorization, recyclability scoring, batch processing, PDF reporting, and a fully functional inventory management dashboard with role-based controls.

## Completed

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
- `status` field added to TextileWaste model + migration
- Updated Serializer, Views, and URLs to support new inventory workflow

## New / Updated Fields on TextileWaste

- Material Type
- Quantity (kg)
- Color
- Source
- Condition (New Surplus, Lightly Used, Worn, Damaged, Contaminated)
- Status (Registered, Collected, In Processing, Processed)
- Collection Date
- Batch ID (auto-generated, e.g. `WB-9CC3D5B1`)
- Created By (linked to authenticated user)
- Date Added

## In Progress

- OAuth Login
- User Profile Management
- Sustainability Analytics Dashboard
- Notification System

## Pending

- Deployment
- Docker Containerization
- Advanced Reporting

---

## Milestone 2 — Results & Screenshots

### All Results at a Glance

A combined view of the AI analysis report, material intelligence & recyclability assessment, batch analysis & inventory monitoring, and the waste registration & inventory table.

![All Milestone 2 Screenshots Combined](./screenshots/all_screenshots_combined.png)

---

### 1. Single Image Analysis — AI Report

An uploaded fabric image is classified by material type, with confidence score, texture assessment, contamination/brightness checks, and a circularity recommendation — all generated in one "Predict" action.

![AI Analysis Report](./screenshots/image-analysis-report.png)

**Example result:**
- Detected Material: Acrylic
- Confidence: 99.37%
- Texture: Medium
- Contamination: Suspected
- Brightness: Normal
- Condition Used: Good

### 2. Material Intelligence & Recyclability Assessment

Based on the detected material and condition, the system generates a circularity recommendation along with a recyclability score and category.

![Material Intelligence and Recyclability](./screenshots/material-intelligence-recyclability.png)

**Example result:**
- Circularity Recommendation: Hazardous Textile Waste (contamination detected — requires special handling before further processing)
- Circularity Index: 51.25%
- Category: Moderate Recovery Potential

### 3. Batch Analysis & Inventory Monitoring

Multiple images can be analyzed together, producing a combined downloadable PDF report. The Inventory Monitoring panel summarizes total batches and quantity, broken down by material type and status.

![Batch Analysis and Inventory Monitoring](./screenshots/batch-analysis-inventory-monitoring.png)

**Example result:**
- Total Batches: 3
- Total Quantity: 120 kg
- By Material: Cotton — 100 kg (2), Wool — 20 kg (1)
- By Status: 100 kg (2), 20 kg (1)

### 4. Register New Waste Batch & Textile Inventory Table

Authorized roles can register new waste batches through a form, and view/manage all registered batches in a filterable inventory table with inline status updates and delete actions.

![Register Waste Batch and Textile Inventory](./screenshots/register-waste-textile-inventory.png)

**Example inventory entries:**

| Batch ID     | Material | Quantity | Color | Source    | Condition | Collected  | Status     |
|--------------|----------|----------|-------|-----------|-----------|------------|------------|
| WB-9CC3D5B1  | Wool     | 20 kg    | Red   | Factory 1 | Damaged   | 2026-01-23 | Registered |
| WB-3937F338  | Cotton   | 50 kg    | Green | Factory B | Worn      | 2026-07-26 | Registered |

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

---

## Frontend

```bash
cd frontend

npm install

npm run dev
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

# Future Enhancements

- OAuth Login
- User Profile Management
- Sustainability Dashboard
- Environmental Impact Analysis
- Notification System
- Advanced Report Generation
- Docker Deployment

---

AI Textile Waste Management Project