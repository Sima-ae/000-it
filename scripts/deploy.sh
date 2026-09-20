#!/usr/bin/env bash
# Run on the VPS after code is updated. Intended to run as root.
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"
PORT="${PORT:-3066}"
PM2_NAME="${PM2_NAME:-000-it}"

if [[ "$(uname -s)" == "Darwin" && "$APP_DIR" == /Users/* && "${DEPLOY_ALLOW_LOCAL:-}" != "1" ]]; then
  echo "ERROR: scripts/deploy.sh is for the VPS only — not your Mac."
  echo "Push to main → GitHub Actions deploys, or:"
  echo "  ssh root@89.116.38.197 'cd /var/www/000-it.com && bash scripts/deploy.sh'"
  exit 1
fi

echo "==> Deploy 000-it in $APP_DIR"

if [[ ! -d .git ]]; then
  echo "ERROR: $APP_DIR is not a git repository."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "ERROR: Missing .env — copy .env.vps.example to .env and configure secrets."
  exit 1
fi

# Load .env without bash interpreting &, $, spaces in values (e.g. DATABASE_URL query params).
eval "$(
  node --input-type=module <<'NODE'
import fs from "node:fs";
const text = fs.readFileSync(".env", "utf8");
for (const raw of text.split(/\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq <= 0) continue;
  const key = line.slice(0, eq).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
  let val = line.slice(eq + 1);
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  const escaped = val.replace(/'/g, `'\\''`);
  process.stdout.write(`export ${key}='${escaped}'\n`);
}
NODE
)"

echo "==> Install dependencies"
if [[ "${SKIP_BUILD:-}" == "1" ]]; then
  # Runtime-only install (CI already built .next)
  npm ci --omit=dev
else
  # Full install including Tailwind/PostCSS (ignore production NODE_ENV from .env)
  NODE_ENV=development npm ci
fi

if [[ "${SKIP_BUILD:-}" == "1" ]]; then
  if [[ ! -f .next/BUILD_ID ]]; then
    echo "ERROR: SKIP_BUILD=1 but .next/BUILD_ID is missing."
    exit 1
  fi
  echo "==> Skip Next.js build (using pre-built .next from CI)"
else
  echo "==> Build Next.js (production)"
  NODE_ENV=production npm run build
fi

echo "==> Test MariaDB before restart"
if ! node --env-file=.env scripts/check-db.mjs; then
  echo "ERROR: Cannot connect to MariaDB with .env on this server."
  exit 1
fi

echo "==> Prisma generate + migrate deploy"
chmod +x scripts/prisma-migrate-deploy.sh 2>/dev/null || true
bash scripts/prisma-migrate-deploy.sh

if [[ "${RUN_SEED:-}" == "1" ]]; then
  echo "==> Seeding database"
  npx tsx prisma/seed.ts || npm exec tsx prisma/seed.ts || true
fi

echo "==> Restart application (PM2: $PM2_NAME on :$PORT)"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_NAME" --update-env
  else
    pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" -- start
  fi
  pm2 save
else
  echo "WARN: pm2 not found. Start manually: npm run start"
fi

sleep 2
echo "==> Health check"
if curl -sf "http://127.0.0.1:${PORT}/api/health" | grep -q '"ok":true'; then
  echo "OK: /api/health"
else
  echo "WARN: /api/health failed (check: pm2 logs $PM2_NAME --lines 50)"
fi

echo "==> Deploy finished OK"
echo "==> Commit: $(git log -1 --oneline)"
echo "NOTE: App listens on port ${PORT}. LiteSpeed/nginx must proxy to ${PORT}."
