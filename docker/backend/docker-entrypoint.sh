#!/bin/bash
# ============================================================================
# TaskFlow Backend Entrypoint Script
# ============================================================================
# Purpose: Handles startup sequence and pre-flight checks
# ============================================================================

set -e

echo "=========================================="
echo "TaskFlow Backend Starting"
echo "=========================================="

# Check environment variables
echo "Checking environment variables..."
if [ -z "$MONGODB_URL" ]; then
    echo "ERROR: MONGODB_URL not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "ERROR: JWT_SECRET not set"
    exit 1
fi

echo "Environment variables OK"

# Start application with Gunicorn + Uvicorn workers
echo "Starting FastAPI application..."
exec gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    main:app
