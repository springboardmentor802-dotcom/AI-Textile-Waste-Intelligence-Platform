import sqlite3

conn = sqlite3.connect("textile_waste.db")

print("Database Connected Successfully")

conn.close()