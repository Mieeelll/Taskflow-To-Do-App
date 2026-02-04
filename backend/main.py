"""RESTful API to manage to-do items."""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from models import TodoCreate, TodoUpdate, TodoResponse
from store import (
    create_todo,
    get_all_todos,
    get_todo_by_id,
    update_todo,
    delete_todo,
)

app = FastAPI(
    title="TaskFlow To-Do API",
    description="RESTful API for managing to-do items",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return 400 Bad Request for invalid request bodies."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.errors()},
    )


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo_item(payload: TodoCreate):
    """Create a new to-do item."""
    return create_todo(payload)


@app.get("/todos", response_model=list[TodoResponse])
def list_todos():
    """List all to-do items."""
    return get_all_todos()


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: str):
    """Retrieve a single to-do item by id."""
    todo = get_todo_by_id(todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"To-do item with id '{todo_id}' not found",
        )
    return todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo_item(todo_id: str, payload: TodoUpdate):
    """Update an existing to-do item."""
    todo = update_todo(todo_id, payload)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"To-do item with id '{todo_id}' not found",
        )
    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_item(todo_id: str):
    """Delete a to-do item."""
    deleted = delete_todo(todo_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"To-do item with id '{todo_id}' not found",
        )
