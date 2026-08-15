# 🧵 Textile Waste Intelligence Platform

<p align="center">

### ♻️ AI-Powered Textile Analysis & Circular Economy Intelligence

**An intelligent platform for textile material recognition, defect analysis, waste classification, sustainability assessment, and circular economy decision support.**

</p>

---

## 🌱 About the Project

The **Textile Waste Intelligence Platform** is an AI-powered web application designed to support intelligent textile waste management using **Computer Vision, Deep Learning, Sustainability Analytics, and Circular Economy intelligence**.

The platform analyzes uploaded textile images and transforms them into meaningful insights such as:

- 🧵 Textile material identification
- 🔍 Fabric surface and texture analysis
- ⚠️ Defect detection
- ♻️ Waste classification
- 🌱 Recyclability assessment
- 🔄 Reuse and recovery potential
- 📊 Sustainability scoring
- 🌍 Environmental impact indicators
- 💡 Recycling and reuse recommendations
- 📈 Analytics and dashboards
- 📄 AI-generated reports
- 📦 Textile waste inventory management

The goal is to provide a **single unified platform** that connects textile image analysis with sustainability and circular economy decision-making.

---

## 🎯 Project Objectives

1. Identify textile materials using AI-based image classification.
2. Analyze textile surfaces, textures, and defects.
3. Classify textile waste based on material and condition.
4. Estimate recyclability and reuse potential.
5. Generate sustainability-related indicators.
6. Recommend suitable recycling, reuse, and recovery pathways.
7. Maintain textile waste inventory records.
8. Generate structured AI analysis reports.
9. Provide analytics for textile waste and sustainability information.
10. Demonstrate how Artificial Intelligence can support sustainable textile waste management.

---

# ✨ Key Features

## 🔐 1. Authentication & User Management

- User Registration
- User Login
- JWT-based authentication
- Protected routes
- Logout
- User Profile
- Password reset workflow
- Role information

### Authentication Flow

```text
Register
   ↓
Login
   ↓
JWT Authentication
   ↓
Protected Application
   ↓
Dashboard
```

---

# 🤖 2. AI Textile Intelligence

The core feature of the platform is the **AI Textile Intelligence module**.

Users can upload a textile image and perform AI-based analysis.

### Analysis Pipeline

```text
              Textile Image
                    │
                    ▼
             Image Processing
                    │
                    ▼
          Material Classification
                    │
                    ▼
             Defect Detection
                    │
                    ▼
           Waste Classification
                    │
                    ▼
          Sustainability Analysis
                    │
                    ▼
       Circular Economy Assessment
                    │
                    ▼
        Recycling / Reuse Recommendation
                    │
                    ▼
              AI Report
```

---

### Textile Material Recognition

The platform uses an AI-based image classification model to recognize and analyze supported textile materials.

The system provides information such as:

- Textile material
- Surface / weave type
- Material confidence
- Recyclability
- Reuse potential
- Recommended recovery pathway

The model is trained on textile image data and is designed to identify the textile categories supported by the current training dataset.

---

# 🔍 4. Textile Defect Detection

The platform performs image-based textile defect analysis.

The system provides:

- Defect prediction
- Defect confidence
- Textile condition

This helps determine whether a textile is suitable for:

```text
Reuse
  ↓
Repair
  ↓
Upcycling
  ↓
Recycling
  ↓
Material Recovery
```

---

# ♻️ 5. Waste Classification

The platform categorizes textile waste based on the available analysis.

Possible pathways include:

- Recyclable
- Reusable
- Repairable
- Upcyclable
- Material Recovery
- Disposal recommendation

The classification information is used by the sustainability and recommendation modules.

---

# 🌱 6. Sustainability Intelligence

The platform evaluates the sustainability characteristics of analyzed textiles.

### Sustainability Information

- Sustainability Score
- Recyclability
- Reuse Potential
- Environmental Impact
- Carbon Footprint
- Water Consumption
- Eco Rating
- Circular Economy Information

### Sustainability Flow

```text
Material
   ↓
Recyclability
   ↓
Reuse Potential
   ↓
Environmental Benefit
   ↓
Sustainability Score
   ↓
Recommended Action
```

---

# 🌍 7. Environmental Impact Analysis

The platform provides environmental indicators related to textile recovery.

These include:

- Carbon footprint indication
- Water consumption indication
- Environmental impact
- Resource recovery
- Waste diversion
- Sustainability performance

These indicators help users understand the potential environmental benefit of recycling or reusing textile materials.

---

# 🔄 8. Circular Economy Intelligence

The platform supports circular economy decision-making by recommending possible recovery pathways.

### Circular Economy Pathways

```text
              Textile Waste
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
       Reuse     Upcycling   Recycling
        │           │           │
        ▼           ▼           ▼
   Direct Use   New Products  Fiber Recovery
                    │
                    ▼
             Resource Recovery
```

The system provides:

- Reuse potential
- Recycling recommendation
- Recovery pathway
- Circular economy score
- Sustainability benefit

---

# 📊 9. Dashboard

The dashboard provides a centralized overview of the platform.

### Dashboard Information

