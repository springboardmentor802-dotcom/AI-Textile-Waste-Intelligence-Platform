from app.config.database import db
import asyncio

async def test():
    result = await db.users.insert_one({
        "name": "Test User"
    })

    print("Inserted ID:", result.inserted_id)

asyncio.run(test())