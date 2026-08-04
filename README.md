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

In progress:
- Sustainability intelligence engine development
- Recycling recommendation workflow
- Environmental impact assessment logic
- Circular economy analytics and dashboard enhancements

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

## Recommendation Workflow

The recommendation logic evaluates predicted fabric quality and suggests one of the following actions:

- High quality: Reuse or Donate
- Medium quality: Mechanical Recycling
- Low quality: Chemical Recycling

The workflow also estimates sustainability and circularity impact indicators such as:

- sustainability score
- circularity score
- CO2 saved
- water saved
- energy saved

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
- Sustainability recommendation workflow: in progress
- Dashboard and inventory workflow: active and integrated

## Future Scope

Planned enhancements include:

- improving prediction accuracy with additional textile datasets
- integrating textile defect detection
- expanding sustainability analytics with real-world environmental metrics
- deploying the application with Docker and cloud platforms
- generating downloadable sustainability reports
- optimizing the recommendation engine with more advanced models
