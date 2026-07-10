# 🏛️ Technical Architecture & Database Schema
**Project:** AI-Textile Waste Intelligence Platform  
**Version:** 1.0.0 (Milestone 1 Verified Stack)

---

## 1. System Architecture (FastAPI & PostgreSQL Flow)

The platform utilizes a modern decoupled full-stack architecture built for high throughput, strict relational compliance, and role-segregated data streaming.

* **Frontend Layer (React.js / Vite):** Handles interface layout grids, manages reactive client states, and orchestrates asynchronous API transactions using custom network interceptors.
* **Backend Layer (FastAPI / Python):** Provides an asynchronous ASGI endpoint framework, processes strict data validation models, and injects dependency middleware for JWT verification and administrative boundary validation.
* **Database Layer (PostgreSQL):** A high-performance relational database engine executing atomic transactions, managing relational constraints, and storing transaction histories securely.

---

## 2. Database Schema & Entity Relationships (SQLAlchemy Engine)

The tables are mapped using SQLAlchemy ORM to enforce strict data constraints, precise relational linkages, and absolute type definition arrays.

### 👥 Users Table (`users`)
Tracks registered administrative profiles, processing units, and logistics managers.
* `id` (Integer, Primary Key, Auto-Increment)
* `email` (String, Unique Index, Non-Nullable)
* `hashed_password` (String, Encrypted Storage via Bcrypt, Non-Nullable)
* `role` (SQL Enum: `Admin`, `Manufacturer`, `Recycling_Operator`, `Sustainability_Manager`)
* *Relationship:* `inventory_items` mapped via a 1-to-Many cascade setup pointing to the Inventory table.

### 📦 Inventory Table (`inventory`)
Tracks localized post-industrial waste records, quality states, and pipeline flow metrics.
* `id` (Integer, Primary Key, Auto-Increment)
* `user_id` (Integer, Foreign Key pointing to `users.id`, Non-Nullable)
* `batch_id` (String, Unique System Identifier, Indexed, Non-Nullable)
* `fabric_type` (SQL Enum: `Cotton`, `Polyester`, `Wool`, `Silk`, `Linen`, `Denim`, `Nylon`, `Rayon`, `Acrylic`, `Mixed Fabrics`)
* `source` (String, Storing origin locations and facility names)
* `quantity` (Float, Weight measured explicitly in kilograms)
* `color` (String, Explicit visual spectrum value)
* `condition` (SQL Enum: `Excellent`, `Good`, `Fair`, `Poor`, `Contaminated`)
* `collection_date` (DateTime, tracking real-time drop-off timestamps)
* `status` (SQL Enum: `Pending`, `In-Transit`, `Processed`, `Diverted`, Default: `Pending`)
* *Relationship:* `owner` back-populates to the User entity for dynamic relational verification.

### 📊 Analytics Table (`analytics`)
Calculates active environmental offsets based on real-time classification results.
* `id` (Integer, Primary Key, Auto-Increment)
* `inventory_id` (Integer, Foreign Key pointing to `inventory.id`, Non-Nullable)
* `carbon_diverted` (Float, calculated carbon intensity mitigation fields)
* `recycling_efficiency` (Float, evaluating raw purity scores)

### 🔔 Notifications Table (`notifications`)
Manages automated alert routing for operational status transitions and tracking changes.
* `id` (Integer, Primary Key, Auto-Increment)
* `recipient_id` (Integer, Foreign Key pointing to `users.id`, Non-Nullable)
* `message` (String, textual alert parameters)
* `is_read` (Boolean, Default: false)

---

## 3. Core Data Flow Execution Logic

1. **Stateless Authentication Lifecycle:** User authenticates through the unified login route ──► Backend generates a signed **JWT Access Token** containing encrypted role claims ──► Frontend captures payload values and safely saves the token within client storage contexts.
2. **Secure Relational Record Isolation:** User triggers a waste submission transaction ──► Frontend network layer injects the Bearer token automatic via request interceptors ──► FastAPI backend verifies claims using dependency injection middleware (`get_current_user`) ──► System isolates rows dynamically based on parsed identity parameters before committing entries into PostgreSQL.
3. **Downstream Metrics Orchestration:** Whenever an inventory status transitions within processing units ──► The analytics engine captures the data points ──► Real-time circularity metrics calculations refresh across dashboard states automatically.