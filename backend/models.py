"""Pydantic models for request/response validation."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    """Request body for creating a new to-do item."""

    title: str = Field(..., min_length=1, max_length=500, description="To-do title")
    description: Optional[str] = Field(default="", max_length=2000)
    completed: bool = Field(default=False)
    priority: Literal["low", "medium", "high"] = Field(default="medium")
    due_date: Optional[str] = Field(default=None, alias="dueDate")
    category: Optional[str] = Field(default="Uncategorized", max_length=100)

    model_config = {"populate_by_name": True}


class TodoUpdate(BaseModel):
    """Request body for updating an existing to-do item. All fields optional."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: Optional[bool] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    due_date: Optional[str] = Field(default=None, alias="dueDate")
    category: Optional[str] = Field(default=None, max_length=100)

    model_config = {"populate_by_name": True}


class TodoResponse(BaseModel):
    """Response model for a to-do item."""

    id: str
    title: str
    description: str
    completed: bool
    priority: str
    due_date: Optional[str] = None
    category: str
    created_at: str

    model_config = {"populate_by_name": True}
