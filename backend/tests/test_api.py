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