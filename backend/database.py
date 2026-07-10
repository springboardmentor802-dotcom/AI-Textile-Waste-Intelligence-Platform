import sqlite3

conn = sqlite3.connect("textile_waste.db")

cursor = conn.cursor()

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

conn.commit()

print("Database and Table Created Successfully")

conn.close()