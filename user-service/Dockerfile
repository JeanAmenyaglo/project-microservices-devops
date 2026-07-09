# ── Stage 1: Builder ────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
# Docker only re-runs npm ci if package.json changes
COPY package*.json ./
RUN npm ci

# Copy source code
COPY src ./src

# ── Stage 2: Production ──────────────────────
FROM node:20-alpine AS production

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built source from builder stage
COPY --from=builder /app/src ./src

# Switch to non-root user
USER appuser

# Port the service runs on
EXPOSE 3001

# Health check — hits /health endpoint every 30 seconds
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the service
CMD ["node", "src/index.js"]