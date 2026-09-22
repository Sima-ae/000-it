import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Meta/WhatsApp/etc. — link previews, not training crawlers. */
export const SOCIAL_BOT_RE =
  /facebookexternalhit|Facebot|WhatsApp|meta-externalagent|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|Pinterestbot|Iframely|vkShare|SkypeUriPreview/i;

/** Search engines we still want to index the marketing site. */
export const SEARCH_BOT_RE =
  /Googlebot|Google-InspectionTool|GoogleOther|Storebot-Google|AdsBot-Google|Mediapartners-Google|Bingbot|adidxbot|MicrosoftPreview|DuckDuckBot|Yandex(Bot|Images|Render|Favicons)?|Baiduspider|Applebot(?!-Extended)|Slurp|Sogou|SeznamBot/i;

/**
 * AI training crawlers, SEO scrapers, HTTP libraries, and headless tools.
 * Search/social UAs are checked first and never hit this list.
 */
export const SCRAPER_BOT_RE =
  /GPTBot|ChatGPT-User|OAI-SearchBot|CCBot|anthropic-ai|ClaudeBot|Claude-Web|Claude-SearchBot|Claude-User|Google-Extended|Google-CloudVertexBot|Bytespider|Amazonbot|Applebot-Extended|PerplexityBot|Perplexity-User|YouBot|cohere-ai|Diffbot|ImagesiftBot|Timpibot|FacebookBot|Meta-ExternalFetcher|omgili|PetalBot|TikTokSpider|AI2Bot|Ai2Bot-Dolma|iaskspider|DuckAssistBot|Webzio-Extended|img2dataset|FriendlyCrawler|ICC-Crawler|DataForSeoBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|BLEXBot|Seekport|BUbiNG|magpie-crawler|NewsNow|Awario|Scrapy|python-requests|python-urllib|aiohttp|httpx\/|libwww-perl|wget\/|curl\/|Go-http-client|Java\/|okhttp|Apache-HttpClient|PHP\/|node-fetch|undici|axios\/|PostmanRuntime|insomnia|httpunit|HTTrack|Nutch|mechanize|HeadlessChrome|Playwright|Puppeteer|PhantomJS|Selenium|Nightmare|jsdom|cheerio|htmlparser|libcurl|python-httpx|aiohttp\.client/i;

/** robots.txt user-agents that must not crawl anything (training / scrapers). */
export const ROBOTS_DISALLOW_ALL_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "Google-CloudVertexBot",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Claude-SearchBot",
  "Claude-User",
  "Bytespider",
  "Amazonbot",
  "Applebot-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "YouBot",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "FacebookBot",
  "Meta-ExternalFetcher",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "DataForSeoBot",
  "AI2Bot",
  "Timpibot",
] as const;

const WINDOW_MS = 60_000;
const UNIQUE_WINDOW_MS = 120_000;

const LIMITS = {
  search: 240,
  social: 80,
  // Raised for real browsers — Next.js RSC + prefetch used to trip these quickly.
  default: 360,
  content: 240,
  article: 180,
  api: 160,
  agent: 24,
  contact: 16,
  sitemap: 30,
} as const;

/** Unique article pages per 2 minutes — news/kennisbank prefetch burns this fast. */
const UNIQUE_ARTICLE_MAX = 90;

type LimitBucket = keyof typeof LIMITS;
type CounterBucket = { count: number; resetAt: number };
type UniqueBucket = { paths: Set<string>; resetAt: number };

const hits = new Map<string, CounterBucket>();
const uniqueHits = new Map<string, UniqueBucket>();

let pruneAt = 0;

function prune(now: number) {
  if (now < pruneAt) return;
  pruneAt = now + 30_000;
  if (hits.size > 4000) {
    for (const [key, bucket] of hits) {
      if (bucket.resetAt <= now) hits.delete(key);
    }
  }
  if (uniqueHits.size > 2000) {
    for (const [key, bucket] of uniqueHits) {
      if (bucket.resetAt <= now) uniqueHits.delete(key);
    }
  }
}

function take(key: string, limit: number, now: number, windowMs = WINDOW_MS) {
  const bucket = hits.get(key);
  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, retryAfter: Math.ceil(windowMs / 1000) };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false as const,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true as const, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

