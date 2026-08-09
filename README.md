# ♻️ AI Textile Waste Intelligence Platform

An AI-powered web application for intelligent textile waste management
that combines deep learning-based fabric recognition, defect detection,
waste classification, recyclability assessment, sustainability
intelligence, circular economy scoring, and recycling recommendations.

# 📌 Overview

The AI Textile Waste Intelligence Platform is designed to automate textile waste identification and support sustainable waste management using Artificial Intelligence and Computer Vision.

The platform allows users to:

- Securely manage textile inventory
- Upload textile images
- Classify fabric materials using a CNN model
- Categorize textile waste
- Assess recyclability
- Generate recycling recommendations
- Download professional PDF reports
- Track inventory through an interactive dashboard

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, React Router DOM, CSS

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt),
python-jose (JWT)

**AI & Machine Learning:** TensorFlow, Keras, NumPy, Pillow

**Database:** PostgreSQL

**Tools:** Git, GitHub, VS Code, pgAdmin 4

## ✨ Implemented Features

### 🔐 Authentication & Security

-   User Registration
-   Secure Login
-   Password Hashing using bcrypt
-   JWT Authentication
-   Protected Routes
-   Role-Based Access Control (RBAC)

### 📦 Inventory Management

-   Add Inventory
-   View Inventory
-   Update Inventory
-   Delete Inventory
-   Inventory integration with the application workflow

### 🤖 AI Fabric Prediction

-   Textile image upload
-   Image validation
-   Image preprocessing
-   Image resizing
-   Image normalization
-   CNN-based fabric classification
-   Prediction confidence score
-   Top-3 predictions

**Supported fabric classes:**

-   Cotton
-   Denim
-   Polyester
-   Silk
-   Wool
-   Blended Fabric

### 🔎 Defect Detection

The prediction workflow provides fabric defect analysis, including:

-   Defect prediction
-   Defect confidence score
-   Detected defect status

### 📚 Material Information

After classification, the platform displays:

-   Fabric class
-   Material type
-   Material description
-   Common applications / common uses

### 📊 Top-3 Predictions

The platform displays the top three model predictions with confidence
scores. This improves transparency because visually similar fabrics can
produce competing predictions.

### ♻️ Waste Classification & Recyclability

Based on the predicted fabric, the platform provides:

-   Waste category
-   Recyclability information
-   Reuse potential
-   Recommended recovery/recycling actions

## 🌱 Sustainability Intelligence

### Sustainability Overview

The Sustainability Overview summarizes:

-   Circularity Score
-   Recovery Category
-   Environmental Score
-   Material Type
-   Overall sustainability summary

### 🌍 Environmental Impact

The platform estimates:

-   CO₂ emissions avoided
-   Water saved
-   Energy saved
-   Landfill waste diverted

### ♻️ Circular Economy Score

The Circular Economy Score uses five weighted factors:

  Factor                     Weight
  ------------------------ --------
  Material Recyclability        35%
  Reuse Potential               20%
  Material Condition            20%
  Environmental Benefit         15%
  Processing Feasibility        10%

The application displays the overall score, recovery category,
individual factor scores, and weighted breakdown.

### 🔄 Recycling Recommendation

The platform generates:

-   Primary recovery method
-   Waste category
-   Reuse potential
-   Recommended actions

Possible actions include Fiber Recycling, Mechanical Recycling, Fabric
Reuse, Donation, and other suitable recovery actions based on the
analysis.

## 📄 Prediction & Sustainability Report

The downloadable PDF report can include:

-   Prediction result
-   Confidence score
-   Defect information
-   Material information
-   Top predictions
-   Sustainability overview
-   Environmental impact
-   Circular Economy Score
-   Recycling recommendation

## ✅ Milestone 1 (Week 1 & Week 2)

### Authentication & Access Control

Completed:

-   Project architecture
-   React and FastAPI integration
-   PostgreSQL database configuration
-   User registration and login
-   bcrypt password hashing
-   JWT authentication
-   Protected routes
-   RBAC
-   Inventory CRUD APIs
-   Frontend/backend API integration
-   Authentication workflow testing

