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
| **Textile Image Analysis Engine** | Multi-model vision pipeline leveraging **OpenCV** (HSV color mapping & Canny/Laplacian texture analysis), **PyTorch**, and **TensorFlow** tensor transformations. | **✔️ Completed** |
| **Material Classification Workflows** | Dynamic algorithmic feature mapping predicting primary fabric types (Cotton, Denim, Wool, Silk, etc.) and fiber blend percentages. | **✔️ Completed** |
| **Waste Categorization Models** | Automated categorization engine mapping textile wear, edge density, and surface contamination to circular waste categories. | **✔️ Completed** |
| **Recyclability Assessment Systems** | Circularity Index scoring model synced with real-world enterprise dataset (`sustainable_fashion_dataset.csv`) for CO₂ & Water savings estimation. | **✔️ Completed** |
| **Live Dynamic Dashboard UI** | Full-stack React integration with responsive visual progress bars, metrics scorecards, and live image previews without static fallback locks. | **✔️ Completed** |

---

## 🛠️ Implementation Brief & Technical Overview

### 1. Implement Textile Image Analysis Engine
* **Visual & Texture Feature Extraction:** `backend/app/ml/image_analysis.py` parses raw binary image streams to extract HSV color profiles and compute Laplacian variance alongside Canny edge density for weave pattern scanning.
* **Stream Handling:** Integrated with FastAPI `/auth/analytics/upload-image` endpoint for real-time binary payload buffer reading and local cache streaming.

### 2. Build Material Classification Workflows
* **Fiber Blend Prediction:** Dynamically calculates primary fabric types and multi-fiber composition percentages (e.g., *Cotton, Polyester, Elastane*) based on image texture sharpness and color signatures.
* **Quality Grade Assessment:** Classifies material quality into standardized grades (*Grade A, Grade B*) verified against database criteria.

### 3. Develop Waste Categorization Models
* **Surface Condition Analysis:** Detects wear, surface damage percentages, and contamination levels (*None Detected, Minor Stain*).
* **Automated Categorization:** Classifies uploaded samples into circular economy categories such as *High-Grade Recyclable*, *Recyclable / Upcyclable*, or *Low-Grade Recyclable*.

### 4. Create Recyclability Assessment Systems
* **Circularity Index Scoring:** Evaluates a composite recyclability score (0–100%) based on surface degradation and fiber blend complexity.
* **Actionable Recommendations:** Suggests optimal disposal and recovery pathways (e.g., *High-Yield Mechanical Shredding*, *Chemical Polymer Recycling*, or *Industrial Downcycling*).
* **Environmental Footprint Estimation:** Queries dataset metrics to output real-time estimated **CO₂ Offset (KG)** and **Water Saved (Liters)**.