# Textile Waste Intelligence Platform

## Overview

The **Textile Waste Intelligence Platform** is a full-stack web application developed as part of the **Infosys Springboard Internship**. The platform aims to improve textile waste management by enabling manufacturers and recyclers to manage textile waste efficiently while supporting sustainability through intelligent data integration.

The project is being developed milestone-wise, beginning with authentication, inventory management, manufacturer workflows, and sustainability dataset integration, with future enhancements including AI-powered recommendations, analytics, and a marketplace.

---

# Tech Stack

## Frontend

* React.js
* React Router DOM
* Axios
* Vite

## Backend

* FastAPI
* SQLAlchemy ORM
* Pydantic
* JWT Authentication
* Passlib (Password Hashing)
* Alembic
* PostgreSQL

## Database

* PostgreSQL

## Dataset

* Sustainable Fashion Dataset (CSV)

---

# Project Structure

```
Textile-Waste-Intelligence-Platform/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── dataset/
│   └── scripts/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── App.jsx
│
└── README.md
```

---

# Features Implemented

## Authentication Module

### JWT Authentication

* User Registration
* User Login
* Secure JWT Token Generation
* Password Hashing using Passlib
* Token-based Authorization
* Logout
* Persistent Login using Local Storage

### Role-Based Access Control

Supported Roles:

* Manufacturer
* Recycler
* Admin

Protected routes are implemented using custom React ProtectedRoute components and backend dependency validation.

---

# User Module

Implemented APIs:

* Register User
* Login User
* Get Current User
* Get User Profile
* Update Profile
* Change Password
* View All Users (Admin)
* View User Details
* Delete User (Admin)

Frontend Pages:

* Login
* Register
* User Profile
* Edit Profile
* Change Password
* User Management

---

# Manufacturer Module

Implemented:

* Create Manufacturer
* View Manufacturers
* View Manufacturer Details
* Update Manufacturer
* Delete Manufacturer

Frontend:

* Manufacturer List
* Manufacturer Details
* Manufacturer Registration

---

# Textile Inventory Module

Implemented:

* Add Inventory
* View Inventory
* Inventory Details
* Update Inventory
* Delete Inventory

Each inventory record stores:

* Textile Type
* Material
* Quantity
* Unit
* Waste Category
* Manufacturer Association

---

# Sustainability Dataset Module

Implemented:

### Database

Created dedicated Sustainability Dataset table.

Dataset includes:

* Brand ID
* Brand Name
* Country
* Year
* Sustainability Rating
* Material Type
* Eco-Friendly Manufacturing
* Carbon Footprint
* Water Usage
* Waste Production
* Recycling Programs
* Product Lines
* Average Price
* Market Trend
* Certifications

### Backend APIs

* View Dataset
* View Dataset Record
* Delete Record
* Clear Dataset

### CSV Integration

Implemented CSV import script for automatic database population using pandas.

---

# Dashboard

Implemented:

* User Dashboard
* Role-aware Navigation
* Sidebar
* Navbar
* User Overview
* Quick Navigation Cards

---

# Database

Current Tables

* users
* manufacturers
* inventory
* sustainability_dataset

Database migrations are managed using Alembic.

---

# Security Features

* JWT Authentication
* Password Hashing
* Protected API Routes
* Role-Based Authorization
* Secure Password Change
* Duplicate Email Validation
* Duplicate Dataset Prevention

---



# System Workflow

The Textile Waste Intelligence Platform follows a secure client-server architecture built using React, FastAPI, PostgreSQL, SQLAlchemy, and JWT Authentication.

## Overall Architecture

```
                    +----------------------+
                    |   React Frontend     |
                    +----------+-----------+
                               |
                         Axios HTTP Requests
                               |
                               ▼
                    +----------------------+
                    |    FastAPI Backend   |
                    +----------+-----------+
                               |
              +----------------+----------------+
              |                                 |
              ▼                                 ▼
      Authentication                    Business Logic
      (JWT + RBAC)          Manufacturer | Inventory | Dataset
              |                                 |
              +----------------+----------------+
                               |
                               ▼
                     PostgreSQL Database
```

---

# Authentication Flow

The application uses **JWT (JSON Web Token)** based authentication to securely identify users without maintaining server-side sessions.

## Registration Flow

```
User
 │
 ▼
Register Form
 │
 ▼
POST /users/register
 │
 ▼
Validate Input
 │
 ▼
Check Duplicate Email
 │
 ▼
Hash Password using Passlib (bcrypt)
 │
 ▼
Save User in PostgreSQL
 │
 ▼
Return User Details
```

### Steps

