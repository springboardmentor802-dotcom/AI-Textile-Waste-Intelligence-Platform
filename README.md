# ♻️ AI Textile Waste Intelligence Platform

An AI-powered web application for intelligent textile waste management. The platform combines Artificial Intelligence, Computer Vision, inventory management, textile material classification, defect detection, recyclability assessment, sustainability analysis, recovery insights, reporting, and role-based access control into one integrated system.

---

## 📌 Project Overview

The AI Textile Waste Intelligence Platform is designed to support the identification, management, and sustainable recovery of textile waste.

The platform allows users to:

- Register and securely log in
- Access features based on their assigned role
- Manage textile waste inventory
- Upload textile images
- Identify textile materials using a CNN model
- Detect textile defects and assess condition
- View top predictions and confidence scores
- Classify textile waste
- Assess recyclability and reuse potential
- Generate recycling and recovery recommendations
- Analyze environmental impact
- Calculate circular economy scores
- Track prediction history
- View sustainability and recovery insights
- Generate PDF reports
- Receive notifications
- View role-specific dashboards and reports

---

## 🎯 Project Objectives

1. Automate textile material identification using AI.
2. Support textile waste classification and recovery decisions.
3. Provide information about textile defects and condition.
4. Assess recyclability and reuse potential.
5. Provide sustainability and environmental insights.
6. Support circular economy analysis.
7. Manage textile waste inventory digitally.
8. Provide different functionality for different user roles.
9. Maintain prediction and inventory history.
10. Provide reports and analytics for decision-making.

---

## 👥 User Roles

### 👨‍💼 Administrator
- User management
- Role management
- Platform-level analytics
- System insights
- Administrative reports

### 🏭 Recycling Facility Operator
- Manage textile inventory
- Record textile waste batches
- Upload textile images
- Perform AI predictions
- View material information
- View defect/condition information
- View recyclability information
- View recovery recommendations
- Review prediction history
- Access operational reports

### 🌱 Sustainability Manager
- Sustainability overview
- Environmental impact analysis
- Circular economy insights
- Waste diversion information
- Carbon reduction information
- Recovery insights
- Sustainability reports

### 🧵 Textile Manufacturer
- View textile/material information
- View recovery insights
- Analyze material recovery potential
- View manufacturer recovery information
- Access relevant reports

---

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- React Router DOM
- CSS
- Reusable React components

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Passlib
- bcrypt
- python-jose
- JWT

### AI / Machine Learning
- TensorFlow
- Keras
- NumPy
- Pillow
- CNN

### Database
- PostgreSQL

### Development Tools
- Git
- GitHub
- Visual Studio Code
- pgAdmin 4

---

## 🔐 Authentication & Security

- User registration
- Secure login
- Password hashing using bcrypt
- JWT token authentication
- Protected routes
- Role-Based Access Control (RBAC)
- Role-specific navigation
- Backend permission validation

---

## 📦 Inventory Management

The Inventory module is used to record and manage textile waste.

Features include:

- Add inventory
- View inventory
- Update inventory
- Delete inventory
- Track textile material
- Track quantity
- Track source
- Track condition
- Track collection information
- Inventory analytics
- Integration with the overall workflow

---

## 🤖 AI Textile Prediction

The platform uses a CNN-based model built using TensorFlow/Keras for textile material classification.

### Prediction Workflow

1. The image is uploaded from the React frontend.
2. The image is sent to the FastAPI backend through an API request.
3. The backend validates the uploaded image.
4. The image is preprocessed.
5. The image is resized to the required input size.
6. Pixel values are normalized.
7. The processed image is passed to the trained CNN model.
8. The model predicts the textile material.
9. Prediction confidence is calculated.
10. The prediction result is returned to the frontend.
11. Material, defect, recovery, and sustainability information is displayed.

### Supported Fabric Classes

- Cotton
- Denim
- Polyester
- Silk
- Wool
- Blended Fabric

