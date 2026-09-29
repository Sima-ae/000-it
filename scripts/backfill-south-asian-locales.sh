#!/usr/bin/env bash
# Backfill kennisbank / news / page SEO for bn,hi,mr,ps,pa,te,ur
# Requires MariaDB reachable at DATABASE_URL (SSH tunnel to localhost:3306).
set -euo pipefail
cd "$(dirname "$0")/.."
LOCALES=bn,hi,mr,ps,pa,te,ur
LOG_DIR=/tmp/000-it-translate-south-asian
mkdir -p "$LOG_DIR"

echo "[$(date -u +%H:%M:%S)] categories"
npx --yes tsx --env-file=.env scripts/translate-kennisbank.ts --categories-only --locale="$LOCALES" \
  | tee "$LOG_DIR/categories.log"

echo "[$(date -u +%H:%M:%S)] pages SEO (all enabled locales; new ones fill via enabledLanguages)"
npx --yes tsx --env-file=.env scripts/translate-content.ts --kinds=pages --deadline=7200000 \
  | tee "$LOG_DIR/pages.log"

echo "[$(date -u +%H:%M:%S)] news"
npx --yes tsx --env-file=.env scripts/translate-news.ts --limit=250 --locale="$LOCALES" \
  | tee "$LOG_DIR/news.log"

echo "[$(date -u +%H:%M:%S)] kennisbank articles"
offset=0
batch=40
while (( offset < 900 )); do
  echo "[$(date -u +%H:%M:%S)] articles offset=$offset"
  npx --yes tsx --env-file=.env scripts/translate-kennisbank.ts --articles-only --locale="$LOCALES" --offset="$offset" --limit="$batch" \
    | tee -a "$LOG_DIR/articles.log" || true
  offset=$((offset + batch))
done

echo "[$(date -u +%H:%M:%S)] DONE"