1. User enters Name, Email, Password and Role.
2. FastAPI validates the request using Pydantic schemas.
3. Backend checks whether the email already exists.
4. Password is securely hashed using Passlib.
5. User information is stored in PostgreSQL.
6. Success response is returned.

Passwords are **never stored in plain text**.

---

# Login Flow

```
User
 │
 ▼
Login Form
 │
 ▼
POST /users/login
 │
 ▼
Find User
 │
 ▼
Verify Password
 │
 ▼
Generate JWT Access Token
 │
 ▼
Return Token
 │
 ▼
Store Token in LocalStorage
```

### Steps

1. User enters email and password.
2. Backend fetches the user from the database.
3. Password hash is verified.
4. If valid, FastAPI generates a JWT Access Token.
5. The frontend stores the token inside LocalStorage.

Example:

```
localStorage

access_token
```

---

# Access Token Generation

The JWT token contains important information called **claims**.

Example payload:

```json
{
    "sub": "user@email.com",
    "user_id": 4,
    "role": "Manufacturer"
}
```

The token is digitally signed using the application's secret key.

Because of this signature:

- The token cannot be modified.
- The backend can verify authenticity.
- Users cannot impersonate other users.

---

# Authenticated Request Flow

Whenever the frontend calls a protected API, Axios automatically attaches the JWT token.

```
React
 │
 ▼
Axios
 │
 ▼
Authorization:
Bearer <JWT_TOKEN>
 │
 ▼
FastAPI
 │
 ▼
Verify JWT
 │
 ▼
Extract User
 │
 ▼
Allow API Execution
```

Example Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# Role-Based Access Control (RBAC)

Each user belongs to one of the supported roles.

- Admin
- Manufacturer
- Recycler

The JWT token stores the user's role.

Example:

```json
{
    "role": "Manufacturer"
}
```

Whenever a protected endpoint is accessed, FastAPI checks the role before executing the API.

Example:

```
Admin Only APIs

View Users
Delete Users
Manage Dataset

Manufacturer

Manage Inventory
View Dataset

Recycler

```

Unauthorized users receive:

```
401 Unauthorized
```

or

```
403 Forbidden
```

depending on the permission check.

---

# Protected Route Flow (Frontend)

The frontend also protects pages using a custom ProtectedRoute component.

```
Open Dashboard
 │
 ▼
Check LocalStorage
 │
 ▼
Token Present?
 │
 ├────────── No
 │            │
 │            ▼
 │        Redirect Login
 │
 ▼
Call /users/me
 │
 ▼
Token Valid?
 │
 ├────────── No
 │            │
 │            ▼
 │        Logout User
 │
 ▼
Render Dashboard
```

---

# Password Security

Passwords are secured using bcrypt hashing.

```
Password
 │
 ▼
Passlib
 │
 ▼
bcrypt Hash
 │
 ▼
Store Hash
```

During login:

```
Entered Password
 │
 ▼
Compare with Hash
 │
 ▼
Access Granted
```

The original password can never be recovered from the stored hash.

---

# User Module Workflow

```
User
 │
 ▼
Login
 │
 ▼
Dashboard
 │
 ▼
Profile
 │
 ├── View Profile
 ├── Edit Profile
 ├── Change Password
 └── Logout
```

Admin users additionally have access to:

- View all users
- View user details
- Delete users

---

# Manufacturer Module Workflow

```
Manufacturer
 │
 ▼
Create Manufacturer Profile
 │
 ▼
Store Manufacturer Details
 │
 ▼
View Manufacturer List
 │
 ▼
Update/Delete Manufacturer
```

The manufacturer module stores information about textile manufacturers participating in the platform.

---

# Inventory Module Workflow

```
Manufacturer
 │
 ▼
Add Inventory
 │
 ▼
Inventory Stored
 │
 ▼
View Inventory
 │
 ▼
Update/Delete Inventory
```

Each inventory entry stores:

- Textile Type
- Material
- Quantity
- Waste Category
- Manufacturer

This forms the core inventory management system.

---

# Sustainability Dataset Workflow

A sustainability dataset is integrated into PostgreSQL for future AI analysis.

```
CSV Dataset
 │
 ▼
Pandas
 │
 ▼
Import Script
 │
 ▼
PostgreSQL
 │
 ▼
Dataset APIs
 │
 ▼
React Dataset Pages
```

The dataset contains information about sustainable fashion brands including:

- Sustainability Rating
- Carbon Footprint
- Water Usage
- Material Type
- Certifications
- Recycling Programs

This dataset will later support:

