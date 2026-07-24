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