function takeUnique(key: string, path: string, now: number) {
  let bucket = uniqueHits.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { paths: new Set([path]), resetAt: now + UNIQUE_WINDOW_MS };
    uniqueHits.set(key, bucket);
    return { ok: true as const, retryAfter: Math.ceil(UNIQUE_WINDOW_MS / 1000) };
  }
  bucket.paths.add(path);
  if (bucket.paths.size > UNIQUE_ARTICLE_MAX) {
    return {
      ok: false as const,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true as const, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    ""
  );
}

function isLoopbackHost(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

function allowedOrigins(): string[] {
  const extra = [process.env.NEXT_PUBLIC_APP_URL, process.env.AUTH_URL]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  const origins = new Set([
    "https://000-it.com",
    "https://www.000-it.com",
    ...extra,
  ]);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3066");
    origins.add("http://127.0.0.1:3066");
  }
  return [...origins];
}

/** Browser fetch/XHR from this site (blocks curl/scripts spoofing a Mozilla UA). */
export function isSameSiteRequest(request: Request) {
  if (process.env.NODE_ENV !== "production") return true;
  const allowed = allowedOrigins();
  const origin = request.headers.get("origin") || "";
  if (origin) return allowed.includes(origin);
  const referer = request.headers.get("referer") || "";
  if (!referer) return false;
  try {
    return allowed.includes(new URL(referer).origin);
  } catch {
    return false;
  }
}

/** Cron, auth, webhooks, health — must keep working with curl / Stripe / GitHub. */
export function isAntiScrapeAllowlisted(pathname: string) {
  return (
    pathname === "/api/health" ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/shop/webhook" ||
    pathname === "/api/social-preview" ||
    // Product/media assets — never count toward API rate limits (shop grids load many).
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/api/uploads/") ||
    // On-demand news cover generation + serving (grid loads many in parallel).
    pathname.startsWith("/api/news/cover/")
  );
}

export function isSensitiveContentPath(internalPath: string, pathname: string) {
  if (pathname.startsWith("/api/kennisbank")) return true;
  if (pathname.startsWith("/api/news")) return true;
  if (pathname.startsWith("/api/portfolio")) return true;
  if (pathname.startsWith("/api/case-studies")) return true;
  if (pathname.startsWith("/api/agent-000")) return true;
  return (
    internalPath === "/kennisbank" ||
    internalPath.startsWith("/kennisbank/") ||
    internalPath === "/nieuws" ||
    internalPath.startsWith("/nieuws/")
  );
}

function isArticlePath(internalPath: string) {
  const parts = internalPath.split("/").filter(Boolean);
  return (
    (parts[0] === "kennisbank" && parts.length >= 3) ||
    (parts[0] === "nieuws" && parts.length >= 2)
  );
}

function looksLikeBrowser(request: NextRequest, ua: string) {
  if (!/Mozilla/i.test(ua)) return false;
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/") || pathname.startsWith("/uploads/")) {
    return true;
  }
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html") || accept.includes("text/x-component")) {
    return true;
  }
  if (accept.includes("image/")) return true;
  if (request.headers.get("rsc")) return true;
  if (request.headers.get("next-router-prefetch")) return true;
  if (request.headers.get("next-url")) return true;
  const dest = (request.headers.get("sec-fetch-dest") || "").toLowerCase();
  if (dest === "document" || dest === "empty" || dest === "image") return true;
  return false;
}

function limitBucketFor(pathname: string, internalPath: string): LimitBucket {
  if (pathname.startsWith("/api/agent-000")) return "agent";
  if (pathname.startsWith("/api/contact") || pathname.startsWith("/api/scans")) {
    return "contact";
  }
  if (pathname.startsWith("/api/")) return "api";
  if (pathname.startsWith("/sitemaps/") || pathname === "/sitemap.xml") {
    return "sitemap";
  }
  if (isArticlePath(internalPath)) return "article";
  if (isSensitiveContentPath(internalPath, pathname)) return "content";
  return "default";
}

/** Soft navigations / RSC / same-site clicks from a real browser session. */
function isInteractiveBrowser(request: NextRequest, kind: string) {
  if (kind !== "browser") return false;
  const site = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (site === "same-origin" || site === "same-site") return true;
  if (request.headers.get("rsc")) return true;
  if (request.headers.get("next-router-prefetch")) return true;
  if (request.headers.get("next-url")) return true;
  return isSameSiteRequest(request);
}