- AI Recommendations
- Sustainability Analytics
- Carbon Footprint Analysis
- Recommendation Engine

---

# API Request Lifecycle

```
React Component
 │
 ▼
Axios API
 │
 ▼
FastAPI Endpoint
 │
 ▼
Authentication
 │
 ▼
Business Logic
 │
 ▼
SQLAlchemy ORM
 │
 ▼
PostgreSQL
 │
 ▼
Return JSON
 │
 ▼
Frontend UI
```

---

# Database Design

Current database tables:

```
users

manufacturers

inventory

sustainability_dataset
```

Relationships

```
Manufacturer
      │
      │ 1
      │
      ▼
Inventory
```

Future relationships

```
Manufacturer
      │
      ▼
Marketplace

Marketplace
      │
      ▼
Recycler

Recycler
      │
      ▼
Orders

Orders
      │
      ▼
AI Recommendation Engine
```

---

# Error Handling

The backend performs validation at every layer.

Validation includes:

- Duplicate Email Check
- Invalid Login Credentials
- Invalid Role Selection
- Missing JWT Token
- Invalid JWT Token
- Unauthorized Access
- Resource Not Found
- Duplicate Dataset Records

Proper HTTP status codes are returned for every failure.



---

# Setup Instructions

## Clone Repository

```bash
git clone <repository-url>
cd Textile-Waste-Intelligence-Platform
```

---

## Backend Setup

Create Virtual Environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Database Migration

```bash
alembic upgrade head
```

Run Backend

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install Dependencies

```bash
npm install
```

Run Frontend

```bash
npm run dev
```

---

# Dataset Import

Place the CSV inside:

```
backend/dataset/
```

Run:

```bash
python scripts/import_dataset.py
```

---

# APIs Developed

## User APIs

* POST /users/register
* POST /users/login
* GET /users/me
* GET /users
* GET /users/{id}
* PUT /users/profile
* PUT /users/change-password
* DELETE /users/{id}

---

## Manufacturer APIs

* POST /manufacturers
* GET /manufacturers
* GET /manufacturers/{id}
* PUT /manufacturers/{id}
* DELETE /manufacturers/{id}

---

## Inventory APIs

* POST /inventory
* GET /inventory
* GET /inventory/{id}
* PUT /inventory/{id}
* DELETE /inventory/{id}

---

## Sustainability Dataset APIs

* GET /dataset
* GET /dataset/{id}
* DELETE /dataset/{id}
* DELETE /dataset

---

# Completed Milestone

## Milestone 1

### Project Initialization

* Project planning
* System architecture
* Database design
* Backend setup
* Frontend setup

### Authentication

* JWT Authentication
* Role-Based Access
* Protected Routes

### Core Modules

* User Management
* Manufacturer Management
* Textile Inventory Management

### Dataset Integration

* Sustainability Dataset Model
* CSV Import Script
* Dataset APIs
* Dataset Frontend

---

# Project Status

## Completed

- Project Initialization
- Database Design
- FastAPI Backend Setup
- React Frontend Setup
- PostgreSQL Integration
- SQLAlchemy ORM
- Alembic Migrations
- JWT Authentication
- Role-Based Authorization
- User Management Module
- Manufacturer Module
- Inventory Module
- Sustainability Dataset Integration

---



---

# Upcoming Milestones

## Milestone 2

* Recycler Module
* Marketplace
* Waste Exchange Workflow
* Request Management
* Recycler Dashboard

## Milestone 3

* AI Recommendation Engine
* Textile Image Classification
* Analytics Dashboard
* Sustainability Insights

## Milestone 4

* Machine Learning Models
* Carbon Footprint Prediction
* Recommendation System
* Advanced Reporting

---

# Future Enhancements

* Image-based Textile Classification
* AI Waste Recommendation Engine
* Marketplace Matching Algorithm
* Carbon Footprint Analytics
* Interactive Dashboards
* Notifications
* Reporting & Export
* Recycler Recommendation Engine

---

# Milestone 2: Material Recognition & Waste Classification

## Week 3 & 4

### Overview

Milestone 2 implements the complete **Material Recognition & Waste Classification** module of the Textile Waste Intelligence Platform.

The module enables users to upload textile images and perform an end-to-end analysis covering:

* Textile material recognition
* Material classification
* Waste categorization
* Recyclability assessment
* Sustainability recommendations
* Analysis history
* Detailed analysis reports
* PDF report generation

The implementation follows the existing full-stack architecture based on **React.js, Axios, FastAPI, SQLAlchemy, PostgreSQL, and AI/ML services**.

