# AI Textile Waste Intelligence Platform

An enterprise-grade, full-stack Artificial Intelligence platform designed to automate textile waste material classification, fabric blend recognition, recyclability assessment, sustainability impact calculations, and circular economy inventory management.

---

## 📌 Project Status & Milestones

| Milestone | Status | Description |
| :--- | :---: | :--- |
| **Milestone 1** – Project Setup & Inventory Management | ✅ Completed | User authentication, MongoDB schemas, batch inventory management ledger, REST API structure. |
| **Milestone 2** – AI Material Classification & Computer Vision | ✅ Completed | AITEX dataset processing, ResNet50/MobileNetV3/EfficientNetB0 transfer learning, FastAPI microservice, end-to-end prediction pipeline. |
| **Milestone 3** – Sustainability Intelligence & Multi-Role Enterprise Dashboards | ✅ Completed | Sustainability impact engine, recycling recommendation engine, multi-role enterprise dashboards (Recycling, Sustainability, Manufacturer, Admin), detailed analysis reports. |

---

## 🌍 Project Overview

The **AI Textile Waste Intelligence Platform** bridges computer vision machine learning with industrial sustainability workflows. By analyzing high-resolution images of textile waste, the platform automatically identifies material types (Cotton, Polyester, Wool, Silk, Linen, Denim, Nylon, Rayon, Acrylic, Mixed Fabrics), calculates material confidence scores, evaluates recyclability potential, estimates environmental savings (CO₂ offsets, water savings, landfill diversion), and recommends optimal end-of-life recycling pathways.

### Built With

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios
- **Backend API**: Node.js, Express.js, JWT Authentication, Multer Storage
- **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, OpenCV, Pillow
- **Machine Learning**: TensorFlow 2.x, Keras, NumPy, Scikit-Learn
- **Database**: MongoDB & Mongoose ORM

---

## 🏗️ System Architecture

```
                                      +------------------------------------+
                                      |         React 19 Frontend          |
                                      |     (Vite + Tailwind + Recharts)   |
                                      +-----------------+------------------+
                                                        |
                                            HTTP / REST API Requests
                                                        |
                                      +-----------------v------------------+
                                      |     Node.js / Express.js API       |
                                      |     (JWT Auth & Middleware)        |
                                      +--------+------------------+--------+
                                               |                  |
                       Internal Module Route Calls                AI Proxy Requests
                                               |                  |
           +-----------------------------------+---+         +----v--------------------+
           |                                       |         |  FastAPI Microservice   |
           |  - Sustainability Engine              |         |  (TensorFlow / Keras)   |
           |  - Recommendation Engine              |         +------------+------------+
           |  - Inventory Management Ledger        |                      |
           |  - User & History Management          |             OpenCV Preprocessing
           |                                       |                      |
           +-------------------+-------------------+         +------------v------------+
                               |                             |  TensorFlow ResNet50    |
                               |                             |  Material Inference     |
                   Mongoose Database Calls                   +-------------------------+
                               |
                   +-----------v-----------+
                   |    MongoDB Database   |
                   |   (Atlas / Local)     |
                   +-----------------------+
```

---

## 📁 Project Folder Structure

