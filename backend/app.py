from flask import Flask, jsonify, request
import sqlite3
import bcrypt

app = Flask(__name__)

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


if __name__ == "__main__":
    app.run(debug=True)