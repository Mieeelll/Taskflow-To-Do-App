"""MongoDB connection and client setup."""

import asyncio
import time

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

try:
    # Test-friendly imports (when importing `backend.*` as a package)
    from backend.config import settings
except ModuleNotFoundError:
    # Docker/entrypoint-friendly imports (when running from within `/app`)
    from config import settings

client: AsyncIOMotorClient | None = None

_mongo_check_lock = asyncio.Lock()
_mongo_available: bool | None = None
_mongo_checked_until_ts: float = 0.0


async def get_database():
    """Get MongoDB database instance."""
    global client
    if client is None:
        # Motor creates the client lazily; timeouts ensure auth requests fail fast
        # when MongoDB is unreachable (prevents frontend "Failed to fetch").
        client = AsyncIOMotorClient(
            settings.mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            maxPoolSize=10,
        )
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
        print("MongoDB indexes created successfully")
    except Exception as e:
        # Keep warning ASCII-only to avoid Windows console encoding crashes.
        print(f"Warning: Could not create indexes: {e}")
        print("Server will start, but indexes may need to be created manually.")
        # Don't raise - allow server to start even if MongoDB connection fails


async def ensure_mongo_available(
    cache_seconds: int = 10,
    ping_timeout_ms: int = 2000,
    use_cache: bool = True,
) -> None:
    """
    Fail fast if MongoDB is unreachable.

    Motor's operations can take a while to time out when Mongo is down; this
    pre-flight ping returns quickly and prevents frontend requests from
    showing only "Failed to fetch".
    """
    global _mongo_available, _mongo_checked_until_ts

    now = time.time()
    if use_cache and _mongo_available is not None and now < _mongo_checked_until_ts:
        if not _mongo_available:
            raise RuntimeError("MongoDB unavailable")
        return

    async with _mongo_check_lock:
        now = time.time()
        if use_cache and _mongo_available is not None and now < _mongo_checked_until_ts:
            if not _mongo_available:
                raise RuntimeError("MongoDB unavailable")
            return

        def _ping() -> None:
            mc = MongoClient(
                settings.mongodb_url,
                serverSelectionTimeoutMS=ping_timeout_ms,
                connectTimeoutMS=ping_timeout_ms,
            )
            mc.admin.command("ping")

        try:
            # Run synchronously to avoid thread-pool contention delaying
            # request error handling.
            _ping()
        except Exception as e:
            _mongo_available = False
            _mongo_checked_until_ts = time.time() + cache_seconds
            raise RuntimeError("MongoDB unavailable") from e
        else:
            _mongo_available = True
            _mongo_checked_until_ts = time.time() + cache_seconds