```
AI-Textile-Waste-Intelligence-Platform/
├── dataset/                        # Textile Dataset (AITEX Weave & Defect Database)
│   ├── AITEX/                      # Raw NODefect_images and Defect_images
│   ├── processed/                  # Processed tensor cache
│   └── metadata/                   # Dataset index metadata
├── docs/                           # Project Documentation & Milestone Reports
│   ├── eda/                        # Generated EDA & Evaluation Plots
│   │   ├── class_distribution.png
│   │   ├── pixel_distribution.png
│   │   ├── color_distribution.png
│   │   ├── resolution_distribution.png
│   │   ├── sample_images.png
│   │   ├── outlier_analysis.png
│   │   ├── training_curves.png
│   │   ├── confusion_matrix.png
│   │   ├── roc_curve.png
│   │   └── prediction_examples.png
│   ├── EDA_Report.md               # Full Exploratory Data Analysis Report
│   ├── preprocessing_report.md     # Data Preprocessing Report
│   ├── training_report.md          # Model Benchmarking & Training Report
│   └── evaluation_report.md        # Model Evaluation & Metrics Report
├── models/                         # Saved Model Artifacts for Deployment
│   ├── textile_model.keras         # Primary trained TensorFlow ResNet50 model
│   ├── model_weights.weights.h5    # Extracted model weights
│   ├── class_labels.json           # Index-to-label map
│   └── prediction_config.json      # Input dimensions & confidence thresholds
├── ml_model/                       # Machine Learning Source Code
│   ├── preprocessing.py            # Reusable data loading, cleaning & split pipeline
│   ├── eda_analysis.py             # Automated EDA script
│   ├── train.py                    # Transfer Learning auto-selection trainer
│   ├── evaluate.py                 # Evaluation & confusion matrix generator
│   ├── inference_pipeline.py       # Standalone Python inference module
│   ├── predictor.py                # Microservice prediction handler
│   ├── main.py                     # FastAPI microservice server
│   ├── run_pipeline.py             # Master pipeline runner script
│   └── requirements.txt            # Python ML dependencies
├── backend/                        # Node.js + Express REST API Server
│   ├── config/                     # Database connection configuration (db.js)
│   ├── controllers/                # Auth, Analysis, Classification, Predict controllers
│   ├── middleware/                 # JWT Auth & Error Handling middleware
│   ├── models/                     # Mongoose schemas (User, Inventory, Analysis, UploadedImage, etc.)
│   ├── recommendation/             # Recycling Recommendation Engine (Controllers, Models, Routes, Services)
│   ├── sustainability/             # Sustainability Intelligence Engine (Controllers, Models, Routes, Services)
│   ├── routes/                     # API endpoint routing (/api/auth, /api/analysis, /api/inventory, etc.)
│   ├── scripts/                    # Test scripts (test_delete_history.js) & visual preprocessors
│   ├── uploads/                    # Temporary uploaded image storage
│   └── server.js                   # Main Express application entrypoint
└── frontend/                       # React 19 Frontend Web Client
    ├── src/
    │   ├── Analysis/               # ImageAnalysisPage, AnalysisResultCard, AnalysisReport, HistoryPage
    │   ├── Authentication/         # Login, Register, Profile, AuthContext, ProtectedRoute
    │   ├── Dashboard/              # Overview, Admin, Recycling Facility, Sustainability Manager, & Manufacturer Dashboards
    │   ├── Home/                   # Landing Page
    │   ├── Inventory/              # Batch Inventory Ledger Dashboard
    │   └── Shared/                 # Navbar, Footer, ErrorBoundary, API Axios instance
    └── package.json                # Frontend dependencies & scripts
```

---

## 🌟 Key Features & Core Engines

### 🧠 1. AI Material Classification Engine
- **Supported Fabrics**: Cotton, Polyester, Wool, Silk, Linen, Denim, Nylon, Rayon, Acrylic, Mixed Fabrics.
- **Deep Transfer Learning**: Backbone fine-tuned with TensorFlow/Keras (ResNet50 architecture).
- **Multi-Class Output**: Returns top predicted material, confidence percentage, top-5 probability breakdown, and preprocessed tensor diagnostics.

### 💧 2. Sustainability Intelligence Engine
- **CO₂ Offset Calculation**: Estimates greenhouse gas emission reductions per kg of waste diverted.
- **Water Savings Estimation**: Calculates freshwater preservation metrics based on material type.
- **Landfill Diversion Impact**: Quantifies mass diverted from municipal solid waste streams.
- **ESG Reporting**: Formats sustainability data into executive compliance metrics.

### ♻️ 3. Recycling Recommendation Engine
- **Automated Routing**: Determines whether a fabric batch should undergo mechanical recycling, chemical recycling, upcycling, or resale based on blend composition and confidence.
- **Purity Assessment**: Identifies high-purity mono-materials versus complex synthetic blends.
- **Fallback Pathways**: Suggests energy recovery or industrial wiping applications when mechanical recycling is non-viable.

### 📊 4. Multi-Role Enterprise Dashboards
- **Executive Admin Dashboard (`/dashboard/admin`)**: System health, API call metrics, model inference confidence trends, and user growth analytics.
- **Recycling Facility Dashboard (`/dashboard/recycling`)**: Sort-line throughput, purity compliance rates, and material stream distribution.
- **Sustainability Manager Dashboard (`/dashboard/sustainability`)**: Carbon footprint reductions, water preservation totals, and ESG milestone tracking.
- **Manufacturer Dashboard (`/dashboard/manufacturer`)**: Recycled fiber substitution rate, eco-design insights, and virgin material displacement metrics.
- **General Overview Dashboard (`/dashboard`)**: Aggregated circular economy key performance indicators.

