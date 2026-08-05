# AI Textile Waste Intelligence Platform

Infosys Springboard Internship Project | AI-powered textile waste intelligence and sustainability recommendation platform.

## Overview

This project combines a React-based frontend, a Flask backend, SQLite data storage, and machine learning to support:

- textile waste inventory management
- AI-based fabric quality prediction
- recycling and sustainability recommendations
- interactive dashboard analytics

The platform is designed to help users monitor waste inventory, analyze fabric quality, and support circular economy decisions.

## Key Features

- Inventory capture and management for textile waste records
- User registration and authentication with bcrypt and JWT
- Dashboard metrics for total records, total quantity, and unique fabric types
- AI prediction API for fabric quality classification
- Recommendation workflow for reuse, recycling, and sustainability impact
- Responsive frontend experience built with React and Vite
- Dynamic Sustainability Intelligence Engine
- Circularity Calculator for manual sustainability assessment
- Environmental impact estimation (CO₂, Water, Energy)
- Dynamic sustainability scoring based on textile properties

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, Flask |
| Database | SQLite |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn, Joblib |
| Security | bcrypt, PyJWT |
| Version Control | Git, GitHub |

## Project Structure

- frontend/: React application and dashboard UI
- backend/: Flask API, database access, prediction logic
- ml/: trained model, encoders, and preprocessing scripts
- datasets/: textile and fabric quality datasets
- docs/: project documentation and design notes

## Milestones and Progress

### Milestone 1 - Core Platform Development

Completed:
- Project setup and repository initialization
- React frontend development with login and registration modules
- Waste inventory form and inventory management workflow
- SQLite database integration and inventory API endpoints
- Backend integration with frontend and CORS configuration

### Milestone 2 - AI and Data Science Module

Completed:
- Dataset selection and preprocessing
- Exploratory data analysis on a textile fabric quality dataset
- Cleaning of missing values and duplicates
- Feature engineering and label encoding
- Training and evaluation of a Random Forest Classifier
- Model performance of approximately 87.70% accuracy
- Integration of the trained model and encoders into the Flask backend

### Milestone 3 - Sustainability Intelligence Workflow

Completed:

- Dynamic Sustainability Intelligence Engine
- AI-powered recycling recommendation workflow
- Environmental impact assessment
- Dynamic sustainability score calculation
- Circularity score calculation
- CO₂, water, and energy savings estimation
- Circularity Calculator for manual sustainability analysis
- React frontend integrated with Flask recommendation API
- Sustainability dashboard displaying recommendation and impact metrics

## AI Model Details

The prediction module uses a machine learning pipeline based on a Random Forest Classifier.

- Dataset used: textile fabric quality classification dataset
- Records analyzed: 25,750
- Columns: 23
- Target variable: fabric_quality
- Model accuracy: approximately 87.70%
- Model artifacts saved for backend use:
  - fabric_quality_model.pkl
  - label encoders in the ml/encoders folder

The recommendation workflow dynamically computes sustainability metrics based on:

- Fabric Type
- Production Method
- Finish Type
- Defect Count
- Quantity / Weight

The engine estimates:

- Sustainability Score
- Circularity Score
- CO₂ Saved
- Water Saved
- Energy Saved

This enables users to evaluate the environmental benefits of different recycling strategies before processing textile waste.

## Circularity Calculator

The Circularity Calculator enables users to calculate sustainability metrics without uploading an image.

Users can manually enter:

- Fabric Type
- Weight
- Production Method
- Finish Type
- Defect Count

The system communicates with the Flask recommendation API and generates:

- Recommended recycling strategy
- Sustainability Score
- Circularity Score
- CO₂ Saved
- Water Saved
- Energy Saved

This feature is intended for manually sorted textile waste where image-based prediction is not required.
## Dashboard Features

The dashboard displays:

- total inventory records
- total waste quantity
- unique fabric types
- inventory table with live updates
- delete functionality for records
- live statistics tied to backend data

## Installation and Setup

### Prerequisites

- Node.js and npm
- Python 3.x
- pip

### Backend

```bash
cd backend
pip install flask flask-cors bcrypt pyjwt joblib pandas scikit-learn
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

The backend uses a SQLite database file for inventory and user data. Ensure the database file is available in the project root when running the backend.

## Current Status

- Branch: 24A31A05IZ
- Core platform: completed
- AI prediction module: completed
- Sustainability recommendation workflow: completed
- Dynamic Sustainability Intelligence Engine: completed
- Circularity Calculator: completed

## Future Scope

Planned enhancements include:

- improving prediction accuracy with additional textile datasets
- integrating textile defect detection
- expanding sustainability analytics with real-world environmental metrics
- deploying the application with Docker and cloud platforms
- generating downloadable sustainability reports
- Single image textile waste estimation
- Batch image processing for warehouse-scale analysis
- Automated sustainability report generation
- Real-time analytics dashboard
- Cloud deployment and scalability
