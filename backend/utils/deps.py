"""Dependency injection for FastAPI."""

from fastapi import Header, HTTPException, status

from utils.auth import verify_token


async def get_current_user(authorization: str = Header(...)) -> str:
    """
    Extract and validate JWT from Authorization header.
    Returns user_id (string) from token payload.
    Raises HTTPException(401) if missing or invalid.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization[7:]  # Remove "Bearer " prefix
    payload = verify_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return str(user_id)
