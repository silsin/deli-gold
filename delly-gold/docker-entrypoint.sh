#!/bin/sh
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Delly Gold — Starting up"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run DB migrations + seed (idempotent — safe to run every startup)
echo "📦 Setting up database..."
node scripts/setup-db.mjs

# Ensure uploads directory exists on the persistent volume
mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

echo "🚀 Starting Next.js server..."
exec node server.js
