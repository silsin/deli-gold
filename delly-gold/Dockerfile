# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps — install all dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./

# Install with npm ci for reproducible builds
# --ignore-scripts prevents native postinstall scripts from failing at this stage
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: builder — compile Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Dummy values for build time only — real values come from docker-compose
ENV DATABASE_URL="file:/app/data/delly-gold.db"
ENV JWT_SECRET="build-time-placeholder"

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: runner — minimal production image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat tzdata wget

ENV TZ=Asia/Tehran
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Next.js standalone output ──
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── DB seed script & schema ──
COPY --from=builder --chown=nextjs:nodejs /app/scripts  ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/prisma   ./prisma

# ── Runtime deps needed by seed script (bcryptjs) ──
# standalone doesn't bundle them, so we copy from deps stage
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/bcryptjs            ./node_modules/bcryptjs
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/@types/bcryptjs     ./node_modules/@types/bcryptjs 2>/dev/null || true

# ── Persistent data volume ──
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# ── Entrypoint ──
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
