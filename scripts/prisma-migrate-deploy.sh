#!/usr/bin/env bash
# Apply Prisma migrations, recovering from schema drift when objects already
# exist (e.g. created earlier via db push) but the migration row is missing.
set -euo pipefail

cd "$(dirname "$0")/.."

npx prisma generate

recover_drift() {
  node --input-type=module <<'EOF'
import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const prisma = new PrismaClient();

async function tableExists(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 AS ok FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1`,
    name,
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT 1 AS ok FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    table,
    column,
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function migrationFinished(name) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT finished_at, rolled_back_at
     FROM _prisma_migrations WHERE migration_name = ? LIMIT 1`,
    name,
  );
  const row = rows?.[0];
  return Boolean(row?.finished_at && !row?.rolled_back_at);
}

async function markApplied(migration, reason) {
  if (await migrationFinished(migration)) {
    console.log(`skip ${migration}: already marked applied`);
    return false;
  }
  console.log(`resolve --applied ${migration} (${reason})`);
  execSync(`npx prisma migrate resolve --applied ${migration}`, {
    stdio: "inherit",
  });
  return true;
}

const candidates = [
  {
    migration: "20260914093000_localized_copy",
    check: () => tableExists("LocalizedCopy"),
    reason: "table LocalizedCopy already exists",
  },
  {
    migration: "20260914100000_entity_slugs",
    check: () => tableExists("EntitySlug"),
    reason: "table EntitySlug already exists",
  },
  {
    migration: "20260915120000_news_trash",
    check: () => columnExists("NewsPost", "deletedAt"),
    reason: "NewsPost.deletedAt already exists",
  },
];

let resolved = 0;
for (const { migration, check, reason } of candidates) {
  if (!(await check())) {
    console.log(`skip ${migration}: precondition not met`);
    continue;
  }
  if (await markApplied(migration, reason)) resolved += 1;
}

await prisma.$disconnect();
process.exit(resolved > 0 ? 0 : 2);
EOF
}

attempts=0
max_attempts=4
while (( attempts < max_attempts )); do
  attempts=$((attempts + 1))
  echo "==> prisma migrate deploy (attempt ${attempts}/${max_attempts})"
  if npx prisma migrate deploy; then
    echo "==> Migrations OK"
    exit 0
  fi
  echo "==> migrate deploy failed — attempting drift recovery…"
  if ! recover_drift; then
    echo "ERROR: No recoverable schema drift found."
    exit 1
  fi
done

echo "ERROR: migrate deploy still failing after drift recovery."
exit 1
