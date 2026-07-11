import sqlite3

# Connect to database
conn = sqlite3.connect("textile_waste.db")

cursor = conn.cursor()

# Waste Inventory Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS waste_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT,
    fabric_type TEXT,
    source TEXT,
    quantity INTEGER,
    color TEXT,
    condition TEXT,
    collection_date TEXT
)
""")

# Users Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
""")

# Sample Waste Inventory Data
cursor.execute("""
INSERT INTO waste_inventory
(batch_id, fabric_type, source, quantity, color, condition, collection_date)
VALUES
('TW001','Cotton','Factory A',100,'Blue','Good','2026-07-10')
""")

conn.commit()

print("Database and Tables Created Successfully")

conn.close()