# Textile Waste Intelligence Platform - Milestone 1

A containerized full-stack platform designed to closed-loop textile waste pipelines using material sorting logs, analytical dashboard reports, and role-based access controls. Ready for computer vision modeling extensions in Milestone 2.

---

## 1. Architecture Overview

This project is structured as a monorepo containing:
* **`/backend`**: Python + FastAPI REST API using SQLAlchemy ORM to connect to PostgreSQL.
  * Security: JWT authorization with password hashing (bcrypt).
  * Validation: Strong schema validation using Pydantic.
  * Seeding: Automount database initialization seeding four roles and inventory items.
  * Unit Testing: Containerized / local testing using Pytest and TestClient over SQLite.
* **`/frontend`**: React + JavaScript + Vite + Tailwind CSS SPA.
  * Design System: Custom eco-friendly earthy/green palette configured in `tailwind.config.js` using Outfit and Inter fonts.
  * State: Global `AuthContext` to handle authorization tokens and toasts.
  * Layout: Sidebar + Navbar authenticated layout containing alert trackers and profile overlays.
  * Pages: Form validation pipelines, pagination lists, dashboards, and dataset previews.
* **`docker-compose.yml`**: Provisions PostgreSQL db, FastAPI backend, and React dev server.

---

## 2. Quick Setup & Run Instructions

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Build and Launch Services
From the root directory of the project, run:
```bash
docker compose up --build
```

Once Docker completes building and initializing:
* **Frontend Portal**: Navigate to `http://localhost:3000`
* **REST API OpenAPI Docs**: Navigate to `http://localhost:8000/docs`
* **PostgreSQL Database**: Accessible internally in compose network at port `5432`

---

## 3. Demo Accounts & Credentials

The system seeds four demo accounts to test role-based access rules (RBAC). 
* **Password for all demo accounts**: `Password123!`

| Role Name | Email Address | Organization / Facility | Core Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@textile.com` | Circular Waste HQ | Full CRUD access, view user registry, edit roles. |
| **Textile Manufacturer** | `manufacturer@textile.com` | Apex Textiles Inc | Create batches, list and edit *their own* batches (if status is Pending/Sorting). |
| **Recycling Facility Operator** | `operator@textile.com` | Green Cycle Recycling | View all batches, update batch processing status and notes (primary fields locked). |
| **Sustainability Manager** | `manager@textile.com` | EcoFashion Alliance | Read-only analytics dashboard and inventory audits. |

---

## 4. Implemented API Endpoints

### Authentication (`/api/auth`)
* `POST /api/auth/register`: Create a new user account.
* `POST /api/auth/login`: OAuth2 password form-encoded login returning JWT token.
* `POST /api/auth/login-json`: JSON login alternative for API clients.
* `GET /api/auth/me`: Retrieve currently logged-in user details.
* `POST /api/auth/logout`: Confirm logout sequence.

### Users (`/api/users`)
* `PUT /api/users/profile`: Modify current user name and organization.
* `GET /api/users` (Admin only): Retrieve list of all registered users.
* `PUT /api/users/{user_id}/role` (Admin only): Re-assign role permissions.

### Inventory (`/api/inventory`)
* `GET /api/inventory/dashboard`: Fetch aggregated charts metrics and alert queues.
* `GET /api/inventory`: Fetch batches list with search, sorting, filtering, and pagination support.
* `POST /api/inventory`: Register a new batch (auto-generates human-readable ID like `TXT-2026-0001`).
* `GET /api/inventory/{batch_id}`: Fetch detailed batch attributes.
* `PUT /api/inventory/{batch_id}`: Modify batch attributes (enforces role rules).
* `DELETE /api/inventory/{batch_id}`: Remove batch from records (enforces role rules).

### Datasets (`/api/datasets`)
* `GET /api/datasets`: Retrieve metadata list of integration targets.
* `POST /api/datasets/{dataset_id}/ingest`: Mock endpoint for file uploads queueing.

---

## 5. Local Testing

To run backend tests locally, navigate to the `/backend` directory, create a virtual environment, install requirements, and execute:
```bash
cd backend
pip install -r requirements.txt
pytest
```
*Tests automatically configure a local SQLite database (`test.db`) and verify authentication, permission check overrides, and batch modification rules.*

---

## 6. Milestone 2 Extension Points

Milestone 1 lays a production-ready framework to ingest datasets and classify fibers. In **Milestone 2**, the following integration modules will be built:
1. **Computer Vision classification**: Mount image files uploaded in `POST /api/datasets/{id}/ingest` into a background worker (e.g. Celery + Redis). Run a PyTorch/YOLO inference pass to predict material composition ratios (e.g., % Cotton vs % Polyester).
2. **Dataset downloads**: Add async download tasks to pull raw benchmark repositories (TIPS, DeepFashion, etc.) directly into a shared mount storage volume.
3. **Refined Recyclability Score**: Run XGBoost or standard linear models using condition variables (e.g. damaged, contaminated) and fabric composition to output a weighted overall Circularity Index.