## ✅ Milestone 2 (Week 3 & Week 4)

### Material Recognition & Waste Classification

Completed:

-   Textile image upload and validation
-   Image preprocessing, resizing, and normalization
-   CNN model using TensorFlow/Keras
-   FastAPI model integration
-   Real-time prediction API
-   Confidence scores
-   Top-3 predictions
-   Waste categorization
-   Material information mapping
-   Recyclability assessment
-   Recycling recommendations
-   Prediction PDF reporting

## ✅ Milestone 3 (Week 5 & Week 6)

### Sustainability Intelligence & Recommendations

#### ✔ Sustainability Intelligence

-   Sustainability Overview
-   Circularity Score
-   Recovery Category
-   Environmental Score
-   Material Type
-   Overall sustainability summary

#### ✔ Environmental Impact Assessment

-   CO₂ emissions avoided
-   Water saved
-   Energy saved
-   Landfill diversion

#### ✔ Circular Economy Analytics

Implemented a Circular Economy Score using:

-   Material Recyclability --- 35%
-   Reuse Potential --- 20%
-   Material Condition --- 20%
-   Environmental Benefit --- 15%
-   Processing Feasibility --- 10%

The application displays the overall score, recovery category, and
individual factor scores.

#### ✔ Recycling Recommendation Engine

Provides:

-   Primary recovery method
-   Waste category
-   Reuse potential
-   Recommended actions

#### ✔ Enhanced Prediction Experience

**Image Upload → Preprocessing → CNN Prediction → Defect Detection →
Material Information → Top-3 Predictions → Sustainability Analysis →
Recycling Recommendation → PDF Report**

#### ✔ PDF Sustainability Reporting

The downloadable report is extended to include prediction and
sustainability information.

### Milestone 3 Outcomes

-   Sustainability analysis integrated with AI prediction
-   Environmental impact assessment implemented
-   Circular Economy Score implemented
-   Weighted sustainability factors displayed
-   Recycling recommendation workflow implemented
-   Sustainability information integrated into prediction results
-   PDF reporting extended with sustainability information

## 🔐 API Endpoints

  -------------------------------------------------------------------------
  Method            Endpoint            Description       Authentication
  ----------------- ------------------- ----------------- -----------------
  GET               `/`                 Health Check      No

  POST              `/register`         Register User     No

  POST              `/login`            User Login        No

  GET               `/inventory`        Get Inventory     Yes

  POST              `/inventory`        Add Inventory     Yes

  PUT               `/inventory/{id}`   Update Inventory  Yes

  DELETE            `/inventory/{id}`   Delete Inventory  Yes

  POST              `/predict`          Predict Textile   Yes
                                        Material and      
                                        generate analysis 
  -------------------------------------------------------------------------

## 🚀 System Workflow

``` text
User Login
     │
     ▼
Upload Textile Image
     │
     ▼
Image Validation & Preprocessing
     │
     ▼
CNN Material Classification
     │
     ├──────────────► Top-3 Predictions
     │
     ▼
Defect Detection
     │
     ▼
Material Information
     │
     ▼
Waste Classification
     │
     ▼
Recyclability Assessment
     │
     ▼
Sustainability Intelligence
     │
     ├──────────────► Sustainability Overview
     ├──────────────► Environmental Impact
     └──────────────► Circular Economy Score
     │
     ▼
Recycling Recommendation
     │
     ▼
Generate PDF Report
```

## 🚀 Getting Started

### Backend

``` bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: `http://localhost:8000`

Swagger: `http://localhost:8000/docs`

### Frontend

``` bash
cd Frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## 🔜 Future Enhancements

-   History page improvements and integration with the latest prediction
    workflow
-   Dashboard improvements and integration with the latest analytics
-   Additional reporting and analytics
-   Batch analysis enhancements
-   Further model improvements and validation
-   Production/cloud deployment

## 📄 License

Developed as part of the Infosys Internship Program.

This project is intended for educational and internship purposes.
