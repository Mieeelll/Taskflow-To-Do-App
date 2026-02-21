"""Pydantic models for request/response."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ----- Auth -----

class UserCreate(BaseModel):
    """Request body for user registration."""
    username: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """Request body for login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User in API responses (no password)."""
    id: str
    username: str
    email: str


class TokenResponse(BaseModel):
    """Login response with JWT and user."""
    token: str
    user: UserResponse


class RegisterSuccessResponse(BaseModel):
    """Registration success response."""
    success: bool = True
    message: str = "User created successfully"


# ----- Todos -----

class TodoCreate(BaseModel):
    """Request body for creating a todo."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    completed: bool = False
    priority: str = "medium"
    category: str = "Uncategorized"
    due_date: Optional[str] = None


class TodoUpdate(BaseModel):
    """Request body for updating a todo (all optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None


class TodoResponse(BaseModel):
    """Todo in API responses."""
    id: str
    title: str
    description: str
    completed: bool
    priority: str
    category: str
    due_date: str | None
    created_at: str
    updated_at: str


class TodoListResponse(BaseModel):
    """Paginated list of todos."""
    todos: list[TodoResponse]
    total: int


class ToggleCompleteBody(BaseModel):
    """Body for PATCH toggle-complete."""
    completed: bool


class ToggleCompleteResponse(BaseModel):
    """Response from PATCH /todos/{id}/toggle-complete endpoint."""
    id: str
    completed: bool
    updated_at: str


class DeleteResponse(BaseModel):
    """Response from DELETE /todos/{id} endpoint."""
    success: bool


class ErrorResponse(BaseModel):
    """Consistent error response format."""
    error: str
    status: Optional[int] = None
