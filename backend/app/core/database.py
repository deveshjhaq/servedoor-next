"""
database.py — MongoDB connection management.
Extracted business logic and repos to app/repositories.
"""
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from app.core.config import MONGO_URL, DB_NAME

logger = logging.getLogger(__name__)

class _Database:
    client: AsyncIOMotorClient = None
    database = None

db = _Database()

async def connect_to_mongo() -> None:
    """Open the Motor connection and create indexes."""
    if not MONGO_URL:
        raise RuntimeError("MONGO_URL is not set in config.")

    db.client = AsyncIOMotorClient(MONGO_URL)
    db.database = db.client[DB_NAME]

    await db.client.admin.command("ping")
    logger.info("Connected to MongoDB: %s", DB_NAME)
    await _create_indexes()

async def _create_indexes() -> None:
    """Create collection indexes."""
    col = db.database

    await col.users.create_index("email", unique=True, sparse=True)
    await col.users.create_index("phone", unique=True, sparse=True)
    
    await col.restaurants.create_index("isActive")
    await col.restaurants.create_index([("name", "text"), ("cuisine", "text"), ("tags", "text")])
    
    await col.carts.create_index("userId", unique=True)
    
    await col.orders.create_index("userId")
    await col.orders.create_index("restaurantId")
    await col.orders.create_index("status")
    await col.orders.create_index("createdAt")
    
    # TTL index
    await col.otp_storage.create_index("expires_at", expireAfterSeconds=0)
    await col.otp_storage.create_index("phone")
    
    await col.notifications.create_index("userId")
    await col.notifications.create_index("isRead")
    await col.wallets.create_index("userId", unique=True)

    logger.info("MongoDB indexes verified.")

async def close_mongo_connection() -> None:
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")
