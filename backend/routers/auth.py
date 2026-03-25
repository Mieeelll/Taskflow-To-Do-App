"""Authentication routes: register, login."""

import asyncio

from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

try:
    # Test-friendly imports (when importing `backend.routers.auth`)
    from backend.database import (
        ensure_mongo_available,
        get_database,
        get_users_collection,
    )
except ModuleNotFoundError:
    # Docker/entrypoint-friendly imports (when running from within `/app`)
    from database import ensure_mongo_available, get_database, get_users_collection
try:
    # Test-friendly imports (when importing `backend.routers.auth`)
    from backend.models.schemas import (
        LoginRequest,
        RegisterSuccessResponse,
        TokenResponse,
        UserCreate,
        UserResponse,
    )
    from backend.utils.auth import (
        create_access_token,
        hash_password,
        verify_password,
    )
except ModuleNotFoundError:
    # Docker/entrypoint-friendly imports (when running from within `/app`)
    from models.schemas import (
        LoginRequest,
        RegisterSuccessResponse,
        TokenResponse,
        UserCreate,
        UserResponse,
    )
    from utils.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate) -> RegisterSuccessResponse:
    """
    Register a new user.
    Returns 201 on success, 409 if email or username already exists.
    """
    try:
        await ensure_mongo_available(use_cache=False)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from e

    db: AsyncIOMotorDatabase = await get_database()
    users = get_users_collection(db)

    email_lower = body.email.lower()
    username_lower = body.username.lower()

    # Check for existing email or username (case-insensitive)
    try:
        existing = await asyncio.wait_for(
            users.find_one(
                {
                    "$or": [
                        {"email": {"$regex": f"^{email_lower}$", "$options": "i"}},
                        {
                            "username": {
                                "$regex": f"^{username_lower}$",
                                "$options": "i",
                            }
                        },
                    ]
                },
                max_time_ms=4000,
            ),
            timeout=6,
        )
    except asyncio.TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from e
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already exists",
        )

    hashed = hash_password(body.password)
    from datetime import datetime
    now = datetime.utcnow()
    doc = {
        "username": body.username,
        "email": email_lower,
        "password": hashed,
        "created_at": now,
        "updated_at": now,
    }
    try:
        await asyncio.wait_for(users.insert_one(doc), timeout=6)
    except asyncio.TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from e

    return RegisterSuccessResponse(message="User created successfully")


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(body: LoginRequest) -> TokenResponse:
    """
    Authenticate user and return JWT token.
    Returns 401 if invalid email or password.
    """
    try:
        await ensure_mongo_available(use_cache=False)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from e

    db: AsyncIOMotorDatabase = await get_database()
    users = get_users_collection(db)

    try:
        user = await asyncio.wait_for(
            users.find_one({"email": body.email.lower()}, max_time_ms=4000),
            timeout=6,
        )
    except asyncio.TimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed",
        ) from e
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token(data={"user_id": user_id})

    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            username=user["username"],
            email=user["email"],
        ),
    )
