# AI-Textile-Waste-Intelligence-Platform

**Author:** Durgesh Nandini  
**Project Verification State:** Milestone 1 (`dn28github`)

Core Platform: Authentication & RBAC Status
| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **User Registration & Login** | Custom FastAPI routes utilizing Passlib & Pydantic validation schemas. | **✔️ Completed** |
| **Password Hashing Security** | Strict one-way cryptography using the **Bcrypt** algorithm. No plain text storage. | **✔️ Completed** |
| **Stateless JWT Generation** | Backend issues cryptographically signed JSON Web Tokens containing role claims. | **✔️ Completed** |
| **Global Network Interceptor**| Custom Axios Request Interceptor automatically injects `Bearer <token>` to headers. | **✔️ Completed** |
| **Role-Based Access Control** | Frontend layout handles dynamic visual masking based on active parsed localStorage roles. | **✔️ Completed** |
| **Multi-Tenant Data Isolation**| SQL queries dynamically execute `filter(Inventory.user_id == current_user.id)` to block leaks. | **✔️ Completed** |
| **Relational Database Sync** | Dual-end back-populates ORM mappings successfully synced with live PostgreSQL server. | **✔️ Completed** |
| **Clean UI Architecture** | Professional standard interface layout deployed across all custom dashboard panels. | **✔️ Completed** |

Textile Waste Inventory Management Status
| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **Waste Registration Form** | Dynamic React inputs capturing Batch ID, Fabric Type, Quantity, and Material Condition. | **✔️ Completed** |
| **Strict Data Validation** | Backend constraints enforced via specialized SQL Enums for Fabric Types and Material States. | **✔️ Completed** |
| **Live Database Auditing** | Data committed via forms is verified live inside the PostgreSQL `inventory` table via pgAdmin 4. | **✔️ Completed** |
| **Lifecycle State Machine** | Automatic workflow state assignment tracking parameters starting from a **'Pending'** state. | **✔️ Completed** |
  
**Project Verification State:** Milestone 2 (`dn28github`)

---

## Core Platform: Material Recognition & Waste Classification

| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **Textile Image Analysis Engine** | Uses **OpenCV** to analyze fabric colors and patterns, along with **PyTorch** and **TensorFlow** to process images. | **✔️ Completed** |
| **Material Classification Workflows** | Automatically predicts the main fabric type (Cotton, Denim, Wool, Silk) and fiber mix percentages from the image. | **✔️ Completed** |
| **Waste Categorization Models** | Checks fabric wear, texture, and stains to group textile waste into recycling categories. | **✔️ Completed** |
| **Recyclability Assessment Systems** | Calculates a recyclability score and estimates saved CO₂ and water using real fashion dataset metrics. | **✔️ Completed** |
| **Live Dynamic Dashboard UI** | Built with **React** to show live image previews, dynamic progress bars, and real-time scorecards. | **✔️ Completed** |

### 🛠️ Implementation Brief & Technical Overview

#### 1. Implement Textile Image Analysis Engine
* **Visual & Texture Feature Extraction:** `backend/app/ml/image_analysis.py` reads uploaded fabric images to detect colors using HSV values and analyzes fabric patterns using OpenCV's edge detection tools.
* **Stream Handling:** Connected to the FastAPI `/auth/analytics/upload-image` route to process uploaded images in real time.

#### 2. Build Material Classification Workflows
* **Fiber Blend Prediction:** Automatically estimates the main fabric type and fiber mix percentages (like Cotton, Polyester, and Elastane) based on image color and texture.
* **Quality Grade Assessment:** Assigns a quality grade (Grade A or Grade B) to the fabric using dataset rules.

#### 3. Develop Waste Categorization Models
* **Surface Condition Analysis:** Scans the fabric to measure surface damage percentages and detect stains or wear.
* **Automated Categorization:** Automatically groups samples into recycling categories like *High-Grade Recyclable*, *Recyclable / Upcyclable*, or *Low-Grade Recyclable*.

#### 4. Create Recyclability Assessment Systems
* **Circularity Index Scoring:** Gives an overall recyclability score (0–100%) based on fabric blend complexity and physical damage.
* **Actionable Recommendations:** Recommends the best recycling or disposal method, such as *Mechanical Shredding*, *Chemical Recycling*, or *Downcycling*.
* **Environmental Footprint Estimation:** Fetches data from the fashion dataset to calculate saved **CO₂ (KG)** and **Water (Liters)**.

### 📌 Milestone 3 Status Summary

| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **Sustainability Intelligence Engine** | Uses a weighted scoring model to measure fabric quality, reuse potential, and overall recyclability. | Completed |
| **Recycling Recommendation Workflows** | Automatically suggests the best recycling path (like Mechanical Shredding, Upcycling, or Chemical Processing). | Completed |
| **Environmental Impact Assessment Models** | Calculates saved carbon emissions ($\text{CO}_2$), water saved, and landfill space reduced for each batch. | Completed |
| **Circular Economy Analytics** | Aggregates data from the database and waste inventory to track live recycling progress and trends. | Completed |
| **Sustainability Dashboards** | Built with React and Recharts to display interactive charts, live waste logging, and ESG scorecards. | Completed |

---

### 🛠️ Implementation Brief & Technical Overview

#### 1. Implement Sustainability Intelligence Engine

* **Smart Scoring System:** Calculates a total score ($0\text{--}100\%$) for each fabric based on its type, condition, and weight.
* **Backend Connection:** Connected to the `/analytics/assess-sustainability` endpoint to process calculations instantly in real time.

#### 2. Build Recycling Recommendation Workflows

* **Smart Decision Making:** Automatically guides textile waste to the right process, such as *Mechanical Shredding*, *Direct Garment Upcycling*, or *Chemical Processing*.
* **Exportable Reports:** Generates complete summary reports in text and PDF formats for easy record-keeping.

#### 3. Develop Environmental Impact Assessment Models

* **Eco-Savings Calculator:** Measures real environmental benefits by estimating saved $\text{CO}_2$ ($\text{KG}$), water saved ($\text{Liters}$), and landfill space saved ($\text{m}^3$).
* **Live Integration:** Automatically updates eco-savings values whenever new waste batches are added to the system.

#### 4. Generate Circular Economy Analytics

* **Data Aggregation:** Collects information from the database and user logs to measure overall platform recycling performance.
* **Smart Categorization:** Groups samples into recyclability tiers (High Potential, Moderate, and Low Recyclability).

#### 5. Create Sustainability Dashboards

* **Interactive Charts:** Uses Recharts to show material distribution (Doughnut Chart), monthly waste reduction trends (Line Chart), and score tiers (Bar Chart).
* **Live Waste Logging:** Allows users to log new waste batches and instantly updates all analytics on the screen.