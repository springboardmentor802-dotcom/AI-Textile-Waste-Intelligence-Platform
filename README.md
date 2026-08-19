# AI Textile Waste Intelligence Platform (SorTexAI)

This project is a comprehensive, AI-powered platform designed to revolutionize textile recycling. By integrating computer vision, material classification, and sustainability intelligence, the platform automates textile sorting, tracks waste diversion, and facilitates a circular economy between recycling facilitators, fashion brands, retailers, and manufacturers.

**Project Status:** Project Completed (Live)  
**Live Deployment URL:** [http://13.235.118.152](http://13.235.118.152)

---

## Notification & Alert System

To keep stakeholders informed in real-time and streamline facility operations, a comprehensive notification module has been integrated into the platform[cite: 1]:

* **Waste Collection Alerts:** Automated notifications for scheduled and pending waste collections[cite: 1].
* **Recycling Opportunity Notifications:** Real-time alerts when new recycling pathways or reuse strategies are identified by the AI[cite: 1].
* **Sustainability Milestone Alerts:** Updates triggered when carbon reduction or waste diversion targets are successfully met[cite: 1].
* **Inventory Warnings:** Alerts for capacity limits, stock thresholds, or processing backlogs[cite: 1].
* **Platform Announcements:** System-wide broadcasts allowing administrators to communicate critical updates to all users[cite: 1].

---

## Project Milestones

### Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup
The foundational architecture, database schemas, role-based access control (RBAC), and dataset integrations have been successfully established.

**Completed Tasks & Features:**
* **Define Project Objectives & Workflows:** Outlined the core user journeys for textile waste intelligence, from sorting to reporting.
* **Design System Architecture & Database Schema:** Designed a scalable schema optimized for embedded role details and flexible textile composition arrays.
* **UI Wireframes & Workflow Planning:** Mapped out the user experience for various stakeholders across the platform channels.
* **Environment Setup:** Successfully initialized the Next.js frontend and FastAPI backend environments.
* **Authentication & Role-Based Access (RBAC):** Implemented secure JWT authentication with dedicated, dynamic dashboard views for Admins, Recycling Facilitators, Sustainability Managers, and Manufacturers.
* **Textile Inventory Management:** Built a fully functional REST API (FastAPI + MongoDB) and React UI to track, add, and manage textile waste batches.
* **Dataset Integration & Mapping:** Core datasets have been identified, mapped, and integrated to power the Computer Vision engine:
  * **DeepFashion & Fashion-MNIST:** Garment recognition and clothing classification.
  * **TIPS & Fabric Image Dataset (Kaggle):** Fabric texture recognition and material composition classification.
  * **Sustainable Fashion Dataset:** Waste categorization and recycling recommendation logic.

### Milestone 2: Week 3 & 4 — Material Recognition & Waste Classification
The computer vision engine was brought online, turning the datasets integrated in Milestone 1 into working classification and recyclability-scoring pipelines.

**Completed Tasks & Features:**
* **Implement Textile Image Analysis Engine:** Built the core computer vision pipeline for processing uploaded garment/fabric images, including garment type, material type, color, texture, and pattern analysis.
* **Build Material Classification Workflows:** Developed end-to-end workflows to classify fabric composition (e.g., Cotton, Polyester, Denim, Wool, Silk, Nylon) from image input.
* **Develop Waste Categorization Models:** Implemented waste condition classification (Reusable, Repairable, Upcyclable, Recyclable, Compostable, Hazardous, Degraded).
* **Create Recyclability Assessment Systems:** Built a weighted circularity scoring system yielding a circularity score, category, and recommended recycling pathway (e.g., Donation, Mechanical Recycling, Chemical Recycling).
* **Generate Waste Classification Reports:** Added exportable PDF and Excel reporting for individual scans, batches, and full scan history.

### Milestone 3: Week 5 & 6 — System Integration, Optimization & Deployment
The platform underwent full system integration, connecting the Next.js frontend seamlessly with the Python/FastAPI backend and live PyTorch computer vision inference pipeline.

**Completed Tasks & Features:**
* **End-to-End System Integration:** Connected frontend user workflows directly to the live FastAPI endpoints and multi-task ResNet-18 vision models.
* **Backend Path & Model Security Optimization:** Resolved production multiprocessing constraints and applied strict security parameters for PyTorch weights loading.
* **Database & Network Resilience:** Hardened MongoDB Atlas connectivity with TLS/SSL handling and secure IP network access management.
* **UI/UX Refinement & Brand Identity:** Customized the user interface with an industrial, high-contrast theme, custom typography layout, and personalized platform branding.

### Milestone 4: Week 7 & 8 — Analytics, Testing & Deployment
The final phase of the project finalized all reporting features, validated system integrity, and transitioned the application to a live cloud environment.

**Completed Tasks & Features:**
* **Built Executive Dashboards:** Implemented final dashboard views tailored for manufacturers, recyclers, and sustainability teams[cite: 1].
* **Added Reports and Visualization Modules:** Integrated advanced data visualization tools including Chart.js and Plotly to render analytics[cite: 1].
* **Implemented Testing and Validations:** Conducted rigorous testing including API validation, end-to-end workflow testing, security testing, and performance optimization[cite: 1].
* **Containerization and Cloud Deployment:** Packaged the application using Docker and deployed the platform using cloud services (live at 13.235.118.152)[cite: 1].
* **Finalized Project Assets:** Prepared final documentation and user guides for the presentation and handover[cite: 1].

---

## Tech Stack

* **Frontend:** React.js, Next.js, Tailwind CSS, Lucide Icons, Chart.js, Plotly[cite: 1]
* **Backend:** Python, FastAPI, Motor (Async MongoDB), JWT/Bcrypt, Pandas, NumPy, Scikit-learn, XGBoost[cite: 1]
* **Database:** PostgreSQL (Primary), MongoDB Atlas (Secondary)[cite: 1]
* **AI & Machine Learning:** PyTorch, TensorFlow, YOLOv8, OpenCV, Pillow, Albumentations, CNN Models, Vision Transformers (ViT), EfficientNet[cite: 1]
* **DevOps & Deployment:** Git, GitHub Actions, Docker, Docker Compose, AWS / Azure[cite: 1]

---

## Local Development Setup

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* MongoDB Atlas / PostgreSQL Account
* Docker (for containerized testing)[cite: 1]

### 1. Backend Setup (FastAPI)
Navigate to the backend directory and set up your Python environment:

```bash
cd backend
python -m venv venv
# On Windows use: venv\Scripts\activate
# On Mac/Linux use: source venv/bin/activate

pip install fastapi uvicorn motor pydantic bcrypt pyjwt python-dotenv certifi torch torchvision pandas scikit-learn pillow xgboost opencv-python
Create a .env file in the backend directory:
Code snippet
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_here
Start the backend server:
Bash
uvicorn main:app --reload
The API will be available at: http://localhost:8000

2. Frontend Setup (Next.js)
Navigate to the frontend directory:
Bash
cd frontend/sortex
npm install
Create a .env.local file in the frontend/sortex directory:
Code snippet
NEXT_PUBLIC_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
Start the development server:
Bash
npm run dev
The dashboard will be available at: http://localhost:3000