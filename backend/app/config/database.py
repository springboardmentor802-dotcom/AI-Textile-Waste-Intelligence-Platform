from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

print("=" * 60)
print("MongoDB URL:", settings.MONGODB_URL)
print("Database:", settings.DATABASE_NAME)
print("=" * 60)

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]