#!/usr/bin/env node
/**
 * Upsert all bilingual 2026 news batches into NewsPost.
 * Usage: node --env-file=.env scripts/seed-news-batches.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "prisma", "data");
const prisma = new PrismaClient();

function loadBatches() {
  const files = readdirSync(dataDir)
    .filter((f) => /^news-batch-\d+\.json$/.test(f))
    .sort();
  const posts = [];
  for (const file of files) {
    const chunk = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
    if (!Array.isArray(chunk)) throw new Error(`${file} is not an array`);
    posts.push(...chunk);
  }
  return posts;
}

async function main() {
  const posts = loadBatches();
  const ids = new Set();
  for (const p of posts) {
    if (ids.has(p.id)) throw new Error(`Duplicate id ${p.id}`);
    ids.add(p.id);
  }

  const superAdmin = await prisma.user.findUnique({
    where: { email: "info@000-it.com" },
    select: { id: true },
  });
  if (!superAdmin) throw new Error("Super admin info@000-it.com not found");

  let upserted = 0;
  for (const item of posts) {
    const data = {
      title: item.title,
      titleNl: item.titleNl,
      excerpt: item.excerpt,
      excerptNl: item.excerptNl,
      date: item.date,
      coverImage: item.coverImage || null,
      author: item.author || "TripleZero iT",
      projectUrl: item.projectUrl || null,
      industry: item.industry || null,
      tags: item.tags || [],
      description: item.description,
      descriptionNl: item.descriptionNl,
      published: true,
      createdById: superAdmin.id,
    };
    await prisma.newsPost.upsert({
      where: { id: item.id },
      update: data,
      create: { id: item.id, ...data },
    });
    upserted += 1;
  }

  const total = await prisma.newsPost.count({ where: { published: true } });
  console.log(`Upserted ${upserted} batch posts. Published total: ${total}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
