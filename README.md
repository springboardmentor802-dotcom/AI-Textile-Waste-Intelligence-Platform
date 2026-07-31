# ♻️ AI Textile Waste Intelligence Platform

An AI-powered web application for intelligent textile waste management that combines secure inventory management, deep learning-based material recognition, waste classification, recyclability assessment, and sustainability recommendations.

---

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

---

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, React Router DOM, CSS

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt), python-jose (JWT)

**AI & Machine Learning:** TensorFlow, Keras, NumPy, Pillow

**Database:** PostgreSQL

**Tools:** Git, GitHub, VS Code, pgAdmin 4
---

# 📁 Project Structure

```
AI-Textile-Waste-Intelligence-Platform/

├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── data/
│   │   └── App.jsx
│
├── Backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── inventory.py
│   │   └── predict.py
│   │
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── main.py
│
├── Dataset/
├── Models/
├── Notebook/
├── Docs/
└── README.md
```

---

# ✨ Features

## 🔐 Authentication & Security

- User Registration
- Secure Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- Role-Based Access Control (RBAC)

---

## 📦 Inventory Management

- Add Inventory
- View Inventory
- Update Inventory
- Delete Inventory
- Dashboard Integration

---

## 🤖 AI Material Recognition

- Textile Image Upload
- CNN-based Material Classification
- Image Preprocessing
- Confidence Score
- Top-3 Predictions

Supported Materials

- Cotton
- Denim
- Polyester
- Silk
- Wool
- Blended Fabric

---

## ♻️ Waste Classification

Based on the predicted material, the system automatically provides:

- Waste Category
- Recyclability Status
- Recycling Recommendation

---

## 📄 Reports

- Single Prediction PDF Report
- Batch Prediction PDF Report
- Professional Report Layout
- Downloadable Reports

---

# ✅ Milestone 1 (Week 1 & Week 2)
## Authentication & Access Control

### Tasks Completed

- Designed project architecture
- Connected React frontend with FastAPI backend
- Configured PostgreSQL database
- Implemented user registration
- Implemented secure login
- Password hashing using bcrypt
- JWT Authentication
- Protected Routes
- Role-Based Access Control (RBAC)
- Built Inventory CRUD APIs
- Connected frontend with backend APIs
- Tested authentication workflow

### Outcomes

- Secure authentication system operational
- JWT-based authorization functional
- PostgreSQL integration completed
- Protected dashboard implemented
- User management successfully completed

---

# ✅ Milestone 2 (Week 3 & Week 4)
## Material Recognition & Waste Classification

### Tasks Completed

### ✔ Textile Image Analysis Engine

- Implemented textile image upload
- Added image validation
- Image preprocessing
- Image resizing
- Image normalization

### ✔ Material Classification Workflow

- Built CNN model using TensorFlow
- Trained fabric classification model
- Integrated trained model with FastAPI
- Developed real-time prediction API
- Displayed prediction confidence
- Generated Top-3 predictions

### ✔ Waste Categorization

- Classified textile waste
- Generated waste category
- Created material information mapping

### ✔ Recyclability Assessment

- Implemented recyclability assessment
- Generated recycling recommendations
- Displayed sustainability information

### ✔ Prediction Reports

- Professional Single Prediction PDF
- Batch Prediction PDF
- Material Summary
- Confidence Score
- Waste Category
- Recycling Recommendation
- Top Predictions

### Outcomes

- Textile Image Analysis Engine operational
- Material Classification Workflow functional
- CNN model integrated successfully
- Waste Categorization completed
- Recyclability Assessment operational
- AI Prediction API functional
- PDF Report Generation completed
- End-to-End AI workflow tested successfully

---

# 🔐 API Endpoints

| Method | Endpoint | Description | Authentication |
|---------|----------|-------------|---------------|
| GET | / | Health Check | No |
| POST | /register | Register User | No |
| POST | /login | User Login | No |
| GET | /inventory | Get Inventory | Yes |
| POST | /inventory | Add Inventory | Yes |
| PUT | /inventory/{id} | Update Inventory | Yes |
| DELETE | /inventory/{id} | Delete Inventory | Yes |
| POST | /predict | Predict Textile Material | Yes |

---

# 🚀 System Workflow

```
User Login
      │
      ▼
Upload Textile Image
      │
      ▼
Image Preprocessing
      │
      ▼
CNN Material Classification
      │
      ▼
Material Prediction
      │
      ▼
Waste Classification
      │
      ▼
Recyclability Assessment
      │
      ▼
Recycling Recommendation
      │
      ▼
Generate PDF Report
```

---

# 🚀 Getting Started

## Backend

```bash
cd Backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend URL

```
http://localhost:8000
```

Swagger API

```
http://localhost:8000/docs
```

---

## Frontend

```bash
cd Frontend

npm install

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🔜 Upcoming Features (Milestone 3)

- Sustainability Intelligence Engine
- Recycling Recommendation Engine
- Environmental Impact Assessment
- Circular Economy Analytics
- Sustainability Dashboard

---

# 👩‍💻 Contributors

- Rajashree Tharmalingam
- Infosys Internship Project Team

---

# 📄 License

Developed as part of the Infosys Internship Program.

This project is intended for educational and internship purposes.