### 📦 5. Batch Inventory Ledger
- **Batch Registration**: Log incoming textile waste shipments with origin, weight (kg), and preliminary classification.
- **Filtering & Search**: Search inventory records by material, supplier, date, or status.
- **Batch Editing & Removal**: Update batch details or archive processed shipments.

---

## 📊 Dataset Information & Preprocessing

- **Dataset**: AITEX Textile Defect & Weave Database (10 Mapped Material Classes).
- **Image Integrity**: MD5 checksum verification to ensure 0 duplicate images and 0 corrupted files.
- **Preprocessing Pipeline** (`ml_model/preprocessing.py`):
  1. **Integrity Filter**: OpenCV decoding check.
  2. **Deduplication**: MD5 hash indexing.
  3. **Resizing**: Standardized input dimensions $(224 \times 224 \times 3)$.
  4. **Normalization**: Min-Max feature scaling to $[0.0, 1.0]$.
  5. **Augmentation**: Rotation ($\pm 20^\circ$), horizontal/vertical flips, zoom ($\pm 15\%$), and contrast shifts.
  6. **Stratified Split**: 70% Training, 15% Validation, 15% Testing.

---

## 🔌 Backend API Reference

### 🔐 Authentication (`/api/auth`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account. |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token. |
| `/api/auth/profile` | `GET` | Protected | Fetch authenticated user profile details. |
| `/api/auth/profile` | `PUT` | Protected | Update user profile information. |

### 🤖 AI Material Analysis (`/api/analysis`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/analysis/classify` | `POST` | Protected | Upload image file, process via AI model, and save classification result. |
| `/api/analysis/materials` | `GET` | Protected | Fetch list of supported fabric materials and baseline properties. |
| `/api/analysis/history` | `GET` | Protected | Fetch authenticated user's prediction history. |
| `/api/analysis/dashboard-stats` | `GET` | Protected | Retrieve aggregated circular economy & classification statistics. |
| `/api/analysis/:id` | `GET` | Protected | Fetch detailed single analysis record by ID. |
| `/api/analysis/:id` | `DELETE` | Protected | Delete analysis record by ID. |

### 📈 Microservice Inference Proxy (`/api/predict` & `/api/upload`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/predict` | `POST` | Public / Proxy | Send image to FastAPI microservice and return prediction JSON. |
| `/api/upload` | `POST` | Public / Proxy | Save uploaded image file to server storage and record database metadata. |
| `/api/history` | `GET` | Public / Proxy | Retrieve overall classification history stream. |

### 📦 Inventory Ledger (`/api/inventory`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/inventory` | `POST` | Protected | Register new textile waste batch. |
| `/api/inventory` | `GET` | Protected | List registered textile waste batches. |
| `/api/inventory/:id` | `GET` | Protected | Get single inventory batch by ID. |
| `/api/inventory/:id` | `PUT` | Protected | Update inventory batch details. |
| `/api/inventory/:id` | `DELETE` | Protected | Delete inventory batch record. |

### 🌿 Sustainability Engine (`/api/sustainability`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/sustainability/analyze` | `POST` | Public / System | Analyze environmental impact (CO₂, water, landfill) for fabric sample. |
| `/api/sustainability/history` | `GET` | Public / System | Retrieve past sustainability impact evaluation records. |
| `/api/sustainability/history/:id` | `GET` | Public / System | Fetch single sustainability analysis record by ID. |
| `/api/sustainability/health` | `GET` | Public | Sustainability module health check. |

### ♻️ Recycling Recommendation Engine (`/api/recommendation`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/recommendation/evaluate` | `POST` | Public / System | Evaluate optimal end-of-life recycling pathway for fabric material. |
| `/api/recommendation/history` | `GET` | Public / System | Retrieve history of recycling recommendations. |
| `/api/recommendation/health` | `GET` | Public | Recommendation module health check. |

### 🩺 System Health (`/api/health`)
| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Check Express backend connectivity and database status. |

---

