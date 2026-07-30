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

@app.route("/")
def home():
    return "Textile Waste Intelligence Platform Backend Running"


@app.route("/inventory")
def inventory():

    conn = sqlite3.connect("textile_waste.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM waste_inventory")
    rows = cursor.fetchall()

    conn.close()

    return jsonify(rows)


# ADD HERE 
@app.route("/tables")
def tables():

    conn = sqlite3.connect("textile_waste.db")
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    conn.close()

    return jsonify(tables)


# REGISTER USER
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

    conn = sqlite3.connect("textile_waste.db")
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

    conn = sqlite3.connect("textile_waste.db")
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

    conn = sqlite3.connect("textile_waste.db")
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

    conn = sqlite3.connect("textile_waste.db")
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

        data = request.get_json()

        input_data = {
            "thread_count": data["thread_count"],
            "gsm": data["gsm"],
            "tensile_strength": data["tensile_strength"],
            "shrinkage_percent": data["shrinkage_percent"],
            "color_fastness": data["color_fastness"],
            "fabric_thickness": data["fabric_thickness"],
            "defect_count": data["defect_count"],
            "elongation_percent": data["elongation_percent"],
            "moisture_absorption": data["moisture_absorption"],

            "fabric_type": fabric_type_encoder.transform([data["fabric_type"]])[0],
            "weave_type": weave_type_encoder.transform([data["weave_type"]])[0],
            "finish_type": finish_type_encoder.transform([data["finish_type"]])[0],
            "production_method": production_method_encoder.transform([data["production_method"]])[0],

            "batch_id": data["batch_id"],
            "roll_number": data["roll_number"],
            "inspection_time_minutes": data["inspection_time_minutes"],

            "warehouse_id": warehouse_id_encoder.transform([data["warehouse_id"]])[0],
            "operator_name": operator_name_encoder.transform([data["operator_name"]])[0],
            "inspection_shift": inspection_shift_encoder.transform([data["inspection_shift"]])[0],

            "machine_temperature": data["machine_temperature"],
            "humidity_level": data["humidity_level"],

            "inspection_notes": inspection_notes_encoder.transform([data["inspection_notes"]])[0]
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
    
if __name__ == "__main__":
    app.run(debug=True)