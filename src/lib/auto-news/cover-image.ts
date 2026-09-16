/**
 * Server-only cover generation (sharp / filesystem).
 * Browser-safe path helpers live in `cover-paths.ts`.
 */
import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  coverApiPath,
  featuredCoverUrl,
  isCustomRemoteCover,
  localNewsCoverPath,
  sanitizeCoverFileId,
} from "@/lib/auto-news/cover-paths";

export type NewsCoverInput = {
  id: string;
  title: string;
  industry?: string | null;
  tags?: string[] | null;
  excerpt?: string | null;
};

export {
  coverApiPath,
  featuredCoverUrl,
  isCustomRemoteCover,
  localNewsCoverPath,
};

function seedFromId(id: string) {
  const hex = createHash("sha256").update(id).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) % 1_000_000_000;
}

function sanitizeFileId(id: string) {
  return sanitizeCoverFileId(id);
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${h % 360} ${s}% ${l}%)`;
}

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
/** Anonymous Pollinations images always burn in a corner logo; crop this much. */
const WATERMARK_MIN_PX = 52;
const WATERMARK_RATIO = 0.09;
const COVER_CLEAN_TAG = "000it-cover-clean";

function isTaggedClean(exif?: Buffer) {
  if (!exif) return false;
  return Buffer.from(exif).toString("latin1").includes(COVER_CLEAN_TAG);
}

async function isCoverClean(path: string) {
  try {
    const meta = await sharp(path, { failOn: "none" }).metadata();
    return isTaggedClean(meta.exif);
  } catch {
    return false;
  }
}

/**
 * Drop the Pollinations corner watermark, then normalize to 1200×630.
 * `nologo=true` is ignored by the current API, so this is the reliable fix.
 */
async function toCleanCoverJpeg(input: Buffer | string) {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const srcW = meta.width || COVER_WIDTH;
  const srcH = meta.height || COVER_HEIGHT;
  const stripPx = Math.max(WATERMARK_MIN_PX, Math.round(srcH * WATERMARK_RATIO));
  const extractH = Math.max(1, srcH - stripPx);
  return sharp(input, { failOn: "none" })
    .extract({ left: 0, top: 0, width: srcW, height: extractH })
    .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "top" })
    .jpeg({ quality: 88 })
    .withExif({ IFD0: { ImageDescription: COVER_CLEAN_TAG } })
    .toBuffer();
}

async function writeJpegAtomic(absPath: string, jpeg: Buffer) {
  const tmp = `${absPath}.tmp`;
  await writeFile(tmp, jpeg);
  await rename(tmp, absPath);
}

async function stripStoredCoverWatermark(absPath: string) {
  const jpeg = await toCleanCoverJpeg(await readFile(absPath));
  await writeJpegAtomic(absPath, jpeg);
}

/** Build a visual prompt that matches the article topic. */
export function buildNewsCoverPrompt(input: NewsCoverInput) {
  const industry = (input.industry || "AI").trim().slice(0, 40);
  const topic = input.title.trim().slice(0, 90);
  return [
    "Editorial tech blog cover, cinematic, no text, no logo, no watermark",
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
    width: String(COVER_WIDTH),
    height: String(COVER_HEIGHT),
    seed: String(seed),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
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

  const cx1 = 160 + (seed % 420);
  const cy1 = 90 + (seed % 260);
  const cx2 = 620 + ((seed * 3) % 480);
  const cy2 = 280 + ((seed * 5) % 240);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${hsl(h1, 48, 16)}"/>
      <stop offset="55%" stop-color="${hsl(h2, 42, 22)}"/>
      <stop offset="100%" stop-color="${hsl(h3, 50, 14)}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${40 + (seed % 40)}%" cy="${20 + (seed % 30)}%" r="58%">
      <stop offset="0%" stop-color="${hsl(h2, 78, 58)}" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="${hsl(h2, 78, 58)}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="${cx1}" cy="${cy1}" r="${110 + (seed % 90)}" fill="${hsl(h1, 62, 50)}" opacity="0.28"/>
  <circle cx="${cx2}" cy="${cy2}" r="${140 + ((seed * 11) % 80)}" fill="${hsl(h3, 58, 54)}" opacity="0.22"/>
  <polygon points="${200 + (seed % 80)},${480 + (seed % 40)} ${520 + (seed % 120)},${90 + (seed % 70)} ${860 + (seed % 90)},${500 + (seed % 50)}" fill="${hsl(h2, 40, 40)}" opacity="0.12"/>
  <rect x="64" y="64" width="1072" height="502" rx="28" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>
  <text x="96" y="480" fill="rgba(255,255,255,0.92)" font-family="Georgia, serif" font-size="34" font-weight="600">${title}</text>
  <text x="96" y="528" fill="rgba(255,255,255,0.55)" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20">${industry}</text>
</svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 86 })
    .withExif({ IFD0: { ImageDescription: COVER_CLEAN_TAG } })
    .toFile(absPath);
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
    if (!(await isCoverClean(abs))) {
      try {
        await stripStoredCoverWatermark(abs);
      } catch (error) {
        console.warn(
          `[news-cover] watermark strip failed for ${input.id}`,
          error instanceof Error ? error.message : error,
        );
      }
    }
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
        await writeJpegAtomic(abs, await toCleanCoverJpeg(buffer));
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