export function classifyClient(request: NextRequest): "search" | "social" | "browser" | "scraper" {
  const ua = request.headers.get("user-agent") || "";
  if (SOCIAL_BOT_RE.test(ua)) return "social";
  if (SEARCH_BOT_RE.test(ua)) return "search";
  if (!ua.trim()) return "scraper";
  if (SCRAPER_BOT_RE.test(ua)) return "scraper";
  if (looksLikeBrowser(request, ua)) return "browser";
  return "scraper";
}

function denied(request: NextRequest, status: 403 | 429, retryAfter?: number) {
  const wantsJson =
    request.nextUrl.pathname.startsWith("/api/") ||
    (request.headers.get("accept") || "").includes("application/json");
  const headers = new Headers();
  applySecurityHeaders(headers, request.nextUrl.pathname, "/");
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  if (wantsJson) {
    const body =
      status === 429
        ? { error: "Too many requests", retryAfter: retryAfter ?? 60 }
        : { error: "Forbidden" };
    return new NextResponse(JSON.stringify(body), {
      status,
      headers: { ...Object.fromEntries(headers), "content-type": "application/json" },
    });
  }
  headers.set("content-type", "text/html; charset=utf-8");
  if (status === 429) {
    const wait = Math.max(1, retryAfter ?? 30);
    return new NextResponse(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="${wait}"><title>Even geduld</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1 style="font-size:1.25rem">Even geduld…</h1><p>Je bladert even te snel. Deze pagina vernieuwt automatisch over ${wait} seconden.</p><p><a href="">Opnieuw proberen</a></p></body></html>`,
      { status, headers },
    );
  }
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Forbidden</title></head><body><p>Access denied.</p></body></html>`,
    { status, headers },
  );
}

export function applySecurityHeaders(
  headers: Headers,
  pathname: string,
  internalPath: string,
) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  if (pathname.startsWith("/api/")) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noai, noimageai");
    return;
  }
  const kennisbank =
    internalPath === "/kennisbank" || internalPath.startsWith("/kennisbank/");
  headers.set(
    "X-Robots-Tag",
    kennisbank ? "noai, noimageai, noarchive" : "noai, noimageai",
  );
  if (kennisbank) {
    headers.set("Cache-Control", "private, no-store");
  }
}

export function withSecurityHeaders(
  response: NextResponse,
  pathname: string,
  internalPath: string,
) {
  applySecurityHeaders(response.headers, pathname, internalPath);
  return response;
}

/**
 * Returns a 403/429 response for scrapers and bulk harvesters, or null to continue.
 * Skipped on localhost (dev + VPS health curl to :3066) and allowlisted APIs.
 */
export function antiScrapeResponse(
  request: NextRequest,
  internalPath: string,
): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/sitemaps/urls.json") {
    return denied(request, 403);
  }

  if (isAntiScrapeAllowlisted(pathname)) return null;

  if (process.env.NODE_ENV !== "production" || isLoopbackHost(request)) {
    return null;
  }

  if (process.env.ANTI_SCRAPE_DISABLED === "1") return null;

  const kind = classifyClient(request);
  if (kind === "scraper") {
    return denied(request, 403);
  }

  const ip = clientIp(request) || "unknown";
  if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return null;
  }

  const now = Date.now();
  prune(now);

  const interactive = isInteractiveBrowser(request, kind);
  const bucket = limitBucketFor(pathname, internalPath);

  // Real in-site browsing (RSC / same-origin) should not trip scrape caps on pages.
  // Keep tighter limits only for contact/agent/API abuse and anonymous scrapers.
  if (interactive && (bucket === "default" || bucket === "content" || bucket === "article")) {
    return null;
  }

  let limit: number = LIMITS[bucket];
  if (kind === "search") limit = LIMITS.search;
  else if (kind === "social") limit = Math.min(limit, LIMITS.social);

  // Separate counters per bucket so page hits never exhaust the API budget.
  const counted = take(`${kind}:${bucket}:${ip}`, limit, now);
  if (!counted.ok) return denied(request, 429, counted.retryAfter);

  // Unique-article cap only for non-interactive clients (harvesting many slugs).
  if (kind === "browser" && !interactive && isArticlePath(internalPath)) {
    const unique = takeUnique(`article:${ip}`, pathname.split("?")[0] || pathname, now);
    if (!unique.ok) return denied(request, 429, unique.retryAfter);
  }

  return null;
}
