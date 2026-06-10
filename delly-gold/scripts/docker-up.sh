#!/bin/sh
# Run Delly Gold with plain Docker (no Compose required).
# Usage: ./scripts/docker-up.sh

set -e

cd "$(dirname "$0")/.."

# Load .env if present
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

APP_PORT="${APP_PORT:-4000}"
JWT_SECRET="${JWT_SECRET:-delly-gold-change-this-secret-in-production}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
IMAGE="${IMAGE:-delly-gold:latest}"
VOLUME="${VOLUME:-delly-gold-db}"
CONTAINER="${CONTAINER:-delly-gold}"

echo "→ Building image ${IMAGE}..."
docker build -t "${IMAGE}" .

echo "→ Ensuring volume ${VOLUME}..."
docker volume create "${VOLUME}" >/dev/null 2>&1 || true

echo "→ Replacing container ${CONTAINER}..."
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true

echo "→ Starting on port ${APP_PORT}..."
docker run -d \
  --name "${CONTAINER}" \
  --restart unless-stopped \
  -p "${APP_PORT}:3000" \
  -v "${VOLUME}:/app/data" \
  -e NODE_ENV=production \
  -e "DATABASE_URL=file:/app/data/delly-gold.db" \
  -e "JWT_SECRET=${JWT_SECRET}" \
  -e "JWT_EXPIRES_IN=${JWT_EXPIRES_IN}" \
  -e "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}" \
  "${IMAGE}"

echo ""
echo "✓ Delly Gold is running at http://localhost:${APP_PORT}"
echo "  Logs: docker logs -f ${CONTAINER}"
echo "  Stop: docker rm -f ${CONTAINER}"
