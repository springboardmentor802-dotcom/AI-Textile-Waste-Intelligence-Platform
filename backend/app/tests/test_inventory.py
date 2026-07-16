import pytest
import datetime
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app import models, auth

@pytest.fixture
def test_users(db: Session):
    m_user = models.User(
        email="m@test.com",
        name="Manufacturer",
        role="Textile Manufacturer",
        hashed_password=auth.get_password_hash("Password123!")
    )
    o_user = models.User(
        email="o@test.com",
        name="Operator",
        role="Recycling Facility Operator",
        hashed_password=auth.get_password_hash("Password123!")
    )
    a_user = models.User(
        email="a@test.com",
        name="Admin",
        role="Administrator",
        hashed_password=auth.get_password_hash("Password123!")
    )
    db.add_all([m_user, o_user, a_user])
    db.commit()
    return {"manufacturer": m_user, "operator": o_user, "admin": a_user}

def test_create_batch_success(client: TestClient, test_users):
    token = auth.create_access_token({"sub": "m@test.com", "role": "Textile Manufacturer"})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/inventory",
        json={
            "fabric_type": "Cotton",
            "source": "Apex Textiles Inc",
            "quantity": 300,
            "unit": "kg",
            "color": "Blue",
            "condition": "Clean",
            "collection_date": str(datetime.date.today()),
            "status": "Pending",
            "notes": "Leftovers"
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["batch_id"].startswith("TXT-")
    assert data["fabric_type"] == "Cotton"
    assert data["quantity"] == 300.0

def test_create_batch_forbidden_operator(client: TestClient, test_users):
    token = auth.create_access_token({"sub": "o@test.com", "role": "Recycling Facility Operator"})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/inventory",
        json={
            "fabric_type": "Cotton",
            "source": "Apex Textiles Inc",
            "quantity": 300,
            "unit": "kg",
            "color": "Blue",
            "condition": "Clean",
            "collection_date": str(datetime.date.today()),
            "status": "Pending"
        },
        headers=headers
    )
    # Role checker returns 403 Forbidden for Recycling Facility Operator for POST request
    assert response.status_code == 403

def test_update_batch_roles(client: TestClient, db: Session, test_users):
    # 1. Create a batch owned by manufacturer
    batch = models.WasteBatch(
        batch_id="TXT-2026-TEST",
        fabric_type="Cotton",
        source="Apex",
        quantity=100.0,
        unit="kg",
        color="Red",
        condition="Clean",
        collection_date=datetime.date.today(),
        status="Pending",
        created_by_id=test_users["manufacturer"].id
    )
    db.add(batch)
    db.commit()

    # 2. Manufacturer edits their own batch details
    m_token = auth.create_access_token({"sub": "m@test.com", "role": "Textile Manufacturer"})
    response = client.put(
        "/api/inventory/TXT-2026-TEST",
        json={"color": "White", "quantity": 120},
        headers={"Authorization": f"Bearer {m_token}"}
    )
    assert response.status_code == 200
    assert response.json()["color"] == "White"
    assert response.json()["quantity"] == 120.0

    # 3. Recycler attempts to edit quantity (should fail)
    o_token = auth.create_access_token({"sub": "o@test.com", "role": "Recycling Facility Operator"})
    response = client.put(
        "/api/inventory/TXT-2026-TEST",
        json={"quantity": 150.0},
        headers={"Authorization": f"Bearer {o_token}"}
    )
    assert response.status_code == 403  # Recycler can only edit status and notes

    # 4. Recycler updates status and notes (should succeed)
    response = client.put(
        "/api/inventory/TXT-2026-TEST",
        json={"status": "Sorting", "notes": "Sorted by Operator"},
        headers={"Authorization": f"Bearer {o_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Sorting"
    assert response.json()["notes"] == "Sorted by Operator"

def test_delete_batch_rbac(client: TestClient, db: Session, test_users):
    # Create batch
    batch = models.WasteBatch(
        batch_id="TXT-2026-DEL",
        fabric_type="Wool",
        source="Apex",
        quantity=50.0,
        unit="kg",
        color="Black",
        condition="Clean",
        collection_date=datetime.date.today(),
        status="Sorting",  # Status is Sorting (not Pending)
        created_by_id=test_users["manufacturer"].id
    )
    db.add(batch)
    db.commit()

    # Manufacturer tries to delete sorting batch (should fail)
    m_token = auth.create_access_token({"sub": "m@test.com", "role": "Textile Manufacturer"})
    response = client.delete(
        "/api/inventory/TXT-2026-DEL",
        headers={"Authorization": f"Bearer {m_token}"}
    )
    assert response.status_code == 400  # Cannot delete when not Pending

    # Admin deletes sorting batch (should succeed)
    a_token = auth.create_access_token({"sub": "a@test.com", "role": "Administrator"})
    response = client.delete(
        "/api/inventory/TXT-2026-DEL",
        headers={"Authorization": f"Bearer {a_token}"}
    )
    assert response.status_code == 200