- Total analyses
- Textile activity
- Sustainability information
- Recent analysis activity
- Waste information
- Circular economy information

The dashboard acts as the main entry point after authentication.

---

# 📈 10. Analytics

The Analytics module provides visual insights into analyzed textile data.

### Analytics Includes

- Material distribution
- Defect distribution
- Waste categories
- Sustainability performance
- Circular economy pathways
- Analysis statistics

This allows users to understand trends rather than viewing individual predictions only.

---

# 📄 11. AI Reports

Every completed textile analysis can be stored as a report.

### Report Contains

- Uploaded image
- Analysis date
- Material
- Surface
- Material confidence
- Defect
- Defect confidence
- Waste category
- Textile condition
- Reuse potential
- Recyclability
- Sustainability score
- Environmental impact
- Carbon footprint
- Water consumption
- Recycling recommendation
- Circular economy recommendation
- Eco rating
- AI summary

### Report Actions

- 📥 Download
- 🗑️ Delete
- 📋 View previous reports

---

# 📦 12. Inventory Management

The Inventory module manages textile waste records.

Users can add:

| Field | Description |
|------|-------------|
| Waste Type | Type/category of waste |
| Fabric Type | Textile material |
| Quantity | Waste quantity |
| Unit | Measurement unit |
| Location | Waste source/location |
| Status | Current processing status |
| Image | Associated textile image |

### Inventory Features

- Add waste records
- Upload textile images
- Search inventory
- View inventory records
- Track processing status
- View predictions

### Example Status Flow

```text
Collected
    ↓
Processing
    ↓
Recycled
```

---

# 👤 13. User Profile

The Profile module displays user information and platform activity.

### Profile Information

- Full Name
- Email
- Role
- Account Status
- Platform information

### Activity Statistics

- Images Analysed
- Materials Identified
- Reports Generated
- Average Sustainability

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     USER / OPERATOR                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 REACT FRONTEND                          │
│                                                         │
│ Dashboard | Intelligence | Inventory | Analytics        │
│ Reports   | Profile     | Authentication                │
└───────────────────────────┬─────────────────────────────┘
                            │
                         REST API
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                       │
│                                                         │
│ Authentication | Inventory | Textile Services           │
│ Sustainability | Reports | API Endpoints                │
└───────────────┬───────────────────────┬─────────────────┘
                │                       │
                ▼                       ▼
┌────────────────────────┐   ┌───────────────────────────┐
│      PostgreSQL        │   │       AI / ML ENGINE      │
│                        │   │                           │
│ Users                  │   │ PyTorch                   │
│ Inventory              │   │ ResNet18                  │
│ Textile Records        │   │ Computer Vision           │
└────────────────────────┘   │ Image Processing          │
                             └──────────────┬────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────┐
                             │ Sustainability Engine    │
                             │                          │
                             │ Waste Classification     │
                             │ Recyclability            │
                             │ Recommendations          │
                             │ Circular Economy         │
                             └──────────────────────────┘
```

---

# 🧠 AI / ML Architecture

The current material recognition pipeline uses:

```text
Input Image
     ↓
Resize
     ↓
Tensor Conversion
     ↓
Image Normalization
     ↓
ResNet18
     ↓
Softmax
     ↓
Predicted Class
     ↓
Fabric Information Mapping
```

### Model Components

- PyTorch
- Torchvision
- ResNet18
- Pillow
- Image preprocessing
- Softmax probability estimation

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|-----------|---------|
| React.js | User interface |
| Vite | Frontend development |
| JavaScript | Application logic |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | API communication |

## Backend

| Technology | Purpose |
|-----------|---------|
| Python | Backend programming |
| FastAPI | REST API |
| SQLAlchemy | Database ORM |
| JWT | Authentication |
| Pydantic | Data validation |

## Database

| Technology | Purpose |
|-----------|---------|
| PostgreSQL | Primary database |

## AI / Machine Learning

| Technology | Purpose |
|-----------|---------|
| PyTorch | Deep learning |
| Torchvision | Computer vision models |
| ResNet18 | Material classification |
| Pillow | Image processing |

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- PostgreSQL
- npm
- Python Virtual Environment

---

# 📂 Project Structure

```text
AI-Textile-Waste-Intelligence-Platform/
│
├── backend/
│   │
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── ml/
│   │   ├── predict.py
│   │   ├── predict_defect.py
│   │   └── ...
│   │
│   ├── uploads/
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── inventory/
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TextileIntelligence.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   │
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

Navigate into the project:

```bash
cd AI-Textile-Waste-Intelligence-Platform
```

---

# 🐍 Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔄 Complete Application Workflow

```text
                         START
                           │
                           ▼
                     Register User
                           │
                           ▼
                         Login
                           │
                           ▼
                       Dashboard
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
       AI Intelligence  Inventory     Analytics
             │
             ▼
       Upload Image
             │
             ▼
     Material Recognition
             │
             ▼
       Defect Detection
             │
             ▼
      Waste Classification
             │
             ▼
     Sustainability Analysis
             │
             ▼
   Circular Economy Analysis
             │
             ▼
       Recommendation
             │
             ▼
        Generate Report
             │
       ┌─────┴─────┐
       ▼           ▼
    Download     Delete
```

