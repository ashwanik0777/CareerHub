# syntax=docker/dockerfile:1
# Debian-based image: onnxruntime-node ships glibc prebuilts that do not run on Alpine/musl.
FROM node:24-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=1
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
# openssl: required by Prisma's query engine (slim images ship without libssl,
# which breaks Prisma's OpenSSL detection and engine loading).
RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Builder. Layers are ordered so the expensive steps cache:
#   1. manifests only  -> pnpm install   (survives ANY source change)
#   2. prisma schema   -> prisma generate (survives non-schema changes)
#   3. full source     -> package dist builds + next build
# The pnpm store lives in a BuildKit cache mount, so even when the install
# layer is invalidated, packages come from the local store, not the network.
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY apps/extension/package.json apps/extension/
COPY packages/ai-model/package.json packages/ai-model/
COPY packages/api-client/package.json packages/api-client/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/profile-engine/package.json packages/profile-engine/
COPY packages/semantic-engine/package.json packages/semantic-engine/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY packages/utils/package.json packages/utils/
COPY packages/validation/package.json packages/validation/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY packages/db/prisma packages/db/prisma
RUN pnpm --filter @platform/db exec prisma generate

COPY apps ./apps
COPY packages ./packages

# semantic-engine is the one workspace package consumed from dist/ (dist is
# dockerignored, so it must be compiled inside the container).
RUN pnpm --filter @platform/semantic-engine build

# APP selects which Next.js app to build: "web" (default) or "admin".
ARG APP=web
ENV BUILD_STANDALONE=true
RUN --mount=type=cache,id=next-cache-${APP},target=/app/apps/${APP}/.next/cache \
    pnpm --filter platform-${APP} build

# ---------------------------------------------------------------------------
# Runner: minimal standalone server. The standalone output mirrors the repo
# layout (apps/<app>/server.js, packages/ai-model/model/**, node_modules).
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

ARG APP=web
ENV APP=${APP}

COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static

USER nextjs
EXPOSE 3000

# HEALTHCHECK_PATH: '/api/ai/health' for web, '/' for admin (no API routes there).
ENV HEALTHCHECK_PATH=/
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+(process.env.HEALTHCHECK_PATH||'/')).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "node apps/${APP}/server.js"]
