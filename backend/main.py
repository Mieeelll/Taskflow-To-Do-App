"""FastAPI app initialization, CORS, routes."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from database import init_indexes
from routers import auth, todos

# Custom exception handler for consistent { error: string } format


def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": message, "status": status_code},
    )


async def http_exception_handler(request: Request, exc) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, list):
        msg = "; ".join(
            f"{e.get('loc', [])}: {e.get('msg', str(e))}" for e in detail
        )
    else:
        msg = str(detail)
    return error_response(exc.status_code, msg)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    msg = "; ".join(
        f"{'.'.join(str(l) for l in e.get('loc', []))}: {e.get('msg', '')}"
        for e in errors
    )
    return error_response(400, msg or "Validation error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create indexes. Shutdown: nothing."""
    await init_indexes()
    yield


app = FastAPI(
    title="TaskFlow API",
    description="Task management API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    """Health check for Docker and load balancers."""
    return {"status": "ok"}


app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# CORS: allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(todos.router, prefix="/api")
app.include_router(health.router, prefix="/api")
