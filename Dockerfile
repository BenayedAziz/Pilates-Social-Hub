# =============================================================================
# PilatesHub — Multi-stage Docker build
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Install dependencies
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy only the files pnpm needs to resolve the workspace dependency graph.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY artifacts/pilateshub/package.json artifacts/pilateshub/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Stage 2: Build frontend + API
# ---------------------------------------------------------------------------
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Restore workspace-internal node_modules that pnpm hoists
RUN pnpm install --frozen-lockfile --offline

# Build the frontend SPA
ENV PORT=5173
ENV BASE_PATH=/
RUN cd artifacts/pilateshub && pnpm build

# Build the API server (esbuild bundle)
RUN cd artifacts/api-server && pnpm build

# ---------------------------------------------------------------------------
# Stage 3: Production image (minimal)
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

# Copy the bundled API server
COPY --from=builder /app/artifacts/api-server/dist ./api

# Copy the built frontend assets (served by Express in production)
COPY --from=builder /app/artifacts/pilateshub/dist/public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "--enable-source-maps", "api/index.mjs"]
