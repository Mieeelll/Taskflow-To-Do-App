# ============================================================================
# TaskFlow Frontend Dockerfile
# ============================================================================
# Purpose: Production-optimized Next.js frontend (standalone output)
# Build:   docker build -f docker/frontend/Dockerfile -t taskflow-frontend:latest .
# Run:     docker run -p 3000:3000 taskflow-frontend:latest
# Context: Project root (npm workspaces: root package.json + frontend workspace)
# ============================================================================

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

LABEL stage=builder

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY frontend ./frontend

RUN NODE_ENV=development npm ci

WORKDIR /app/frontend

ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ============================================================================
# Stage 2: Runtime (standalone)
# ============================================================================
FROM node:20-alpine AS runner

LABEL maintainer="TaskFlow Team"
LABEL version="1.0"
LABEL description="TaskFlow Next.js Frontend Container"

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

COPY docker/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => { if (r.statusCode !== 200) throw new Error(String(r.statusCode)) })" || exit 1

CMD ["/docker-entrypoint.sh"]