The module is designed using a modular service-oriented backend architecture so that image processing, AI inference, waste classification, recyclability assessment, recommendation generation, and report generation remain independently manageable.

---

## Milestone 2 Architecture

```text
                         React Frontend
                               │
                               │ Axios HTTP Request
                               ▼
                      FastAPI Backend API
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
              Authentication        Material Analysis
               JWT + RBAC                 │
                                          ▼
                                 Image Processing Service
                                          │
                                          ▼
                              AI Material Classification
                                          │
                                          ▼
                                Waste Classification
                                          │
                                          ▼
                               Recyclability Assessment
                                          │
                                          ▼
                              Recommendation Generation
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                         ▼                                 ▼
                  PostgreSQL Database                PDF Generator
                         │                                 │
                         └────────────────┬────────────────┘
                                          ▼
                                   Analysis Result
                                          │
                                          ▼
                                   React Frontend
```

---

## End-to-End Material Analysis Workflow

```text
User
 │
 ▼
Upload Textile Image
 │
 ▼
React Frontend
 │
 ▼
Axios API Request
 │
 ▼
FastAPI Backend
 │
 ▼
Validate Image
 │
 ▼
Store Image / Create Analysis Record
 │
 ▼
Image Preprocessing
 │
 ▼
AI Material Classification
 │
 ▼
Waste Classification
 │
 ▼
Recyclability Assessment
 │
 ▼
Recommendation Generation
 │
 ▼
Save Analysis Results
 │
 ▼
Generate PDF Report
 │
 ▼
Return Analysis Result
 │
 ▼
React Analysis Interface
```

---

## AI / ML Module

The AI module provides the intelligence layer for textile image analysis.

### Implemented AI Components

* Textile image preprocessing pipeline
* Image validation and processing
* CNN-based material classification
* Textile material identification
* Waste classification workflow
* AI inference service
* Prediction result processing
* Classification confidence handling
* Integration of AI predictions with recyclability assessment
* Integration of AI results with the recommendation engine

The AI layer is separated from the API layer so that model inference can be handled independently from the FastAPI routes.

---

## AI Material Classification Workflow

```text
Textile Image
     │
     ▼
Image Validation
     │
     ▼
Image Preprocessing
     │
     ▼
CNN Model
     │
     ▼
Feature Extraction
     │
     ▼
Material Prediction
     │
     ▼
Prediction Confidence
     │
     ▼
Material Classification Result
```

The classification result is converted into a structured response and passed to the waste classification and recyclability assessment services.

---

## Material Classification

The material classification component identifies the textile material represented in the uploaded image.

The workflow includes:

* Image input validation
* Image preprocessing
* Feature extraction
* CNN-based classification
* Material prediction
* Prediction confidence
* Structured classification result

The material classification result acts as the primary input for subsequent waste and sustainability analysis.

---

## Waste Classification

The waste classification service determines the appropriate waste category for the analyzed textile.

### Workflow

```text
Material Classification
          │
          ▼
Material Characteristics
          │
          ▼
Waste Classification Service
          │
          ▼
Waste Category
          │
          ▼
Waste Analysis Result
```

The classification result is stored along with the material analysis record and is used by the recyclability assessment module.

---

## Recyclability Assessment

The recyclability assessment module evaluates the analyzed textile and determines its suitability for recycling and other waste-management pathways.

### Assessment Inputs

* Material classification
* Waste category
* Material characteristics
* Recycling suitability
* Available recycling pathways

### Assessment Output

The module generates a structured recyclability result that is passed to the recommendation engine.

```text
Material
   │
   ▼
Waste Category
   │
   ▼
Recyclability Analysis
   │
   ├── Recycling Suitability
   │
   ├── Recommended Handling
   │
   └── Recovery / Reuse Possibility
   │
   ▼
Recyclability Result
```

---

## Recommendation Generation

The recommendation service uses the results of material classification, waste classification, and recyclability assessment to generate suitable textile waste-management recommendations.

### Recommendation Categories

* Recycling recommendations
* Reuse opportunities
* Waste handling suggestions
* Material-specific processing recommendations
* Sustainable disposal guidance
* Waste reduction opportunities

The recommendation result is stored with the material analysis and displayed through the frontend.

---

## Backend Implementation

The Milestone 2 backend is implemented using **FastAPI, SQLAlchemy ORM, Pydantic, JWT authentication, and PostgreSQL**.

### Backend Components

* Material analysis API
* Image upload handling
* Image processing service
* AI inference service
* Material classification service
* Waste classification service
* Recyclability assessment service
* Recommendation generation service
* Analysis history service
* Analysis details service
* PDF report generation service
* Database persistence
* JWT-protected endpoints
* Input validation
* Error handling

