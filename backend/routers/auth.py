"""Authentication routes: register, login."""

from fastapi import APIRouter, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database, get_users_collection
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
    db: AsyncIOMotorDatabase = await get_database()
    users = get_users_collection(db)

    email_lower = body.email.lower()
    username_lower = body.username.lower()

    # Check for existing email or username (case-insensitive)
    existing = await users.find_one(
        {"$or": [
            {"email": {"$regex": f"^{email_lower}$", "$options": "i"}},
            {"username": {"$regex": f"^{username_lower}$", "$options": "i"}},
        ]}
    )
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
    result = await users.insert_one(doc)

    return RegisterSuccessResponse(message="User created successfully")


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(body: LoginRequest) -> TokenResponse:
    """
    Authenticate user and return JWT token.
    Returns 401 if invalid email or password.
    """
    db: AsyncIOMotorDatabase = await get_database()
    users = get_users_collection(db)

    user = await users.find_one({"email": body.email.lower()})
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
