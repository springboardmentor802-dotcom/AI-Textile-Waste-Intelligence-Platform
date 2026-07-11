from app.database.database import engine

try:
    connection = engine.connect()
    print("✅ PostgreSQL Connected Successfully")
    connection.close()
except Exception as e:
    print("❌ Connection Failed")
    print(e)