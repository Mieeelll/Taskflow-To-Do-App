#!/bin/sh
# ============================================================================
# TaskFlow Frontend Entrypoint Script
# ============================================================================

set -e

echo "=========================================="
echo "TaskFlow Frontend Starting"
echo "=========================================="

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
  echo "WARNING: NEXT_PUBLIC_API_URL not set (use build-time default)"
fi

echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-3000}"

exec node server.js
