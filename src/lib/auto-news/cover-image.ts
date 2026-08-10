import { createHash } from "node:crypto";
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

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
    enhance: "true",
    seed: String(seed),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

export function localNewsCoverPath(id: string) {
  return `/uploads/nieuws/${sanitizeFileId(id)}.jpg`;
}

/** Stable unique cover for seed/DB — always unique per post id + title. */
export function newsCoverForPost(input: NewsCoverInput) {
  return buildNewsCoverRemoteUrl(input);
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

/**
 * Prefer a locally cached unique cover. If download fails (rate limits), fall back
 * to the deterministic remote Pollinations URL so every post still has a unique image.
 */
export async function ensureNewsCoverImage(
  input: NewsCoverInput,
  opts?: { force?: boolean; publicDir?: string; download?: boolean },
): Promise<string> {
  const remote = buildNewsCoverRemoteUrl(input);
  const shouldDownload = opts?.download !== false;
  if (!shouldDownload) return remote;

  const publicDir = opts?.publicDir || join(process.cwd(), "public");
  const dir = join(publicDir, "uploads", "nieuws");
  await mkdir(dir, { recursive: true });

  const filename = `${sanitizeFileId(input.id)}.jpg`;
  const abs = join(dir, filename);
  const publicPath = localNewsCoverPath(input.id);

  if (!opts?.force && (await fileExists(abs))) {
    return publicPath;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const res = await fetch(remote, {
        headers: { "User-Agent": "TripleZeroIT-NewsCovers/1.0" },
        signal: AbortSignal.timeout(120_000),
      });
      if (res.status === 429) {
        await sleep(1500 * attempt * attempt);
        continue;
      }
      if (!res.ok) {
        throw new Error(`Cover generation failed (${res.status}) for ${input.id}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength < 1024) {
        throw new Error(`Cover too small for ${input.id}`);
      }
      await writeFile(abs, buffer);
      return publicPath;
    } catch (error) {
      if (attempt >= 4) {
        console.warn(
          `[news-cover] using remote fallback for ${input.id}`,
          error instanceof Error ? error.message : error,
        );
        return remote;
      }
      await sleep(1000 * attempt);
    }
  }

  return remote;
}