---

## 🔎 Defect Detection

The prediction workflow also provides textile defect/condition analysis.

- Defect prediction
- Defect confidence
- Detected defect status
- Textile condition information

The defect/condition information can support recovery and recycling decisions.

---

## 📊 Top-3 Predictions

The platform displays the top three model predictions with confidence scores.

```text
Uploaded Image
      ↓
CNN Model
      ↓
Prediction 1 + Confidence
Prediction 2 + Confidence
Prediction 3 + Confidence
```

---

## 📚 Material Information

After classification, the platform provides:

- Fabric class
- Material type
- Material description
- Common uses

---

## ♻️ Waste Classification & Recovery

The platform provides:

- Waste category
- Recyclability
- Reuse potential
- Recovery potential
- Recommended recovery action

Possible recovery actions include:

- Fiber Recycling
- Mechanical Recycling
- Fabric Reuse
- Donation
- Other suitable recovery methods

---

## 🌱 Sustainability Intelligence

### Sustainability Overview

- Circularity Score
- Recovery Category
- Environmental Score
- Material Type
- Overall sustainability summary

### Environmental Impact

- CO₂ emissions avoided
- Water saved
- Energy saved
- Landfill waste diverted

### Circular Economy Score

| Factor | Weight |
|---|---:|
| Material Recyclability | 35% |
| Reuse Potential | 20% |
| Material Condition | 20% |
| Environmental Benefit | 15% |
| Processing Feasibility | 10% |

The application displays the overall score, recovery category, individual factor scores, and weighted breakdown.

---

## 📚 Prediction History & AI Activity

The platform maintains prediction-related records for traceability.

Features include:

- Previous predictions
- Prediction results
- Material information
- Defect/condition information
- Confidence information
- AI activity
- Prediction-related analytics

---

## 📈 Processing & Recovery Insights

The platform provides:

- Processing information
- Recovery information
- Material recovery
- Recovery potential
- Recyclability
- Manufacturer recovery insights

---

## 📄 Reports & PDF Reporting

Reports can include:

- Inventory information
- AI prediction information
- Material information
- Defect information
- Recyclability information
- Recovery information
- Sustainability information
- Environmental impact
- Circular economy information
- Role-specific insights

PDF reports can include:

- Prediction result
- Confidence score
- Defect information
- Material information
- Top-3 predictions
- Sustainability overview
- Environmental impact
- Circular Economy Score
- Recycling recommendation
- Recovery information

---

## 🔔 Notifications

The platform includes:

- Notification API routes
- Notification service
- Email service
- Frontend notification support

---

## 👤 Profile & Settings

### Profile
Provides basic user profile information.

### Settings
Provides simple application and account-related settings.

---

## 🎨 UI/UX Features

- Role-wise sidebar navigation
- Role-specific dashboards
- Consistent project color palette
- Improved dashboard layouts
- Improved spacing and alignment
- Responsive design
- Reusable components
- Back-to-dashboard navigation
- Improved report layouts
- Improved inventory interface
- Improved profile interface
- Improved settings interface

### Reusable Analytics Components

- Donut Chart
- Grouped Bar Chart
- Horizontal Bar Chart
- Stacked Bar Chart
- Trend Chart
- Waste Bar Chart
- Reusable Chart Tooltip

---

## 🔄 Complete AI Workflow

```text
User Login
     │
     ▼
Upload Textile Image
     │
     ▼
Frontend Sends API Request
     │
     ▼
FastAPI Backend
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
     ├──────────────► Top-3 Predictions
     │
     ▼
Material Prediction
     │
     ▼
Defect / Condition Analysis
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
Recovery Recommendation
     │
     ▼
Sustainability Analysis
     │
     ├──────────────► Environmental Impact
     ├──────────────► Circular Economy Score
     └──────────────► Sustainability Overview
     │
     ▼
Prediction History
     │
     ▼
PDF Report
```