The backend follows the same modular structure already established in the project.

```text
backend/
│
├── app/
│   ├── api/
│   │   └── material_analysis.py
│   │
│   ├── models/
│   │   └── material_analysis.py
│   │
│   ├── schemas/
│   │   └── material_analysis.py
│   │
│   ├── services/
│   │   ├── image_analysis.py
│   │   ├── material_classifier.py
│   │   ├── waste_classifier.py
│   │   ├── recyclability.py
│   │   ├── recommendation.py
│   │   └── report_generator.py
│   │
│   └── main.py
│
├── dataset/
└── scripts/
```

---

## Database Integration

Material analysis functionality is integrated with PostgreSQL through SQLAlchemy ORM.

### Analysis Data

The analysis workflow maintains information such as:

* Analysis ID
* User association
* Image information
* Material classification
* Waste classification
* Recyclability result
* Recommendations
* Analysis status
* Analysis timestamp
* Report information

Database migrations are managed using Alembic.

---

## Material Analysis APIs

| Method | Endpoint                                  | Description                                                 |
| ------ | ----------------------------------------- | ----------------------------------------------------------- |
| POST   | `/material-analysis/analyze`              | Upload textile image and perform complete material analysis |
| GET    | `/material-analysis/history`              | Retrieve authenticated user's analysis history              |
| GET    | `/material-analysis/{analysis_id}`        | Retrieve complete details of a specific analysis            |
| GET    | `/material-analysis/report/{analysis_id}` | Generate and download the PDF analysis report               |

All APIs use the existing JWT authentication and role-based authorization architecture.

---

## Frontend Implementation

The React frontend provides the complete user interface for material analysis.

### Implemented Frontend Features

* Textile image upload
* Image preview
* Image validation
* Analysis submission
* Analysis loading state
* Material classification results
* Waste classification results
* Recyclability assessment
* Sustainability recommendations
* Analysis history
* Detailed analysis view
* PDF report download
* Error handling
* API integration using Axios

### Frontend Workflow

```text
User
 │
 ▼
Material Analysis Page
 │
 ▼
Select Textile Image
 │
 ▼
Image Preview
 │
 ▼
Analyze Image
 │
 ▼
Axios Request
 │
 ▼
FastAPI Backend
 │
 ▼
Analysis Result
 │
 ├── Material
 ├── Waste Category
 ├── Recyclability
 └── Recommendations
 │
 ▼
Display Results
 │
 ▼
Download Report
```

---

## Analysis History

The platform maintains the user's previous material analyses.

Users can:

* View previous analyses
* Open individual analysis details
* Review classification results
* Review recyclability results
* View recommendations
* Download individual analysis reports

---

## PDF Reporting

A PDF report is generated for each completed material analysis.

### Report Includes

* Analysis information
* Textile image analysis result
* Material classification
* Waste classification
* Recyclability assessment
* Sustainability recommendations
* Analysis details

The generated report can be downloaded directly through the frontend.

---

## Milestone 2 Complete Outcome

Milestone 2 has been completed with:

* Material classification engine operational
* AI-powered textile image analysis implemented
* Waste categorization workflow completed
* Recyclability assessment implemented
* Recommendation generation integrated
* Material analysis APIs implemented
* Analysis history implemented
* PostgreSQL database integration completed
* React frontend integration completed
* PDF report generation implemented
* JWT-protected analysis workflow completed
* End-to-end textile image analysis workflow completed

# Milestone 3: Sustainability Intelligence & Recommendations

## Week 5 & 6

### Overview

Milestone 3 extends the textile analysis capabilities developed in Milestone 2 into a complete **Sustainability Intelligence & Recommendations** module.

The module combines textile analysis results with the existing sustainability dataset to provide:

* Sustainability intelligence
* Recycling recommendations
* Environmental impact assessment
* Circular economy analytics
* Sustainability indicators
* Sustainability dashboards
* Recommendation summaries

The module integrates directly with the Material Recognition & Waste Classification workflow.

---

## Milestone 3 Architecture

```text
                  Material Analysis
                         │
                         ▼
                Material Classification
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
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
     Recommendation   Environmental   Circular Economy
        Engine        Impact Engine      Analytics
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
              Sustainability Insights
                         │
                         ▼
                FastAPI Sustainability
                       APIs
                         │
                         ▼
                  React Frontend
                         │
                         ▼
             Sustainability Dashboard
```

---

## Sustainability Intelligence Workflow

