import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()
MONGO_URI=os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("No MONGO_URI found in environment variables.")
client = AsyncIOMotorClient(
    MONGO_URI, 
    tlsCAFile=certifi.where()
)
db=client.textile_waste_db
users_collection=db.get_collection("users")
inventory_collection=db.get_collection("inventory")
ai_logs_collection=db.get_collection("ai_logs")