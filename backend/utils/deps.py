"""Dependency injection for FastAPI."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    # Test-friendly imports (when importing `backend.utils.deps`)
    from backend.utils.auth import verify_token
except ModuleNotFoundError:
    # Docker/entrypoint-friendly imports (when running from within `/app`)
    from utils.auth import verify_token

# Declares Bearer auth in OpenAPI so Swagger UI sends Authorization correctly
# (plain Header(...) is often omitted from generated requests in Swagger UI).
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Extract and validate JWT from Authorization header.
    Returns user_id (string) from token payload.
    Raises HTTPException(401) if missing or invalid.
    """
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return str(user_id)
