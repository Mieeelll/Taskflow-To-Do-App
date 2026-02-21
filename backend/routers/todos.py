"""Todo CRUD routes. All require JWT authentication."""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database, get_todos_collection
from models.schemas import (
    DeleteResponse,
    TodoCreate,
    TodoListResponse,
    TodoResponse,
    TodoUpdate,
    ToggleCompleteBody,
    ToggleCompleteResponse,
)
from utils.deps import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])


def _to_response(doc: dict) -> TodoResponse:
    """Convert MongoDB document to TodoResponse."""
    created = doc.get("created_at")
    updated = doc.get("updated_at")
    due = doc.get("due_date")
    return TodoResponse(
        id=str(doc["_id"]),
        title=doc["title"],
        description=doc.get("description") or "",
        completed=doc.get("completed", False),
        priority=doc.get("priority", "medium"),
        category=doc.get("category", "Uncategorized"),
        due_date=due.isoformat() if due else None,
        created_at=created.isoformat() if created else "",
        updated_at=updated.isoformat() if updated else "",
    )


@router.get("", status_code=status.HTTP_200_OK)
async def list_todos(
    user_id: str = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> TodoListResponse:
    """List todos for authenticated user. Excludes soft-deleted."""
    db: AsyncIOMotorDatabase = await get_database()
    todos_coll = get_todos_collection(db)

    query: dict = {"user_id": ObjectId(user_id), "deleted_at": None}

    if completed is not None:
        query["completed"] = completed
    if priority:
        query["priority"] = priority
    if category:
        query["category"] = category
    if search and search.strip():
        query["$or"] = [
            {"title": {"$regex": search.strip(), "$options": "i"}},
            {"description": {"$regex": search.strip(), "$options": "i"}},
        ]

    cursor = todos_coll.find(query).sort("created_at", -1).skip(skip).limit(limit)
    total = await todos_coll.count_documents(query)
    items = [x async for x in cursor]

    return TodoListResponse(
        todos=[_to_response(d) for d in items],
        total=total,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_todo(
    body: TodoCreate,
    user_id: str = Depends(get_current_user),
) -> TodoResponse:
    """Create a new todo for authenticated user."""
    db: AsyncIOMotorDatabase = await get_database()
    todos_coll = get_todos_collection(db)

    if not body.title or not body.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required",
        )

    now = datetime.utcnow()
    due_date = None
    if body.due_date:
        try:
            due_date = datetime.fromisoformat(body.due_date.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid due_date format. Use ISO 8601 (e.g., 2024-12-31T23:59:59Z)",
            )

    doc = {
        "user_id": ObjectId(user_id),
        "title": body.title.strip(),
        "description": (body.description or "").strip(),
        "completed": body.completed,
        "priority": body.priority or "medium",
        "category": body.category or "Uncategorized",
        "due_date": due_date,
        "created_at": now,
        "updated_at": now,
        "deleted_at": None,
    }
    result = await todos_coll.insert_one(doc)
    doc["_id"] = result.inserted_id

    return _to_response(doc)


@router.put("/{todo_id}", status_code=status.HTTP_200_OK)
async def update_todo(
    todo_id: str,
    body: TodoUpdate,
    user_id: str = Depends(get_current_user),
) -> TodoResponse:
    """Update a todo. Only owner can update."""
    db: AsyncIOMotorDatabase = await get_database()
    todos_coll = get_todos_collection(db)

    try:
        oid = ObjectId(todo_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    doc = await todos_coll.find_one({"_id": oid, "user_id": ObjectId(user_id), "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    update_data: dict = {}
    if body.title is not None:
        if not body.title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title cannot be empty")
        update_data["title"] = body.title.strip()
    if body.description is not None:
        update_data["description"] = body.description.strip()
    if body.completed is not None:
        update_data["completed"] = body.completed
    if body.priority is not None:
        update_data["priority"] = body.priority
    if body.category is not None:
        update_data["category"] = body.category
    if body.due_date is not None:
        try:
            update_data["due_date"] = datetime.fromisoformat(body.due_date.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid due_date format. Use ISO 8601 (e.g., 2024-12-31T23:59:59Z)",
            )

    if not update_data:
        return _to_response(doc)

    update_data["updated_at"] = datetime.utcnow()
    await todos_coll.update_one({"_id": oid}, {"$set": update_data})
    updated = await todos_coll.find_one({"_id": oid})
    return _to_response(updated)


@router.delete("/{todo_id}", status_code=status.HTTP_200_OK)
async def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user),
) -> DeleteResponse:
    """Soft delete a todo. Only owner can delete."""
    db: AsyncIOMotorDatabase = await get_database()
    todos_coll = get_todos_collection(db)

    try:
        oid = ObjectId(todo_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    result = await todos_coll.update_one(
        {"_id": oid, "user_id": ObjectId(user_id), "deleted_at": None},
        {"$set": {"deleted_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    return DeleteResponse(success=True)


@router.patch("/{todo_id}/toggle-complete", status_code=status.HTTP_200_OK)
async def toggle_complete(
    todo_id: str,
    body: ToggleCompleteBody,
    user_id: str = Depends(get_current_user),
) -> ToggleCompleteResponse:
    """Toggle completed status. Only owner can update."""
    db: AsyncIOMotorDatabase = await get_database()
    todos_coll = get_todos_collection(db)

    try:
        oid = ObjectId(todo_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    now = datetime.utcnow()
    result = await todos_coll.update_one(
        {"_id": oid, "user_id": ObjectId(user_id), "deleted_at": None},
        {"$set": {"completed": body.completed, "updated_at": now}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

    doc = await todos_coll.find_one({"_id": oid})
    return ToggleCompleteResponse(
        id=str(doc["_id"]),
        completed=doc["completed"],
        updated_at=doc["updated_at"].isoformat(),
    )
