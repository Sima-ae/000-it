#!/usr/bin/env tsx
/**
 * Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver, etc.).
 * Google does not use IndexNow — still free and useful for other engines.
 *
 * Usage: npm run indexnow
 *
 * Requires INDEXNOW_KEY in env (and public/{key}.txt must be reachable).
 * Optionally pass --generate to refresh the sitemap first.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { sitemapPublicOrigin } from "../src/lib/seo";
import { writeSitemapFiles } from "../src/lib/sitemap-builder";

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

function loadOrCreateKey(rootDir: string) {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  const key = fromEnv || randomBytes(16).toString("hex");
  const keyFile = join(rootDir, "public", `${key}.txt`);
  if (!existsSync(keyFile)) {
    writeFileSync(keyFile, key, "utf8");
    console.log(`[indexnow] Wrote key file public/${key}.txt`);
  }
  if (!fromEnv) {
    console.warn(
      `[indexnow] INDEXNOW_KEY not set — using ${key}. Add INDEXNOW_KEY=${key} to .env for stable key.`,
    );
  }
  return key;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function submitBatch(opts: {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
  endpoint: string;
}) {
  const res = await fetch(opts.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: opts.host,
      key: opts.key,
      keyLocation: opts.keyLocation,
      urlList: opts.urlList,
    }),
  });
  return { endpoint: opts.endpoint, status: res.status, ok: res.ok };
}

async function main() {
  const rootDir = process.cwd();
  const shouldGenerate = process.argv.includes("--generate");

  if (shouldGenerate) {
    console.log("[indexnow] Regenerating sitemap…");
    await writeSitemapFiles(rootDir);
  }

  const urlsPath = join(rootDir, "public", "sitemaps", "urls.json");
  if (!existsSync(urlsPath)) {
    console.log("[indexnow] urls.json missing — generating sitemap first…");
    await writeSitemapFiles(rootDir);
  }

  const payload = JSON.parse(readFileSync(urlsPath, "utf8")) as {
    urls?: string[];
    urlCount?: number;
    generatedAt?: string;
  };
  const urls = payload.urls || [];
  if (payload.generatedAt) {
    console.log(`[indexnow] urls.json generatedAt=${payload.generatedAt}`);
  }
  if (!urls.length) {
    console.error("[indexnow] No URLs to submit");
    process.exit(1);
  }

  const origin = sitemapPublicOrigin();
  const host = new URL(origin).host;
  if (host.includes("localhost") || host.startsWith("127.")) {
    console.warn(
      `[indexnow] Host is ${host}. IndexNow needs a public host. Set SITEMAP_BASE_URL=https://000-it.com`,
    );
  }

  const key = loadOrCreateKey(rootDir);
  const keyLocation = `${origin}/${key}.txt`;
  const batches = chunk(urls, 10000);

  console.log(`[indexnow] Submitting ${urls.length} URLs in ${batches.length} batch(es) for ${host}`);

  for (const batch of batches) {
    for (const endpoint of ENDPOINTS) {
      try {
        const result = await submitBatch({
          host,
          key,
          keyLocation,
          urlList: batch,
          endpoint,
        });
        console.log(`  ${result.endpoint} → HTTP ${result.status}${result.ok ? " OK" : ""}`);
      } catch (error) {
        console.warn(`  ${endpoint} → failed`, error);
      }
    }
  }

  console.log("[indexnow] Done");
}

main().catch((error) => {
  console.error("[indexnow] failed", error);
  process.exit(1);
});
