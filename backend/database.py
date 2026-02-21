"""MongoDB connection and client setup."""

from motor.motor_asyncio import AsyncIOMotorClient

from config import settings

client: AsyncIOMotorClient | None = None


async def get_database():
    """Get MongoDB database instance."""
    global client
    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_url)
    return client[settings.database_name]


def get_users_collection(db):
    """Get users collection."""
    return db["users"]


def get_todos_collection(db):
    """Get todos collection."""
    return db["todos"]


async def init_indexes() -> None:
    """Create required indexes on startup."""
    try:
        db = await get_database()
        users = get_users_collection(db)
        todos = get_todos_collection(db)

        await users.create_index("email", unique=True)
        await users.create_index("username", unique=True)
        await todos.create_index("user_id")
        await todos.create_index("created_at")
        await todos.create_index("deleted_at")
        print("✅ MongoDB indexes created successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not create indexes: {e}")
        print("   Server will start, but indexes may need to be created manually.")
        # Don't raise - allow server to start even if MongoDB connection fails
