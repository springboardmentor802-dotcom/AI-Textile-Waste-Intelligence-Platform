from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
DATABASE_PATH = os.path.join(PROJECT_ROOT, "textile_waste.db")


def get_db_connection():
    return sqlite3.connect(DATABASE_PATH)


DEFAULT_CATEGORICAL_VALUES = {
    "fabric_type": "cotton",
    "weave_type": "plain",
    "finish_type": "raw",
    "production_method": "handloom",
    "warehouse_id": "WH-A",
    "operator_name": "Suresh",
    "inspection_shift": "Morning",
    "inspection_notes": "Looks fine"
}

MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "fabric_quality_model.pkl")
ENCODER_DIR = os.path.join(BASE_DIR, "..", "ml", "encoders")

model = joblib.load(MODEL_PATH)

fabric_type_encoder = joblib.load(os.path.join(ENCODER_DIR, "fabric_type_encoder.pkl"))
weave_type_encoder = joblib.load(os.path.join(ENCODER_DIR, "weave_type_encoder.pkl"))
finish_type_encoder = joblib.load(os.path.join(ENCODER_DIR, "finish_type_encoder.pkl"))
production_method_encoder = joblib.load(os.path.join(ENCODER_DIR, "production_method_encoder.pkl"))
warehouse_id_encoder = joblib.load(os.path.join(ENCODER_DIR, "warehouse_id_encoder.pkl"))
operator_name_encoder = joblib.load(os.path.join(ENCODER_DIR, "operator_name_encoder.pkl"))
inspection_shift_encoder = joblib.load(os.path.join(ENCODER_DIR, "inspection_shift_encoder.pkl"))
inspection_notes_encoder = joblib.load(os.path.join(ENCODER_DIR, "inspection_notes_encoder.pkl"))
fabric_quality_encoder = joblib.load(os.path.join(ENCODER_DIR, "fabric_quality_encoder.pkl"))

CATEGORY_ENCODERS = {
    "fabric_type": fabric_type_encoder,
    "weave_type": weave_type_encoder,
    "finish_type": finish_type_encoder,
    "production_method": production_method_encoder,
    "warehouse_id": warehouse_id_encoder,
    "operator_name": operator_name_encoder,
    "inspection_shift": inspection_shift_encoder,
    "inspection_notes": inspection_notes_encoder
}


def _coerce_numeric(value, fallback=0.0):
    if value in (None, ""):
        return fallback

    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def _normalize_categorical_value(value, encoder, fallback):
    if value in (None, ""):
        return fallback

    if isinstance(value, str):
        value = value.strip()

    if value in encoder.classes_:
        return value

    normalized_value = str(value).strip().lower()
    for candidate in encoder.classes_:
        if str(candidate).strip().lower() == normalized_value:
            return candidate

    return fallback


@app.route("/")
def home():
    return "Textile Waste Intelligence Platform Backend Running"


@app.route("/inventory")
def inventory():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM waste_inventory")
    rows = cursor.fetchall()

    conn.close()

    return jsonify(rows)


@app.route("/tables")
def tables():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    conn.close()

    return jsonify(tables)


