# Textile Waste Intelligence Platform — Backend

FastAPI + PostgreSQL (primary) + MongoDB (secondary) + OpenCV/Scikit-learn/XGBoost.

## 1. Start the databases (Docker)
```bash
cd ..   # project root, where docker-compose.yml lives
docker compose up -d
```
If Docker isn't available right now, skip this — the backend automatically
falls back to a local SQLite file so the demo still runs. Just know Mongo
document archiving will be silently skipped too.

## 2. Install dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 3. Train the material classifier on your downloaded TFD dataset
```bash
python scripts/train_material_classifier.py /path/to/ten-fabrics-dataset
```
This writes `app/material_model.joblib` + `app/material_labels.json`. Takes
under a minute on CPU. If you skip this step, the API still works — it uses
a rule-based color/texture classifier as a fallback (clearly labeled in the
API response as `"classifier_source": "rule_based_fallback"`).

## 4. Run the API
```bash
uvicorn app.main:app --reload --port 8000
```

API docs (Swagger): http://localhost:8000/docs

## Default login (seeded automatically on first run)
- Email: `admin@textilewaste.ai`
- Password: `Admin@123`
- Role: admin

Register additional users via `/api/auth/register` with role
`manufacturer`, `sustainability_manager`, or `recycling_operator` to demo
role-based access.