---

## 👥 Role-Based Workflow

```text
                 User Login
                     │
                     ▼
              Authentication
                     │
                     ▼
                User Role
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
     Admin        Operator      Manager
       │             │             │
       ▼             ▼             ▼
     Users       Inventory    Sustainability
   Analytics     AI Prediction   Analytics
    Reports       History         Reports
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ▼
                Manufacturer
                     │
                     ▼
             Recovery Insights
```

---

# ✅ Milestone 1 — Project Initialization & Authentication

## Week 1 & Week 2

Completed:

- Project architecture
- Frontend and backend setup
- React and FastAPI integration
- PostgreSQL database configuration
- User registration and login
- bcrypt password hashing
- JWT authentication
- Protected routes
- Role-Based Access Control
- Inventory CRUD APIs
- Frontend/backend API integration
- Authentication workflow testing

---

# ✅ Milestone 2 — AI Material Recognition

## Week 3 & Week 4

Completed:

- Textile image upload and validation
- Image preprocessing, resizing, and normalization
- TensorFlow/Keras CNN model
- FastAPI model integration
- Real-time prediction API
- Confidence scores
- Top-3 predictions
- Waste categorization
- Material information mapping
- Recyclability assessment
- Recycling recommendations
- Prediction PDF reporting

---

# ✅ Milestone 3 — Sustainability Intelligence

## Week 5 & Week 6

### Sustainability Intelligence
- Sustainability Overview
- Circularity Score
- Recovery Category
- Environmental Score
- Material Type
- Overall sustainability summary

### Environmental Impact
- CO₂ emissions avoided
- Water saved
- Energy saved
- Landfill diversion

### Circular Economy Analytics
- Material Recyclability — 35%
- Reuse Potential — 20%
- Material Condition — 20%
- Environmental Benefit — 15%
- Processing Feasibility — 10%

### Recycling Recommendation Engine
- Primary recovery method
- Waste category
- Reuse potential
- Recommended actions

### Enhanced Prediction Experience

```text
Image Upload
      ↓
Preprocessing
      ↓
CNN Prediction
      ↓
Defect Detection
      ↓
Material Information
      ↓
Top-3 Predictions
      ↓
Sustainability Analysis
      ↓
Recycling Recommendation
      ↓
PDF Report
```

### Milestone 3 Outcomes

- Sustainability analysis integrated with AI prediction
- Environmental impact assessment implemented
- Circular Economy Score implemented
- Weighted sustainability factors displayed
- Recycling recommendation workflow implemented
- Sustainability information integrated into prediction results
- PDF reporting extended with sustainability information

---

# ✅ Milestone 4 — Platform Enhancement & Role-Based Features

## Week 7 & Week 8

Milestone 4 focused on extending the platform beyond the core AI prediction workflow.

### Role-Based Dashboards
- Administrator
- Recycling Facility Operator
- Sustainability Manager
- Textile Manufacturer

### Administrator Features
- User management
- Role management
- Platform analytics
- System-level insights
- Administrative reports

### Inventory Enhancements
- Improved inventory interface
- Inventory information
- Batch-related information
- Material tracking
- Quantity tracking
- Source information
- Condition information
- Inventory analytics

### AI Activity & History
- AI activity
- Prediction history
- Material prediction results
- Defect/condition information
- Prediction confidence
- Prediction-related analytics

### Recovery & Processing Insights
- Processing insights
- Recovery insights
- Material recovery information
- Recovery potential
- Recyclability information
- Manufacturer recovery insights

### Sustainability Enhancements
- Sustainability Overview
- Carbon Reduction
- Waste Diversion
- Environmental Impact
- Circular Economy information
- Recovery insights

### Reports & Analytics
- Role-specific reports
- Sustainability reports
- Inventory-related reports
- Recovery-related reports
- Platform analytics
- PDF reports
- Reusable analytics charts