```text
Material Analysis Result
          │
          ▼
Material + Waste Information
          │
          ▼
Recyclability Information
          │
          ▼
Sustainability Dataset
          │
          ▼
Sustainability Intelligence Engine
          │
          ├───────────────┐
          │               │
          ▼               ▼
Environmental       Circular Economy
Impact Analysis         Analysis
          │               │
          └───────┬───────┘
                  ▼
         Recommendation Engine
                  │
                  ▼
       Sustainability Insights
                  │
                  ▼
       Sustainability Dashboard
```

---

## Sustainability Intelligence Engine

The sustainability intelligence engine combines the output of the material analysis module with sustainability-related information available in the platform.

### Inputs

The engine processes information including:

* Material type
* Waste category
* Recyclability result
* Sustainability rating
* Carbon footprint
* Water usage
* Waste production
* Eco-friendly manufacturing information
* Recycling programs
* Certifications
* Product and market information

These fields are already part of the integrated sustainability dataset.

### Outputs

The intelligence engine produces:

* Sustainability insights
* Environmental indicators
* Recycling opportunities
* Material-specific recommendations
* Circular economy insights
* Sustainability summaries

---

## Recommendation Engine

The recommendation engine provides actionable recommendations based on the material analysis and sustainability information.

### Recommendation Workflow

```text
Material Classification
          │
          ▼
Waste Classification
          │
          ▼
Recyclability Assessment
          │
          ▼
Sustainability Analysis
          │
          ▼
Recommendation Engine
          │
     ┌────┼────┬─────────┐
     │    │    │         │
     ▼    ▼    ▼         ▼
 Recycling Reuse Recovery Disposal
          │
          ▼
   Final Recommendation
```

### Recommendation Categories

* Recycling
* Reuse
* Material recovery
* Sustainable disposal
* Waste reduction
* Circular economy opportunities
* Material-specific handling
* Sustainable processing

---

## Environmental Impact Assessment

The environmental impact assessment module evaluates the environmental characteristics associated with textile materials.

The analysis uses sustainability information including:

* Carbon footprint
* Water usage
* Waste production
* Sustainability rating
* Eco-friendly manufacturing
* Recycling programs

### Environmental Impact Workflow

```text
Sustainability Dataset
          │
          ▼
Material Information
          │
          ▼
Environmental Metrics
          │
     ┌────┼───────────┐
     │    │           │
     ▼    ▼           ▼
 Carbon  Water      Waste
Footprint Usage   Production
     │    │           │
     └────┼───────────┘
          ▼
Environmental Impact Analysis
          │
          ▼
Sustainability Indicators
```

---

## Environmental Metrics

The sustainability analysis provides structured environmental indicators based on the available dataset.

### Carbon Footprint

Carbon footprint information is analyzed to understand the environmental impact associated with textile products and materials.

### Water Usage

Water usage information is incorporated into sustainability analysis to identify materials and products with higher resource requirements.

### Waste Production

Waste production data is analyzed to identify opportunities for waste reduction, recycling, and material recovery.

### Sustainability Rating

Sustainability ratings are incorporated into the overall sustainability assessment to provide a consolidated sustainability perspective.

---

## Circular Economy Analytics

The circular economy analytics module analyzes textile materials from the perspective of reuse, recycling, recovery, and waste reduction.

### Analytics Include

* Material distribution
* Waste category distribution
* Recyclability distribution
* Recycling opportunities
* Reuse opportunities
* Waste reduction insights
* Material recovery opportunities
* Sustainability performance indicators
* Circular economy recommendations

### Circular Economy Workflow

```text
Material Data
     │
     ▼
Waste Data
     │
     ▼
Recyclability Data
     │
     ▼
Sustainability Data
     │
     ▼
Circular Economy Analytics
     │
     ├── Recycling Opportunities
     ├── Reuse Opportunities
     ├── Recovery Opportunities
     └── Waste Reduction
     │
     ▼
Circular Economy Insights
```

---

## Sustainability Dashboard

A dedicated sustainability dashboard provides a centralized view of the sustainability intelligence generated by the platform.

### Dashboard Components

* Sustainability overview
* Material analysis statistics
* Waste classification statistics
* Recyclability insights
* Carbon footprint information
* Water usage information
* Waste production metrics
* Sustainability ratings
* Recycling insights
* Circular economy analytics
* Recommendation summaries

---

## Dashboard Architecture

```text
                    FastAPI Backend
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
       Sustainability  Environmental  Circular
          Insights        Metrics      Analytics
            │             │             │
            └─────────────┼─────────────┘
                          ▼
                  Dashboard API
                          │
                          ▼
                    Axios Client
                          │
                          ▼
                   React Dashboard
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   Sustainability    Environmental     Circular Economy
     Overview           Metrics           Analytics
```

