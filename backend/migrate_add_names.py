import asyncio
from database import users_collection

async def migrate():
    updated_names = 0
    async for user in users_collection.find({"name": {"$exists": False}}):
        fallback_name = user["email"].split("@")[0].title()
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"name": fallback_name}},
        )
        updated_names += 1
        print(f"Set name for {user['email']} -> {fallback_name}")

    updated_prefs = 0
    async for user in users_collection.find({"email_notifications": {"$exists": False}}):
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"email_notifications": True}},
        )
        updated_prefs += 1
        print(f"Set email_notifications=True for {user['email']}")

    print(f"\nDone. Updated {updated_names} name(s), {updated_prefs} notification preference(s).")

if __name__ == "__main__":
    asyncio.run(migrate())