### Notifications
- Notification routes
- Notification service
- Email service
- Frontend notification support

### Profile & Settings
- User profile
- Profile information
- Application settings

### UI/UX Improvements
- Role-wise sidebar navigation
- Consistent color palette
- Improved dashboard layouts
- Improved spacing and alignment
- Reusable chart components
- Back-to-dashboard navigation
- Improved reports UI
- Improved inventory UI
- Improved profile UI
- Improved settings UI

### Milestone 4 Outcomes

- Role-based dashboards implemented
- Administrator functionality implemented
- Inventory module enhanced
- AI activity and prediction history enhanced
- Recovery and processing insights added
- Sustainability analytics expanded
- Reports and analytics enhanced
- Notifications integrated
- Profile and settings added
- Sidebar navigation improved
- Reusable chart components added
- Overall UI/UX improved

---

# 🔐 API Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/` | Health Check | No |
| POST | `/register` | Register User | No |
| POST | `/login` | User Login | No |
| GET | `/inventory` | Get Inventory | Yes |
| POST | `/inventory` | Add Inventory | Yes |
| PUT | `/inventory/{id}` | Update Inventory | Yes |
| DELETE | `/inventory/{id}` | Delete Inventory | Yes |
| POST | `/predict` | Textile Prediction | Yes |
| GET | `/history` | Prediction History | Yes |
| `/admin/...` | Administrator APIs | Admin functionality | Admin |
| `/notifications/...` | Notification APIs | Notification functionality | Yes |

Additional backend routes support role-specific functionality and application services.

---

# 📁 Project Structure

```text
AI-Textile-Waste-Intelligence-Platform/
│
├── Backend/
│   ├── routes/
│   │   ├── auth.py
│   │   ├── inventory.py
│   │   ├── predict.py
│   │   ├── history.py
│   │   ├── admin.py
│   │   └── notifications.py
│   │
│   ├── services/
│   │   ├── email_service.py
│   │   └── notification_service.py
│   │
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── .env.example
│
├── Frontend/
│   └── src/
│       ├── components/
│       ├── constants/
│       ├── pages/
│       ├── services/
│       └── utils/
│
├── Notebook/
│   ├── dataset_eda.ipynb
│   ├── model_training.ipynb
│   └── model_training_old.ipynb
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install:

- Python
- Node.js
- npm
- PostgreSQL
- Git

## Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scriptsctivate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Application Testing Workflow

```text
Register User
      ↓
Login
      ↓
Role-Based Dashboard
      ↓
Inventory
      ↓
Upload Textile Image
      ↓
AI Prediction
      ↓
Material + Defect Result
      ↓
Recyclability
      ↓
Recovery Recommendation
      ↓
Sustainability Analysis
      ↓
Prediction History
      ↓
Reports
```

---

# 🔮 Future Enhancements

- Expand the AI training dataset with more textile types
- Improve model accuracy using larger real-world datasets
- Improve defect and contamination detection
- Add additional textile material classes
- Add real-time camera-based textile inspection
- Improve batch analysis
- Add large-scale textile processing support
- Cloud deployment
- Multi-facility support
- Advanced predictive analytics
- Further AI model validation and optimization

---

# 📌 Project Status

### Completed

- Authentication
- JWT security
- Role-Based Access Control
- Inventory Management
- AI Textile Classification
- Defect Detection
- Top-3 Predictions
- Waste Classification
- Recyclability Assessment
- Recycling Recommendations
- Sustainability Intelligence
- Environmental Impact
- Circular Economy Score
- Prediction History
- Recovery Insights
- Processing Insights
- Role-Based Dashboards
- Administrator Module
- Reports
- PDF Reporting
- Notifications
- Profile
- Settings
- UI/UX Enhancements
- Reusable Analytics Charts

---

# 📄 License

Developed as part of the **Infosys Internship Program**.

This project is intended for educational and internship purposes.