---

## Backend Implementation

Milestone 3 backend functionality is implemented using modular FastAPI services.

### Backend Components

* Sustainability intelligence service
* Recommendation engine
* Environmental impact assessment service
* Circular economy analytics service
* Sustainability metrics processing
* Dataset analysis service
* Dashboard data service
* Recommendation API service
* Environmental analytics service
* Sustainability insights service

The services integrate with the existing SQLAlchemy ORM and PostgreSQL database architecture.

---

## Sustainability APIs

| Method | Endpoint                               | Description                                           |
| ------ | -------------------------------------- | ----------------------------------------------------- |
| GET    | `/sustainability/insights`             | Retrieve sustainability insights                      |
| GET    | `/sustainability/recommendations`      | Retrieve recycling and sustainability recommendations |
| GET    | `/sustainability/environmental-impact` | Retrieve environmental impact analysis                |
| GET    | `/sustainability/circular-analytics`   | Retrieve circular economy analytics                   |
| GET    | `/sustainability/dashboard`            | Retrieve sustainability dashboard data                |

These APIs provide structured data to the React frontend.

---

## Frontend Implementation

The React frontend provides dedicated sustainability interfaces.

### Implemented Features

* Sustainability dashboard
* Sustainability overview
* Environmental impact cards
* Carbon footprint information
* Water usage information
* Waste production metrics
* Sustainability rating display
* Recyclability indicators
* Recycling recommendations
* Circular economy analytics
* Recommendation summaries
* Interactive data visualization
* Backend API integration

The frontend communicates with the sustainability APIs through Axios.

---

## Sustainability Dashboard Workflow

```text
User
 │
 ▼
Sustainability Dashboard
 │
 ▼
Axios API Request
 │
 ▼
FastAPI Sustainability API
 │
 ▼
Sustainability Services
 │
 ├── Intelligence Engine
 ├── Recommendation Engine
 ├── Environmental Analysis
 └── Circular Economy Analytics
 │
 ▼
PostgreSQL / Sustainability Dataset
 │
 ▼
Structured Sustainability Response
 │
 ▼
React Dashboard
 │
 ├── Sustainability Overview
 ├── Environmental Impact
 ├── Recycling Recommendations
 └── Circular Economy Analytics
```

---

## Integration Between Milestone 2 and Milestone 3

Milestone 3 directly consumes the results generated by Milestone 2.

```text
                 MILESTONE 2
                     │
                     ▼
             Textile Image
                     │
                     ▼
          Material Classification
                     │
                     ▼
            Waste Classification
                     │
                     ▼
          Recyclability Assessment
                     │
                     ▼
                 MILESTONE 3
                     │
                     ▼
        Sustainability Intelligence
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
     Recycling   Environmental Circular
   Recommendations Impact       Economy
          │          │          │
          └──────────┼──────────┘
                     ▼
          Sustainability Insights
                     │
                     ▼
            Sustainability Dashboard
                     │
                     ▼
               Final Reports
```

---

## Complete Platform Intelligence Workflow

```text
                         USER
                           │
                           ▼
                  React Web Application
                           │
                           ▼
                     Axios Client
                           │
                           ▼
                    FastAPI Backend
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       JWT Authentication          Business Logic
             │                           │
             │              ┌────────────┼────────────┐
             │              │            │            │
             │              ▼            ▼            ▼
             │        Material       Sustainability  Analytics
             │         Analysis        Intelligence
             │              │            │            │
             │              ▼            ▼            ▼
             │          AI Model   Recommendation  Environmental
             │              │          Engine        Analysis
             │              │            │            │
             │              ▼            ▼            ▼
             │        Waste Analysis   Circular Economy
             │              │             Analytics
             │              │               │
             │              └───────┬───────┘
             │                      │
             └──────────────────────┤
                                    ▼
                             SQLAlchemy ORM
                                    │
                                    ▼
                             PostgreSQL Database
                                    │
                                    ▼
                           Structured API Response
                                    │
                                    ▼
                              React Frontend
                                    │
                       ┌────────────┼────────────┐
                       │            │            │
                       ▼            ▼            ▼
                  Analysis      Reports     Sustainability
                   Results                    Dashboard
```

---

# API Request Lifecycle

The Milestone 2 and Milestone 3 modules follow the same API lifecycle established throughout the application.