@app.route("/register", methods=["POST"])
def register():

    data = request.json

    full_name = data["full_name"]
    email = data["email"]
    password = data["password"]
    role = data["role"]

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
        INSERT INTO users
        (full_name, email, password, role)
        VALUES (?, ?, ?, ?)
        """,
        (
            full_name,
            email,
            hashed_password.decode("utf-8"),
            role
        ))

        conn.commit()

        return jsonify({
            "message": "User Registered Successfully"
        })

    except sqlite3.IntegrityError:
        return jsonify({
            "message": "Email Already Exists"
        })

    finally:
        conn.close()


@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data["email"]
    password = data["password"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT full_name, email, password, role FROM users WHERE email=?",
        (email,)
    )

    user = cursor.fetchone()

    conn.close()

    if user is None:
        return jsonify({
            "message": "User Not Found"
        }), 404

    full_name = user[0]
    stored_password = user[2]
    role = user[3]

    if bcrypt.checkpw(
        password.encode("utf-8"),
        stored_password.encode("utf-8")
    ):

        token = jwt.encode(
            {
                "email": email,
                "role": role,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            },
            "secret_key",
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login Successful",
            "full_name": full_name,
            "role": role,
            "token": token
        })

    return jsonify({
        "message": "Invalid Password"
    }), 401


@app.route("/add_inventory", methods=["POST"])
def add_inventory():

    data = request.get_json()

    batch_id = data["batch_id"]
    fabric_type = data["fabric_type"]
    source = data["source"]
    quantity = data["quantity"]
    color = data["color"]
    condition = data["condition"]
    collection_date = data["collection_date"]

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO waste_inventory
    (batch_id, fabric_type, source, quantity, color, condition, collection_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
    (
        batch_id,
        fabric_type,
        source,
        quantity,
        color,
        condition,
        collection_date
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Inventory Added Successfully"
    })


@app.route("/delete_inventory/<int:id>", methods=["DELETE"])
def delete_inventory(id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM waste_inventory WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Inventory Deleted Successfully"
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json(silent=True) or {}

        categorical_values = {}
        for field, fallback_value in DEFAULT_CATEGORICAL_VALUES.items():
            raw_value = data.get(field)
            encoder = CATEGORY_ENCODERS[field]
            categorical_values[field] = _normalize_categorical_value(raw_value, encoder, fallback_value)

        input_data = {
            "thread_count": _coerce_numeric(data.get("thread_count")),
            "gsm": _coerce_numeric(data.get("gsm")),
            "tensile_strength": _coerce_numeric(data.get("tensile_strength")),
            "shrinkage_percent": _coerce_numeric(data.get("shrinkage_percent")),
            "color_fastness": _coerce_numeric(data.get("color_fastness")),
            "fabric_thickness": _coerce_numeric(data.get("fabric_thickness")),
            "defect_count": _coerce_numeric(data.get("defect_count")),
            "elongation_percent": _coerce_numeric(data.get("elongation_percent")),
            "moisture_absorption": _coerce_numeric(data.get("moisture_absorption")),

            "fabric_type": fabric_type_encoder.transform([categorical_values["fabric_type"]])[0],
            "weave_type": weave_type_encoder.transform([categorical_values["weave_type"]])[0],
            "finish_type": finish_type_encoder.transform([categorical_values["finish_type"]])[0],
            "production_method": production_method_encoder.transform([categorical_values["production_method"]])[0],

            "batch_id": _coerce_numeric(data.get("batch_id")),
            "roll_number": _coerce_numeric(data.get("roll_number")),
            "inspection_time_minutes": _coerce_numeric(data.get("inspection_time_minutes")),

            "warehouse_id": warehouse_id_encoder.transform([categorical_values["warehouse_id"]])[0],
            "operator_name": operator_name_encoder.transform([categorical_values["operator_name"]])[0],
            "inspection_shift": inspection_shift_encoder.transform([categorical_values["inspection_shift"]])[0],

            "machine_temperature": _coerce_numeric(data.get("machine_temperature")),
            "humidity_level": _coerce_numeric(data.get("humidity_level")),

            "inspection_notes": inspection_notes_encoder.transform([categorical_values["inspection_notes"]])[0]
        }

        input_df = pd.DataFrame([input_data])
        prediction = model.predict(input_df)
        predicted_quality = fabric_quality_encoder.inverse_transform(prediction)

        return jsonify({
            "predicted_fabric_quality": predicted_quality[0]
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json(silent=True) or {}
    quality = str(data.get("fabric_quality", "")).strip()

    if quality.lower() == "high":
        recommendation = "Reuse or Donate"
        sustainability_score = 95
        circularity_score = 90
        co2_saved = 18.5
        water_saved = 120
        energy_saved = 8.2
    elif quality.lower() == "medium":
        recommendation = "Mechanical Recycling"
        sustainability_score = 75
        circularity_score = 70
        co2_saved = 12.3
        water_saved = 90
        energy_saved = 5.4
    else:
        recommendation = "Chemical Recycling"
        sustainability_score = 55
        circularity_score = 50
        co2_saved = 6.4
        water_saved = 45
        energy_saved = 2.8

    return jsonify({
        "recommendation": recommendation,
        "sustainability_score": sustainability_score,
        "circularity_score": circularity_score,
        "co2_saved": co2_saved,
        "water_saved": water_saved,
        "energy_saved": energy_saved
    })


if __name__ == "__main__":
    app.run(debug=True)
    