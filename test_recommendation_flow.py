import os
import sys

import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_predict_accepts_case_mismatched_category_and_recommend_returns_payload(client):
    payload = {
        "thread_count": 120,
        "gsm": 180,
        "tensile_strength": 35,
        "shrinkage_percent": 2,
        "color_fastness": 4,
        "fabric_thickness": 0.4,
        "defect_count": 1,
        "elongation_percent": 12,
        "moisture_absorption": 7,
        "fabric_type": "Cotton",
        "weave_type": "Plain",
        "finish_type": "Raw",
        "production_method": "Handloom",
        "batch_id": 1,
        "roll_number": 1,
        "inspection_time_minutes": 20,
        "warehouse_id": "wh-a",
        "operator_name": "Suresh",
        "inspection_shift": "Morning",
        "machine_temperature": 70,
        "humidity_level": 55,
        "inspection_notes": "Looks fine"
    }

    predict_response = client.post("/predict", json=payload)
    assert predict_response.status_code == 200
    assert "predicted_fabric_quality" in predict_response.get_json()

    recommend_response = client.post(
        "/recommend",
        json={"fabric_quality": predict_response.get_json()["predicted_fabric_quality"]}
    )
    assert recommend_response.status_code == 200
    assert recommend_response.get_json()["recommendation"]
