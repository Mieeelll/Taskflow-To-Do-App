# ============================================================================
# TaskFlow Frontend Dockerfile
# ============================================================================
# Purpose: Production-optimized Next.js frontend (standalone output)
# Build:   docker build -f docker/frontend/Dockerfile -t taskflow-frontend:latest .
# Run:     docker run -p 3000:3000 taskflow-frontend:latest
# Context: Project root
# ============================================================================

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

LABEL stage=builder

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./

RUN npm ci

# Copy source explicitly so app/lib are always included (avoids .dockerignore/context issues)
COPY app ./app
COPY lib ./lib
COPY public ./public
COPY next.config.js tsconfig.json ./
COPY next-env.d.ts ./
COPY . .

# Build-time API URL
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

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Entrypoint (optional wrapper; can also CMD node server.js directly)
COPY docker/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => { if (r.statusCode !== 200) throw new Error(String(r.statusCode)) })" || exit 1

CMD ["/docker-entrypoint.sh"]
