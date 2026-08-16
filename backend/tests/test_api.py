"""Basic API validation tests for the Textile Waste Intelligence Platform."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_register_and_login():
    client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "pytest_user@test.com",
        "password": "TestPass123",
        "role": "admin",
    })
    response = client.post("/api/auth/login", json={
        "email": "pytest_user@test.com",
        "password": "TestPass123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_unauthenticated_request_rejected():
    response = client.get("/api/notifications")
    assert response.status_code == 401


def test_invalid_login_rejected():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrongpass",
    })
    assert response.status_code == 401


def test_role_based_access_blocks_wrong_role():
    client.post("/api/auth/register", json={
        "full_name": "Regular Manufacturer",
        "email": "pytest_manu@test.com",
        "password": "TestPass123",
        "role": "manufacturer",
    })
    login = client.post("/api/auth/login", json={
        "email": "pytest_manu@test.com", "password": "TestPass123",
    })
    token = login.json()["access_token"]
    response = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_sql_injection_attempt_handled_safely():
    response = client.post("/api/auth/login", json={
        "email": "' OR '1'='1",
        "password": "' OR '1'='1",
    })
    assert response.status_code in (401, 422)


def test_malformed_token_rejected():
    response = client.get("/api/notifications", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401

def _auth_headers(email, password, full_name="E2E User", role="admin"):
    client.post("/api/auth/register", json={
        "full_name": full_name, "email": email, "password": password, "role": role,
    })
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_e2e_inventory_create_and_list():
    import uuid
    headers = _auth_headers("e2e_inventory@test.com", "TestPass123")
    batch_id = f"E2E-BATCH-{uuid.uuid4().hex[:8]}"
    create = client.post("/api/inventory", json={
        "batch_id": batch_id, "fabric_type": "Cotton", "source": "Test Source",
        "quantity": 50, "color": "White", "condition": "New", "collection_date": "2026-08-15",
    }, headers=headers)
    assert create.status_code == 200

    listing = client.get("/api/inventory", headers=headers)
    assert listing.status_code == 200
    batch_ids = [item["batch_id"] for item in listing.json()]
    assert batch_id in batch_ids

def test_e2e_history_and_reports_endpoints_reachable():
    headers = _auth_headers("e2e_history@test.com", "TestPass123")
    history = client.get("/api/history", headers=headers)
    assert history.status_code == 200
    assert isinstance(history.json(), list)

    reports = client.get("/api/reports", headers=headers)
    assert reports.status_code == 200

    summary = client.get("/api/reports/summary", headers=headers)
    assert summary.status_code == 200
    assert "total_reports" in summary.json()


def test_e2e_sustainability_and_notifications_endpoints():
    headers = _auth_headers("e2e_sustain@test.com", "TestPass123")
    summary = client.get("/api/sustainability/summary", headers=headers)
    assert summary.status_code == 200

    benchmark = client.get("/api/sustainability/benchmark", headers=headers)
    assert benchmark.status_code == 200

    notifications = client.get("/api/notifications", headers=headers)
    assert notifications.status_code == 200

    unread = client.get("/api/notifications/unread-count", headers=headers)
    assert unread.status_code == 200
    assert "unread_count" in unread.json()


def test_e2e_settings_update_flow():
    headers = _auth_headers("e2e_settings@test.com", "TestPass123")
    update = client.put("/api/settings", json={
        "waste_collection_alerts": False,
        "recycling_opportunity_notifications": True,
        "sustainability_milestone_alerts": True,
        "inventory_warnings": True,
        "platform_announcements": False,
    }, headers=headers)
    assert update.status_code == 200

    fetched = client.get("/api/settings", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["waste_collection_alerts"] is False


def test_e2e_export_endpoints_return_files():
    headers = _auth_headers("e2e_export@test.com", "TestPass123")
    csv_response = client.get("/api/reports/export/csv", headers=headers)
    assert csv_response.status_code == 200
    assert "csv" in csv_response.headers["content-type"]

    excel_response = client.get("/api/reports/export/excel", headers=headers)
    assert excel_response.status_code == 200
    assert "spreadsheet" in excel_response.headers["content-type"]