## 💻 Frontend Client Routes & Pages

| Route Path | Component View | Description |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Public platform overview, feature highlights, and call to action. |
| `/login` | `Login.jsx` | User authentication login screen. |
| `/register` | `Register.jsx` | User registration screen. |
| `/profile` | `Profile.jsx` | User profile management page. |
| `/analysis` | `ImageAnalysisPage.jsx` | Drag-and-drop textile image upload, inference progress, preprocessed preview, material prediction card, confidence gauge, and top-5 breakdown. |
| `/report/:id` | `AnalysisReport.jsx` | Comprehensive report page for a specific analysis record with composition breakdown and sustainability recommendations. |
| `/history` | `HistoryPage.jsx` | Searchable, filterable archive of past classifications with deletion and report view links. |
| `/dashboard` | `Dashboard.jsx` | Main platform analytics overview dashboard. |
| `/dashboard/recycling` | `RecyclingFacilityDashboard.jsx` | Specialized sorting, throughput, and material purity metrics dashboard. |
| `/dashboard/sustainability` | `SustainabilityManagerDashboard.jsx` | Carbon offset, water savings, and ESG performance tracking dashboard. |
| `/dashboard/manufacturer` | `ManufacturerDashboard.jsx` | Eco-design, recycled material substitution, and virgin fiber displacement dashboard. |
| `/dashboard/admin` | `AdminDashboard.jsx` | Platform admin dashboard monitoring model health, total API calls, and user activity. |
| `/inventory` | `InventoryDashboard.jsx` | Batch inventory ledger management interface. |

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Environment Setup

```bash
# Clone the repository
git clone https://github.com/sailokesh365/AI-Textile-Waste-Intelligence-Platform.git
cd AI-Textile-Waste-Intelligence-Platform

# Create and activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install Python dependencies
pip install -r ml_model/requirements.txt
pip install matplotlib seaborn scikit-learn
```

### 3. Run Training & Evaluation Pipeline (Optional)

```bash
# Execute dataset preparation, training, and evaluation
python ml_model/run_pipeline.py
```

### 4. Start Python FastAPI Microservice

```bash
cd ml_model
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*FastAPI microservice runs on `http://127.0.0.1:8000` (Docs available at `/docs`).*

### 5. Start Backend Node.js Express Server

```bash
cd ../backend
npm install
npm start
```
*Express backend runs on `http://localhost:5000`.*

### 6. Start Frontend React Web Client

```bash
cd ../frontend
npm install
npm run dev
```
*Vite dev server runs on `http://localhost:5173`.*

---

## 🔄 End-to-End Prediction Flow

```
  [User Uploads Image] ──> [React Frontend UI (/analysis)]
                                  │
                       [HTTP POST /api/analysis/classify]
                                  │
                       [Node.js Express Backend]
                                  │
                      [Forward to FastAPI /predict]
                                  │
                     [OpenCV Image Preprocessing (224x224)]
                                  │
                     [TensorFlow ResNet50 Model Inference]
                                  │
                   [Top-5 Probabilities & Confidence Score]
                                  │
                 [Sustainability & Recommendation Assessment]
                                  │
                   [Save Result Record to MongoDB Database]
                                  │
                 [Return JSON Response & Render UI Report]
```

---

## 🧪 Testing & Utilities

- **Backend History Deletion Script**: `backend/scripts/test_delete_history.js`
- **Visual Preprocessing Tool**: `backend/scripts/preprocess_visual.py`
- **FastAPI Endpoint Diagnostics**: Access OpenAPI documentation at `http://127.0.0.1:8000/docs`.

---

## 🔮 Future Roadmap

- **Hyperspectral Near-Infrared (NIR) Spectroscopy**: Combine RGB computer vision with NIR sensor data for ultra-high accuracy polymer blend quantification.
- **Edge Deployment**: Quantize model to TensorFlow Lite (TFLite) and ONNX formats for handheld industrial sorting equipment.
- **Defect & Damage Segmentation**: Implement YOLOv8-Seg / Mask R-CNN for localized fabric damage and contamination detection.

---

## 👥 Authors & License

- **Author**: Sai Lokesh Reddy Pannala
  - *B.Tech – Information Technology*
  - *ACE Engineering College*
  - *Infosys Springboard Internship Project*
- **License**: MIT License
