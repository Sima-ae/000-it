#!/usr/bin/env bash
# Sequential content translation backfill (categories → pages SEO → news → kennisbank articles).
# Requires SSH tunnel to MariaDB on localhost:3306.
set -euo pipefail
cd "$(dirname "$0")/.."
LOG_DIR=/tmp/000-it-translate
mkdir -p "$LOG_DIR"

run() {
  local name="$1"
  shift
  echo "[$(date -u +%H:%M:%S)] START $name"
  "$@" >"$LOG_DIR/${name}.log" 2>&1
  local code=$?
  echo "[$(date -u +%H:%M:%S)] END $name exit=$code"
  echo "EXIT:$code" >>"$LOG_DIR/${name}.log"
  return $code
}

# Categories first (faster than articles)
if [[ "${SKIP_CATEGORIES:-}" != "1" ]]; then
  run kb-categories npx --yes tsx --env-file=.env scripts/translate-kennisbank.ts --categories-only
fi

run pages-seo npx --yes tsx --env-file=.env scripts/translate-content.ts --kinds=pages --deadline=7200000

run news npx --yes tsx --env-file=.env scripts/translate-news.ts --limit=250

# Articles in batches of 40 (504 NL-only + partials across 34 locales — long running)
offset=0
batch=40
while (( offset < 900 )); do
  name="kb-articles-${offset}"
  run "$name" npx --yes tsx --env-file=.env scripts/translate-kennisbank.ts --articles-only --offset="$offset" --limit="$batch" || true
  offset=$((offset + batch))
  # Quick coverage snapshot
  npx --yes tsx --env-file=.env scripts/audit-kb-coverage.ts >>"$LOG_DIR/coverage-snapshots.log" 2>&1 || true
done

echo "[$(date -u +%H:%M:%S)] ALL DONE"
npx --yes tsx --env-file=.env scripts/audit-kb-coverage.ts | tee "$LOG_DIR/final-coverage.log"
