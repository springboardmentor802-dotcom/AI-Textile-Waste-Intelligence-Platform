# AI Textile Waste Intelligence Platform

An AI-powered full-stack web application developed as part of the **Infosys Springboard Internship** to support sustainable textile waste management through intelligent fabric analysis, defect detection, waste assessment, and recycling recommendations.

---

# Project Overview

The AI Textile Waste Intelligence Platform helps textile manufacturers, recycling facilities, and sustainability managers analyze textile waste using Artificial Intelligence and Computer Vision.

The platform provides:

- Secure role-based authentication
- Fabric material recognition
- Fabric defect detection
- Color analysis
- Texture analysis
- Pattern analysis
- Waste categorization
- Recyclability assessment
- Sustainability scoring
- PDF report generation

The project is designed to assist industries in making data-driven decisions for textile reuse, recycling, and circular economy initiatives.

---

# Features

## User Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing (bcrypt)
- Secure Logout
- Protected Routes

---

## Role-Based Access Control

Supported Roles:

- Administrator
- Textile Manufacturer
- Recycling Facility Operator
- Sustainability Manager

Each role has controlled access to different modules of the system.

---

# Textile Image Analysis Engine

The platform analyzes uploaded textile images using AI models and OpenCV.

### Material Recognition

Deep Learning CNN model trained on multiple textile materials.

Recognizes:

- Acrylic
- Blended
- Chenille
- Corduroy
- Cotton
- Crepe
- Denim
- Fleece
- Leather
- Linen
- Nylon
- Polyester
- Satin
- Silk
- Terrycloth
- Velvet
- Viscose
- Wool

---

### Fabric Defect Detection

YOLOv8-based object detection model.

Detects various textile defects including:

- Hole
- Tear
- Stain
- Missing Yarn
- Broken End
- Thick Place
- Thin Place

Returns:

- Defect Class
- Confidence Score
- Bounding Boxes
- Annotated Image

---

### Color Analysis (OpenCV)

Extracts dominant colors from uploaded fabric images using K-Means clustering.

Provides:

- Dominant RGB Colors
- Primary Fabric Color Palette

---

### Texture Analysis (OpenCV + GLCM)

Texture features extracted using Gray Level Co-occurrence Matrix (GLCM).

Generated Features:

- Contrast
- Homogeneity
- Energy
- Correlation

Texture Classification:

- Smooth
- Medium
- Rough

---

### Pattern Analysis (OpenCV)

Pattern analysis using Canny Edge Detection and Hough Line Transform.

Detects:

- Vertical Lines
- Horizontal Lines
- Diagonal Lines

Pattern Classification:

- Plain Fabric
- Patterned Fabric

---

# Waste Assessment System

The platform automatically assesses textile waste using outputs from AI models.

Includes:

- Material Condition
- Material Type
- Defect Severity
- Reuse Potential
- Recyclability Assessment
- Processing Feasibility

---

# Recycling Recommendation Engine

Based on detected material and defects, the system recommends suitable recycling strategies.

Recommendations include:

- Fabric Reuse
- Upcycling
- Donation
- Mechanical Recycling
- Chemical Recycling
- Fiber Recycling
- Industrial Recovery

---

# Sustainability Intelligence

Generates sustainability insights including:

- Carbon Footprint Estimation
- Waste Diversion Analysis
- Circular Economy Analysis
- Resource Recovery Estimation
- Sustainability Benchmarking

---

# Waste Scoring Engine

The platform calculates multiple sustainability scores.

Generated Scores:

- Recyclability Score
- Reuse Score
- Sustainability Score
- Material Recovery Score
- Overall Circularity Score

Circularity Score considers:

- Material Recyclability
- Material Condition
- Reuse Potential
- Environmental Benefits
- Processing Feasibility

---

# PDF Report Generation

The platform generates downloadable PDF reports containing:

- Uploaded Fabric Image
- Material Type
- Material Confidence
- Defect Detection Results
- Color Analysis
- Texture Analysis
- Pattern Analysis
- Recycling Recommendation
- Sustainability Scores
- Circularity Assessment

---

# Technology Stack

## Frontend

- React.js
- React Router
- Axios
- Tailwind CSS

## Backend

- FastAPI
- SQLAlchemy
- JWT Authentication
- Passlib / bcrypt
- Pydantic

## Database

- PostgreSQL

## AI / Machine Learning

- TensorFlow / Keras
- YOLOv8 (Ultralytics)
- OpenCV
- NumPy
- Scikit-image

---

# Project Structure

```
textile-waste-platform/
│
├── backend/
├── frontend/
├── ml_models/
│   ├── material_recognition/
│   ├── saved_models/
│   └── opencv_modules/
│
├── docker-compose.yml
├── README.md
└── requirements.txt
```

---

# Installation

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# API Documentation

FastAPI Swagger UI

```
http://localhost:8000/docs
```

---

# Current Progress

## Completed

- User Authentication
- JWT Authorization
- Role-Based Access Control
- Material Recognition Model
- Fabric Defect Detection Model
- Color Analysis Module
- Texture Analysis Module
- Pattern Analysis Module
- Full Textile Image Analysis API
- PDF Report Generation
- Waste Categorization Workflow
- Recycling Recommendation Engine
- Sustainability Intelligence Dashboard

---

## Planned

- Bulk Image Analysis
- Advanced Analytics
- Batch Processing
- Cloud Deployment