---

# 🧪 Testing & Validation

The major application workflows have been tested.

### Authentication

- [x] Registration
- [x] Login
- [x] Logout
- [x] Protected routes

### AI Intelligence

- [x] Image upload
- [x] Material prediction
- [x] Defect prediction
- [x] Waste classification
- [x] Sustainability analysis
- [x] Recommendation generation

### Reports

- [x] Report generation
- [x] Report listing
- [x] Report download
- [x] Report deletion

### Inventory

- [x] Add waste record
- [x] Image upload
- [x] Inventory listing
- [x] Inventory search
- [x] Status display

### Analytics

- [x] Analytics dashboard
- [x] Material statistics
- [x] Sustainability statistics
- [x] Waste information

### Profile

- [x] User information
- [x] Account information
- [x] Activity statistics
- [x] Profile editing

---

# 📊 Project Status

| Module | Status |
|--------|--------|
| Authentication | ✅ Completed |
| Registration | ✅ Completed |
| Login | ✅ Completed |
| Logout | ✅ Completed |
| Dashboard | ✅ Completed |
| AI Textile Intelligence | ✅ Completed |
| Material Recognition | ✅ Completed |
| Defect Detection | ✅ Completed |
| Waste Classification | ✅ Completed |
| Sustainability Analysis | ✅ Completed |
| Circular Economy | ✅ Completed |
| Inventory Management | ✅ Completed |
| Analytics | ✅ Completed |
| Reports | ✅ Completed |
| Report Download | ✅ Completed |
| Report Delete | ✅ Completed |
| User Profile | ✅ Completed |
| Frontend-Backend Integration | ✅ Completed |
| Database Integration | ✅ Completed |
| End-to-End Testing | ✅ Completed |

---

# 📈 Project Milestones

## 🟢 Milestone 1 — Authentication & Core Setup

- Project architecture
- Frontend setup
- Backend setup
- Database setup
- Authentication
- Protected routes
- Dashboard
- Inventory

## 🔵 Milestone 2 — Material Recognition & Waste Intelligence

- Textile image upload
- Material classification
- Defect detection
- Waste classification
- Recyclability assessment
- AI analysis workflow

## 🟣 Milestone 3 — Sustainability & Circular Economy

- Sustainability scoring
- Environmental impact analysis
- Carbon footprint indication
- Water consumption indication
- Reuse recommendations
- Recycling recommendations
- Circular economy analysis

## 🟠 Milestone 4 — Analytics, Reports & Integration

- Analytics dashboard
- Reports
- Report download
- Report deletion
- Inventory integration
- Profile
- End-to-end testing
- GitHub version control

---

# 🌟 Why This Platform?

Traditional textile waste management often requires separate processes for:

```text
Image Analysis
      +
Material Identification
      +
Waste Classification
      +
Sustainability Assessment
      +
Recycling Decisions
      +
Reporting
```

This platform brings these capabilities together into a **single integrated workflow**.

### Conventional Approach

```text
Multiple Tools
     ↓
Manual Analysis
     ↓
Separate Reports
     ↓
Manual Decisions
```

### Proposed Platform

```text
              One Platform
                   ↓
            AI Image Analysis
                   ↓
         Material Recognition
                   ↓
          Waste Intelligence
                   ↓
       Sustainability Analysis
                   ↓
        Circular Recommendations
                   ↓
            Decision Support
```

---

# 🎯 Expected Impact

The platform aims to support:

- Textile manufacturers
- Recycling facilities
- Sustainability teams
- Waste management organizations
- Fashion and textile businesses
- Academic and research applications

The system demonstrates how AI and sustainability analytics can be combined to improve textile waste management and resource recovery.

---

# 🔮 Future Enhancements

Future versions can include:

- Larger textile datasets
- Additional textile categories
- More advanced defect detection
- Dedicated textile/non-textile image validation
- Improved model generalization
- Real-time industrial camera integration
- Advanced role-based dashboards
- Automated notifications
- Cloud deployment
- Docker deployment
- Advanced sustainability metrics
- Real-time recycling facility monitoring
- Enterprise-scale deployment

---

# ⭐ Project Highlights

```text
🧵 Textile Material Recognition
🤖 AI-Based Image Analysis
🔍 Defect Detection
♻️ Waste Intelligence
🌱 Sustainability Assessment
🌍 Environmental Impact
🔄 Circular Economy Recommendations
📦 Inventory Management
📊 Analytics Dashboard
📄 AI Reports
🔐 Authentication
🗄️ PostgreSQL Database
⚡ FastAPI Backend
⚛️ React Frontend
```

---

# 👨‍💻 Project

## Textile Waste Intelligence Platform

**AI-powered textile analysis and circular economy decision-support system.**

Built using:

```text
React + Vite + Tailwind CSS
            +
Python + FastAPI
            +
PostgreSQL
            +
PyTorch + ResNet18
```

---

# 📜 License

This project has been developed for **academic, internship, research, and demonstration purposes**.