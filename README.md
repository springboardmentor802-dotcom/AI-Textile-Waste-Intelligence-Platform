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

(Future Module)
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

# Current Project Status

**Milestone 1:** ✅ Completed

The project currently includes a secure authentication system, role-based access control, user management, manufacturer management, inventory management, sustainability dataset integration, PostgreSQL database integration, RESTful APIs, and a React frontend.

The next phase of development focuses on recycler workflows, marketplace functionality, and AI-powered textile waste intelligence.


