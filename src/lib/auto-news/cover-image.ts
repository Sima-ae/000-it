import { createHash } from "node:crypto";
import { mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export type NewsCoverInput = {
  id: string;
  title: string;
  industry?: string | null;
  tags?: string[] | null;
  excerpt?: string | null;
};

function seedFromId(id: string) {
  const hex = createHash("sha256").update(id).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) % 1_000_000_000;
}

function sanitizeFileId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h % 360} ${s}% ${l}%)`;
}

/** Build a visual prompt that matches the article topic. */
export function buildNewsCoverPrompt(input: NewsCoverInput) {
  const industry = (input.industry || "AI").trim().slice(0, 40);
  const topic = input.title.trim().slice(0, 90);
  return [
    "Editorial tech blog cover, cinematic, no text, no logo",
    topic,
    industry,
    "modern AI digital style, 16:9",
  ].join(" — ");
}

/** Deterministic unique remote cover URL (Pollinations, no API key). */
export function buildNewsCoverRemoteUrl(input: NewsCoverInput) {
  const prompt = buildNewsCoverPrompt(input);
  const seed = seedFromId(input.id);
  const params = new URLSearchParams({
    width: "1200",
    height: "630",
    nologo: "true",
    seed: String(seed),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

export function localNewsCoverPath(id: string) {
  return `/uploads/nieuws/${sanitizeFileId(id)}.jpg`;
}

/** Prefer local path when present; otherwise remote unique URL (seed/backfill). */
export function newsCoverForPost(input: NewsCoverInput) {
  return localNewsCoverPath(input.id);
}

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/** Unique local abstract cover so the blog never shows a broken image. */
export async function writeFallbackNewsCover(
  input: NewsCoverInput,
  absPath: string,
): Promise<void> {
  const seed = seedFromId(input.id);
  const h1 = seed % 360;
  const h2 = (seed * 7) % 360;
  const h3 = (seed * 13) % 360;
  const title = input.title.replace(/[<>&"]/g, "").slice(0, 48);
  const industry = (input.industry || "AI").replace(/[<>&"]/g, "").slice(0, 28);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${hsl(h1, 42, 18)}"/>
      <stop offset="55%" stop-color="${hsl(h2, 38, 24)}"/>
      <stop offset="100%" stop-color="${hsl(h3, 45, 16)}"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="30%" r="55%">
      <stop offset="0%" stop-color="${hsl(h2, 70, 55)}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${hsl(h2, 70, 55)}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="${180 + (seed % 200)}" cy="${140 + (seed % 120)}" r="${90 + (seed % 80)}" fill="${hsl(h1, 55, 48)}" opacity="0.22"/>
  <circle cx="${780 + (seed % 180)}" cy="${420 + (seed % 90)}" r="${120 + (seed % 70)}" fill="${hsl(h3, 50, 52)}" opacity="0.18"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
  <text x="96" y="480" fill="rgba(255,255,255,0.92)" font-family="Georgia, serif" font-size="34" font-weight="600">${title}</text>
  <text x="96" y="528" fill="rgba(255,255,255,0.55)" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20">${industry}</text>
</svg>`;

  await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toFile(absPath);
}

/**
 * Prefer a locally cached unique cover. Downloads from Pollinations when possible;
 * always ends with a working local `/uploads/nieuws/{id}.jpg` (fallback generated).
 */
export async function ensureNewsCoverImage(
  input: NewsCoverInput,
  opts?: {
    force?: boolean;
    publicDir?: string;
    download?: boolean;
    retries?: number;
    delayMs?: number;
  },
): Promise<string> {
  const publicDir = opts?.publicDir || join(process.cwd(), "public");
  const dir = join(publicDir, "uploads", "nieuws");
  await mkdir(dir, { recursive: true });

  const filename = `${sanitizeFileId(input.id)}.jpg`;
  const abs = join(dir, filename);
  const publicPath = localNewsCoverPath(input.id);

  if (!opts?.force && (await fileExists(abs))) {
    return publicPath;
  }

  const shouldDownload = opts?.download !== false;
  const remote = buildNewsCoverRemoteUrl(input);
  const retries = opts?.retries ?? 6;

  if (shouldDownload) {
    for (let attempt = 1; attempt <= retries; attempt += 1) {
      try {
        const res = await fetch(remote, {
          headers: { "User-Agent": "TripleZeroIT-NewsCovers/1.0" },
          signal: AbortSignal.timeout(90_000),
        });
        if (res.status === 429 || res.status === 503) {
          await sleep(opts?.delayMs ?? 2500 * attempt * attempt);
          continue;
        }
        if (!res.ok) {
          throw new Error(`Cover generation failed (${res.status}) for ${input.id}`);
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.byteLength < 1024) {
          throw new Error(`Cover too small for ${input.id}`);
        }
        // Normalize to jpeg via sharp
        await sharp(buffer).jpeg({ quality: 88 }).toFile(abs);
        return publicPath;
      } catch (error) {
        if (attempt >= retries) {
          console.warn(
            `[news-cover] fallback local cover for ${input.id}`,
            error instanceof Error ? error.message : error,
          );
          break;
        }
        await sleep(opts?.delayMs ?? 1500 * attempt);
      }
    }
  }

  await writeFallbackNewsCover(input, abs);
  return publicPath;
}
