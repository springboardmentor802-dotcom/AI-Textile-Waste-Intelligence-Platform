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