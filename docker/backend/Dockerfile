# ============================================================================
# TaskFlow Backend Dockerfile
# ============================================================================
# Purpose: Production-ready containerization of FastAPI backend
# Build:   docker build -f docker/backend/Dockerfile -t taskflow-backend:latest .
# Run:     docker run -p 8000:8000 taskflow-backend:latest
# Context: Project root (so COPY backend/... works)
# ============================================================================

FROM python:3.11-slim

# ============================================================================
# Metadata
# ============================================================================
LABEL maintainer="TaskFlow Team"
LABEL version="1.0"
LABEL description="TaskFlow FastAPI Backend Container"

# ============================================================================
# Environment Configuration
# ============================================================================
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app

WORKDIR /app

# ============================================================================
# System Dependencies
# ============================================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Python Dependencies
# ============================================================================
COPY backend/requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ============================================================================
# Application Code
# ============================================================================
COPY backend/ .

# ============================================================================
# Entrypoint Script
# ============================================================================
COPY docker/backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# ============================================================================
# Expose & Health Check
# ============================================================================
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ============================================================================
# Run Command
# ============================================================================
CMD ["/docker-entrypoint.sh"]
