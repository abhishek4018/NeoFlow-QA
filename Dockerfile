# ==========================================
# Stage 1: Build & Native Addon Compilation
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install compilation tools for native addons (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci && npm rebuild better-sqlite3 --build-from-source

# ==========================================
# Stage 2: Lean Production Runtime (~1.2 GB)
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install runtime dependencies: headless JRE (for Serenity reports) + essential utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jre-headless \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy source and then pre-compiled Linux dependencies from builder
COPY . .
COPY --from=builder /app/node_modules ./node_modules

# Install ONLY Chromium browser binary and its system dependencies
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx playwright install --with-deps chromium

ENV NODE_ENV=production
EXPOSE 8080

CMD ["npx", "ts-node", "--transpile-only", "src/care/daemon.ts"]
