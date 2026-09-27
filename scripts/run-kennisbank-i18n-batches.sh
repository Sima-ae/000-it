#!/usr/bin/env bash
# Durable kennisbank translation runner.
# 1) Repair missing EN in batches of 20
# 2) Fill all other locales from EN (categories + articles)
#
# Usage:
#   bash scripts/run-kennisbank-i18n-batches.sh
#   LIMIT=15 bash scripts/run-kennisbank-i18n-batches.sh
set -euo pipefail
cd "$(dirname "$0")/.."

LIMIT="${LIMIT:-20}"
DELAY="${DELAY:-2200}"
FIELD_DELAY="${FIELD_DELAY:-550}"
SLEEP_BETWEEN="${SLEEP_BETWEEN:-45}"

echo "[runner] refreshing missing-EN slug list"
npx --yes tsx --env-file=.env scripts/list-kennisbank-missing-en.ts

MISSING_COUNT=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("scripts/kennisbank-missing-en.json","utf8")).length)')
echo "[runner] missing EN articles: $MISSING_COUNT"

offset=0
while (( offset < MISSING_COUNT )); do
  echo ""
  echo "[runner] EN repair batch offset=$offset limit=$LIMIT"
  npm run kennisbank:repair -- --en-only \
    --slugs-file=scripts/kennisbank-missing-en.json \
    --offset="$offset" --limit="$LIMIT" \
    --delay="$DELAY" --field-delay="$FIELD_DELAY" || true
  offset=$((offset + LIMIT))
  sleep "$SLEEP_BETWEEN"
done

echo ""
echo "[runner] filling category + article locales from EN"
# Process articles in chunks so a crash can resume with --offset
art_offset=0
ART_LIMIT="${ART_LIMIT:-15}"
while true; do
  echo "[runner] kennisbank:translate articles offset=$art_offset limit=$ART_LIMIT"
  out=$(npm run kennisbank:translate -- --articles-only --offset="$art_offset" --limit="$ART_LIMIT" 2>&1 | tee /dev/stderr | tail -n 5)
  if echo "$out" | grep -q 'articles] 0'; then
    break
  fi
  # Stop when a full batch was all skipped and we're past known corpus
  art_offset=$((art_offset + ART_LIMIT))
  if (( art_offset > 2000 )); then
    break
  fi
  sleep "$SLEEP_BETWEEN"
done

echo "[runner] categories"
npm run kennisbank:translate -- --categories-only || true

echo "[runner] done"
npx --yes tsx --env-file=.env scripts/audit-kb-coverage.ts || true
