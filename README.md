<<<<<<< HEAD
<<<<<<< HEAD
# Textile Waste Intelligence Platform — Milestone 1

A containerized full-stack platform for tracking textile waste batches through sorting, processing, and recycling, with role-based access control. Built as a foundation for a Milestone 2 computer-vision fiber-classification module.

## 1. Architecture

- **`/backend`** — Python + FastAPI REST API, SQLAlchemy ORM, PostgreSQL. JWT auth with bcrypt password hashing, Pydantic validation, auto-seeded demo accounts, Pytest test suite (runs on SQLite).
- **`/frontend`** — React + Vite + Tailwind CSS SPA. Eco-friendly green/clay palette (Outfit + Inter fonts), global `AuthContext`, sidebar + navbar authenticated layout, dashboard charts (Recharts), paginated/searchable batch list.
- **`docker-compose.yml`** — provisions PostgreSQL, the FastAPI backend, and the Vite dev server together.

## 2. Quick Start

Requires Docker Desktop.

```bash
docker compose up --build
```

Once running:
- Frontend: http://localhost:3000
- API docs (Swagger): http://localhost:8000/docs
- PostgreSQL: internal to the compose network on port 5432

## 3. Demo Accounts

Password for all demo accounts: **`Password123!`**

| Role | Email | Organization | Access Scope |
|---|---|---|---|
| Admin | admin@textilewaste.com | Circular Systems HQ | Full CRUD, manage users/roles |
| Manufacturer | manufacturer@textilewaste.com | Nova Fabrics Ltd | Create batches; edit own batches while Pending/Sorting |
| Recycling Operator | operator@textilewaste.com | GreenLoop Recycling | View all batches; update status/notes only |
| Sustainability Analyst | analyst@textilewaste.com | EcoMetrics Analytics | Read-only dashboard/analytics |

## 4. API Endpoints

**Auth** — `/api/auth`
- `POST /register`, `POST /login` (form-encoded, Swagger-compatible), `POST /login-json`, `GET /me`, `POST /logout`

**Users** — `/api/users`
- `GET /` (admin), `PUT /profile`, `PUT /{user_id}/role` (admin)

**Batches** — `/api/batches`
- `GET /` — search, filter by status, paginate
- `POST /` — create (auto-generates code like `TXT-2026-0001`)
- `GET /{id}`, `PUT /{id}`, `DELETE /{id}` — role-enforced per the table above

**Dashboard** — `/api/dashboard`
- `GET /summary` — totals, weight, status breakdown, average circularity score

## 5. Local Backend Testing

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pytest -v
```

Tests spin up a local SQLite database and cover registration/login, JWT auth, and RBAC rules (e.g. a manufacturer can't edit another manufacturer's batch, an operator can't touch primary batch fields, a locked/processing batch can't be edited by its manufacturer).

## 6. Milestone 2 — Planned

- **CV fiber classification**: background worker (Celery + Redis) runs a PyTorch/ResNet model on uploaded batch photos to predict `%Cotton` / `%Polyester` / blends, written to `predicted_composition`.
- **Circularity Index**: weighted score from condition, contamination, and predicted composition — start rule-based, evolve into a trained regressor.
- **Dataset ingestion**: endpoints to pull in labeled benchmark datasets for training.
=======
# AI-Textile-Waste-Intelligence-Platform
>>>>>>> 9cd98e3c95689224340f206384f2dc3dc95ad7d4
=======
# AI-Textile-Waste-Intelligence-Platform
Infosys Springboard Internship Project - AI Textile Waste Intelligence Platform
>>>>>>> c8518ef4088297f615bf37d1201ab57e9678813a
