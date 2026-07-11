# ♻️ AI Textile Waste Intelligence Platform

## 📌 Overview
A web-based platform for intelligent textile waste management — identifying fabric types, estimating recyclability, and recommending recycling/reuse strategies using computer vision and sustainability analytics. This repo currently implements the secure authentication foundation; inventory management, dashboards, and AI classification are next.

---

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, React Router DOM, CSS
**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt), python-jose (JWT)
**Database:** PostgreSQL
**Tools:** Git, GitHub, VS Code, pgAdmin 4

---

## 📁 Project Structure

```
AI-Textile-Waste-Intelligence-Platform/
├── Frontend/
│   └── src/{components, pages, services, App.jsx}
├── Backend/
│   ├── main.py, database.py, models.py, schemas.py, config.py
│   └── routes/auth.py
├── Dataset/  ├── Docs/  ├── Models/  ├── Notebook/
└── README.md
```

---

## ✅ Completed (Milestone 1: Authentication & Access Control)

- Connected React frontend ↔ FastAPI backend ↔ PostgreSQL (`textile_waste_db`)
- Backend organized into single-responsibility modules
- Login & Register pages with client-side routing
- `/register` and `/login` APIs, tested
- Password hashing (bcrypt) — no plain-text passwords
- Duplicate-email validation; secure generic error on invalid login
- JWT-based authentication — tokens persist across page refresh
- Protected routes — Dashboard requires a valid session
- Role-Based Access Control (RBAC) — enforced via `require_role()`, verified with a working `/admin-only` endpoint
- Full flow tested end-to-end and confirmed directly in the database

## 🔜 Next
Admin panel for role assignment · role-specific dashboards · textile inventory management · AI fabric classification · recycling recommendations · sustainability reporting

---

## 🔐 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| GET | `/` | Health check | No |
| POST | `/register` | Create account | No |
| POST | `/login` | Get JWT token | No |
| GET | `/admin-only` | Example role-restricted route | Administrator |

Interactive docs: `http://localhost:8000/docs`

---

## 🚀 Getting Started

**Backend**
```bash
cd Backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd Frontend
npm install
npm run dev
```

**Promote a user to Administrator** (run in PostgreSQL):
```sql
UPDATE users SET role='Administrator' WHERE email='your-email@example.com';
```
Log out and back in afterward — roles are baked into the JWT at login time.

---

## 📄 License
Developed as part of an internship program. License to be finalized.
