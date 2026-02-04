# TaskFlow To-Do API

RESTful API for managing to-do items, built with Python and FastAPI.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/todos` | Create a new to-do item |
| GET | `/todos` | List all to-do items |
| GET | `/todos/{id}` | Get a single to-do by id |
| PUT | `/todos/{id}` | Update a to-do item |
| DELETE | `/todos/{id}` | Delete a to-do item |

## Request/Response

- **POST /todos** and **PUT /todos/{id}** use Pydantic models for validation.
- **404 Not Found** when a to-do with the given id does not exist.
- **400 Bad Request** for invalid or malformed request bodies.

## Example

```bash
# Create
curl -X POST http://localhost:8000/todos -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

# List
curl http://localhost:8000/todos

# Get one
curl http://localhost:8000/todos/{id}

# Update
curl -X PUT http://localhost:8000/todos/{id} -H "Content-Type: application/json" -d '{"completed":true}'

# Delete
curl -X DELETE http://localhost:8000/todos/{id}
```
