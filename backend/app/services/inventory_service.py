from app.config.database import db
from bson import ObjectId


async def create_inventory(data: dict):
    result = await db.inventory.insert_one(data)

    inventory = await db.inventory.find_one(
        {"_id": result.inserted_id}
    )

    inventory["_id"] = str(inventory["_id"])

    return inventory


async def get_all_inventory():
    inventory = await db.inventory.find().to_list(length=1000)

    for item in inventory:
        item["_id"] = str(item["_id"])

    return inventory


async def get_inventory_by_id(inventory_id: str):
    item = await db.inventory.find_one(
        {"_id": ObjectId(inventory_id)}
    )

    if item:
        item["_id"] = str(item["_id"])

    return item


async def update_inventory(inventory_id: str, update_data: dict):
    await db.inventory.update_one(
        {"_id": ObjectId(inventory_id)},
        {"$set": update_data},
    )

    return await get_inventory_by_id(inventory_id)


async def delete_inventory(inventory_id: str):
    result = await db.inventory.delete_one(
        {"_id": ObjectId(inventory_id)}
    )

    return result.deleted_count > 0