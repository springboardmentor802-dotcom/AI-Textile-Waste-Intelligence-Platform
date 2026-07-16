import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import models, auth

def test_register_user(client: TestClient):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@test.com",
            "name": "New User",
            "organization": "Test Factory",
            "role": "Textile Manufacturer",
            "password": "Password123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["name"] == "New User"
    assert "password" not in data

def test_register_existing_email(client: TestClient, db: Session):
    # Pre-add user
    db_user = models.User(
        email="exists@test.com",
        name="Exists",
        role="Textile Manufacturer",
        hashed_password=auth.get_password_hash("Password123!")
    )
    db.add(db_user)
    db.commit()

    response = client.post(
        "/api/auth/register",
        json={
            "email": "exists@test.com",
            "name": "New Name",
            "role": "Textile Manufacturer",
            "password": "Password123!"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_user(client: TestClient, db: Session):
    db_user = models.User(
        email="login@test.com",
        name="Login User",
        role="Textile Manufacturer",
        hashed_password=auth.get_password_hash("Password123!")
    )
    db.add(db_user)
    db.commit()

    # Test login via Form
    response = client.post(
        "/api/auth/login",
        data={"username": "login@test.com", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@test.com"

def test_get_current_user_me(client: TestClient, db: Session):
    db_user = models.User(
        email="me@test.com",
        name="Me User",
        role="Textile Manufacturer",
        hashed_password=auth.get_password_hash("Password123!")
    )
    db.add(db_user)
    db.commit()

    token = auth.create_access_token({"sub": "me@test.com", "role": "Textile Manufacturer"})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "me@test.com"

def test_update_profile(client: TestClient, db: Session):
    db_user = models.User(
        email="update@test.com",
        name="Old Name",
        organization="Old Org",
        role="Textile Manufacturer",
        hashed_password=auth.get_password_hash("Password123!")
    )
    db.add(db_user)
    db.commit()

    token = auth.create_access_token({"sub": "update@test.com", "role": "Textile Manufacturer"})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.put(
        "/api/users/profile",
        json={"name": "New Name", "organization": "New Org"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["organization"] == "New Org"
