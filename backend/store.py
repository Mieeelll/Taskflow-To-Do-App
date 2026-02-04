"""In-memory store for to-do items."""

from datetime import datetime
from typing import Dict
import uuid

from models import TodoCreate, TodoUpdate, TodoResponse


_todos: Dict[str, dict] = {}


def _to_response(data: dict) -> TodoResponse:
    return TodoResponse(
        id=data["id"],
        title=data["title"],
        description=data["description"],
        completed=data["completed"],
        priority=data["priority"],
        due_date=data.get("due_date"),
        category=data["category"],
        created_at=data["created_at"],
    )


def create_todo(payload: TodoCreate) -> TodoResponse:
    """Create a new to-do item."""
    todo_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"
    data = {
        "id": todo_id,
        "title": payload.title,
        "description": payload.description or "",
        "completed": payload.completed,
        "priority": payload.priority,
        "due_date": payload.model_dump().get("due_date"),
        "category": payload.category or "Uncategorized",
        "created_at": now,
    }
    _todos[todo_id] = data
    return _to_response(data)


def get_all_todos() -> list[TodoResponse]:
    """List all to-do items."""
    return [_to_response(t) for t in _todos.values()]


def get_todo_by_id(todo_id: str) -> TodoResponse | None:
    """Retrieve a single to-do by id."""
    data = _todos.get(todo_id)
    return _to_response(data) if data else None


def update_todo(todo_id: str, payload: TodoUpdate) -> TodoResponse | None:
    """Update an existing to-do item."""
    data = _todos.get(todo_id)
    if not data:
        return None
    update_dict = payload.model_dump(by_alias=True, exclude_none=True)
    key_map = {"dueDate": "due_date"}
    for key, value in update_dict.items():
        storage_key = key_map.get(key, key)
        if storage_key in data:
            data[storage_key] = value
    return _to_response(data)


def delete_todo(todo_id: str) -> bool:
    """Delete a to-do item. Returns True if deleted, False if not found."""
    if todo_id in _todos:
        del _todos[todo_id]
        return True
    return False