```text
React Component
      │
      ▼
Axios API Request
      │
      ▼
FastAPI Endpoint
      │
      ▼
JWT Authentication
      │
      ▼
Request Validation
      │
      ▼
Business Logic / Service
      │
      ▼
AI / Sustainability Processing
      │
      ▼
SQLAlchemy ORM
      │
      ▼
PostgreSQL
      │
      ▼
JSON Response
      │
      ▼
React UI
```

---

# Database Integration

The complete intelligence workflow integrates with the existing PostgreSQL database.

## Core Tables

```text
users
   │
   ├──────────────► manufacturers
   │                       │
   │                       ▼
   │                   inventory
   │
   └──────────────► material_analysis
                            │
                            ▼
                  sustainability analysis


sustainability_dataset
          │
          ▼
sustainability intelligence
          │
          ▼
recommendations
          │
          ▼
environmental analytics
          │
          ▼
circular economy analytics
```

The existing sustainability dataset provides information such as sustainability rating, material type, carbon footprint, water usage, waste production, recycling programs, and certifications.

---

# Security Integration

The Milestone 2 and Milestone 3 modules use the existing security architecture.

### Security Features

* JWT authentication
* Protected API routes
* Role-based authorization
* Authenticated analysis history
* Secure API access
* Request validation
* Unauthorized request handling
* Resource validation
* Error handling

The existing platform supports **Admin, Manufacturer, and Recycler** roles.

---

# Error Handling

The modules implement validation and error handling across the complete request lifecycle.

### Validation Includes

* Invalid image input
* Missing image
* Invalid analysis ID
* Unauthorized request
* Invalid JWT token
* Resource not found
* Invalid request parameters
* Invalid dataset information
* Processing errors
* API failures

Appropriate HTTP status codes are returned by the FastAPI backend.

---

# Reporting and Export

The platform supports report generation for material analysis and sustainability information.

### Reports Include

* Material analysis results
* Waste classification
* Recyclability assessment
* Recommendations
* Sustainability information
* Environmental indicators
* Analysis details

The material analysis workflow supports PDF report generation and download.

---

# Completed Milestones

## Milestone 1 — Project Foundation

### Completed

* Project planning
* System architecture
* Database design
* Backend setup
* Frontend setup
* JWT authentication
* Role-based access control
* Protected routes
* User management
* Manufacturer management
* Textile inventory management
* Sustainability dataset integration
* PostgreSQL integration
* SQLAlchemy ORM
* Alembic migrations
* Dataset APIs
* Dataset frontend

---

## Milestone 2 — Material Recognition & Waste Classification

### Completed

* Textile image upload
* Image processing pipeline
* AI material classification
* CNN-based material recognition
* Waste classification
* Recyclability assessment
* Recommendation generation
* Material analysis APIs
* Analysis history
* Analysis details
* PostgreSQL integration
* SQLAlchemy integration
* React frontend integration
* PDF report generation
* Report download
* JWT-protected analysis workflow
* End-to-end material analysis workflow

---

## Milestone 3 — Sustainability Intelligence & Recommendations

### Completed

* Sustainability intelligence engine
* Sustainability dataset integration
* Recycling recommendation engine
* Reuse recommendations
* Waste management recommendations
* Environmental impact assessment
* Carbon footprint analysis
* Water usage analysis
* Waste production analysis
* Sustainability indicators
* Circular economy analytics
* Recyclability insights
* Sustainability dashboard
* Environmental analytics
* Recommendation APIs
* Sustainability APIs
* Dashboard APIs
* React sustainability interface
* Backend sustainability services
* PostgreSQL integration
* Integration with Milestone 2 analysis results

---

# Current Project Status

## Completed

The Textile Waste Intelligence Platform now provides a complete full-stack workflow covering:

* Secure authentication
* Role-based authorization
* User management
* Manufacturer management
* Textile inventory management
* Sustainability dataset integration
* Textile image analysis
* AI-based material classification
* Waste classification
* Recyclability assessment
* Sustainability recommendations
* Environmental impact analysis
* Circular economy analytics
* Sustainability intelligence
* Interactive sustainability dashboard
* Analysis history
* PDF reporting
* RESTful APIs
* PostgreSQL database integration
* React frontend integration

---

# Overall System Status

```text
Milestone 1
Project Foundation
       │
       ▼
    COMPLETED
       │
       ▼
Milestone 2
Material Recognition &
Waste Classification
       │
       ▼
    COMPLETED
       │
       ▼
Milestone 3
Sustainability Intelligence &
Recommendations
       │
       ▼
    COMPLETED
```

The platform now provides an integrated pipeline from **textile image analysis → material recognition → waste classification → recyclability assessment → sustainability intelligence → recommendations → environmental analysis → circular economy analytics → dashboard and reporting**.
