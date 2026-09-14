#!/usr/bin/env tsx
/**
 * Submit sitemap URLs to IndexNow (Bing, Yandex, Seznam, Naver, etc.).
 * Google does not use IndexNow — still free and useful for other engines.
 *
 * Usage: npm run indexnow
 *
 * Requires a STABLE INDEXNOW_KEY in .env (and public/{key}.txt must be
 * publicly reachable at https://your-host/{key}.txt).
 *
 * Optionally pass --generate to refresh the sitemap first.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sitemapPublicOrigin } from "../src/lib/seo";
import { writeSitemapFiles } from "../src/lib/sitemap-builder";

const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

const KEY_RE = /^[a-f0-9]{8,128}$/i;

/** Load KEY=VALUE from a .env file without overriding already-set process.env. */
function loadDotEnvFile(rootDir: string) {
  const envPath = join(rootDir, ".env");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function findExistingKeyFiles(rootDir: string): string[] {
  const publicDir = join(rootDir, "public");
  if (!existsSync(publicDir)) return [];
  return readdirSync(publicDir)
    .filter((name) => name.endsWith(".txt") && KEY_RE.test(name.replace(/\.txt$/i, "")))
    .map((name) => name.replace(/\.txt$/i, "").toLowerCase());
}

/**
 * Resolve a stable IndexNow key. Never invent a new random key — that breaks
 * Bing/IndexNow verification (keyLocation must stay the same forever).
 */
function resolveKey(rootDir: string): string {
  loadDotEnvFile(rootDir);

  const fromEnv = (process.env.INDEXNOW_KEY || "").trim().toLowerCase();
  if (fromEnv) {
    if (!KEY_RE.test(fromEnv)) {
      throw new Error(
        `INDEXNOW_KEY looks invalid (${fromEnv.slice(0, 12)}…). Use 8–128 hex chars.`,
      );
    }
    return fromEnv;
  }

  const existing = findExistingKeyFiles(rootDir);
  if (existing.length === 1) {
    console.warn(
      `[indexnow] INDEXNOW_KEY missing in env — reusing existing public/${existing[0]}.txt`,
    );
    console.warn(
      `[indexnow] Add INDEXNOW_KEY=${existing[0]} to .env so deploys stay stable.`,
    );
    return existing[0];
  }

  if (existing.length > 1) {
    throw new Error(
      `[indexnow] INDEXNOW_KEY is not set, and multiple key files exist in public/: ${existing.join(", ")}. ` +
        `Pick one, set INDEXNOW_KEY=<that-key> in .env, delete the others, then re-run.`,
    );
  }

  throw new Error(
    "[indexnow] INDEXNOW_KEY is not set in .env (and no public/{key}.txt found). " +
      "Set INDEXNOW_KEY to a stable hex string (e.g. openssl rand -hex 16), " +
      "commit public/<key>.txt containing that same key, deploy, then re-run.",
  );
}

function ensureKeyFile(rootDir: string, key: string) {
  const keyFile = join(rootDir, "public", `${key}.txt`);
  const expected = key;
  if (existsSync(keyFile)) {
    const current = readFileSync(keyFile, "utf8").trim();
    if (current !== expected) {
      writeFileSync(keyFile, `${expected}\n`, "utf8");
      console.log(`[indexnow] Updated public/${key}.txt to match INDEXNOW_KEY`);
    }
  } else {
    writeFileSync(keyFile, `${expected}\n`, "utf8");
    console.log(`[indexnow] Wrote public/${key}.txt — commit & deploy this file`);
  }
  return keyFile;
}

async function verifyKeyLocation(keyLocation: string, key: string) {
  try {
    const res = await fetch(keyLocation, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "000-it-indexnow/1.0" },
    });
    const body = (await res.text()).trim();
    if (!res.ok) {
      console.error(
        `[indexnow] keyLocation check FAILED: ${keyLocation} → HTTP ${res.status}`,
      );
      console.error(
        "[indexnow] Bing/IndexNow will 403 until this URL returns the key as plain text.",
      );
      console.error(
        "[indexnow] Ensure public/<key>.txt is deployed and served (not only written on the VPS disk).",
      );
      return false;
    }
    if (body !== key) {
      console.error(
        `[indexnow] keyLocation body mismatch at ${keyLocation} (got ${JSON.stringify(body.slice(0, 40))})`,
      );
      return false;
    }
    console.log(`[indexnow] keyLocation OK: ${keyLocation}`);
    return true;
  } catch (error) {
    console.error(`[indexnow] keyLocation fetch failed: ${keyLocation}`, error);
    return false;
  }
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
  let detail = "";
  if (!res.ok) {
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
  }
  return {
    endpoint: opts.endpoint,
    status: res.status,
    ok: res.ok || res.status === 202,
    detail,
  };
}

async function main() {
  const rootDir = process.cwd();
  const shouldGenerate = process.argv.includes("--generate");
  const force = process.argv.includes("--force");

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

  const key = resolveKey(rootDir);
  ensureKeyFile(rootDir, key);
  const keyLocation = `${origin.replace(/\/$/, "")}/${key}.txt`;
  console.log(`[indexnow] Using stable key ${key}`);

  const verified = await verifyKeyLocation(keyLocation, key);
  if (!verified && !force) {
    console.error(
      "[indexnow] Aborting submit (key not publicly verifiable). Fix key file on the live host, then re-run.",
    );
    console.error(
      "[indexnow] Or pass --force to submit anyway (Bing will still 403 until the key URL works).",
    );
    process.exit(1);
  }

  const batches = chunk(urls, 10000);
  console.log(
    `[indexnow] Submitting ${urls.length} URLs in ${batches.length} batch(es) for ${host}`,
  );

  let failures = 0;
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
        const suffix = result.ok
          ? " OK"
          : result.detail
            ? ` — ${result.detail}`
            : "";
        console.log(`  ${result.endpoint} → HTTP ${result.status}${suffix}`);
        if (!result.ok) failures += 1;
      } catch (error) {
        failures += 1;
        console.warn(`  ${endpoint} → failed`, error);
      }
    }
  }

  if (failures) {
    console.error(`[indexnow] Done with ${failures} endpoint failure(s)`);
    process.exit(1);
  }
  console.log("[indexnow] Done");
}

main().catch((error) => {
  console.error("[indexnow] failed", error instanceof Error ? error.message : error);
  process.exit(1);
});
