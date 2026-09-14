import { prisma } from "@/lib/prisma";
import { createNewsPost, completeNewsTranslations, slugifyNewsId } from "@/lib/news";
import { AUTO_NEWS_AUTHOR, AUTO_NEWS_PER_RUN } from "@/lib/auto-news/config";
import { ensureNewsCoverImage } from "@/lib/auto-news/cover-image";
import { fetchRecentAiStories } from "@/lib/auto-news/fetch-stories";
import {
  generateBilingualNewsDraft,
  looksLikeRawFeedCopy,
  sanitizeNewsDraft,
} from "@/lib/auto-news/generate";
import {
  getAmsterdamClock,
  isAutoNewsScheduleWindow,
  slugifyAutoNewsId,
} from "@/lib/auto-news/schedule";

export type AutoNewsRunOptions = {
  force?: boolean;
  limit?: number;
};

export type AutoNewsRunResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  date: string;
  weekday: string;
  hour: number;
  published: Array<{ id: string; title: string; titleNl: string; url: string }>;
  errors: string[];
};

function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0].replace(/\/$/, "");
  }
}

export async function runAutoNewsPublish(
  options: AutoNewsRunOptions = {},
): Promise<AutoNewsRunResult> {
  const clock = getAmsterdamClock();
  const limit = Math.min(Math.max(options.limit ?? AUTO_NEWS_PER_RUN, 1), 12);
  const result: AutoNewsRunResult = {
    ok: true,
    date: clock.isoDate,
    weekday: clock.weekday,
    hour: clock.hour,
    published: [],
    errors: [],
  };

  if (!options.force && !isAutoNewsScheduleWindow()) {
    return {
      ...result,
      ok: true,
      skipped: true,
      reason: `Outside daily 00:00 Europe/Amsterdam window (now ${clock.weekday} ${String(clock.hour).padStart(2, "0")}:${String(clock.minute).padStart(2, "0")})`,
    };
  }

  const dayPrefix = `auto-${clock.isoDate}-`;
  const alreadyToday = await prisma.newsPost.count({
    where: { id: { startsWith: dayPrefix } },
  });
  if (!options.force && alreadyToday >= limit) {
    return {
      ...result,
      ok: true,
      skipped: true,
      reason: `Already published ${alreadyToday} auto posts for ${clock.isoDate}`,
    };
  }

  const remaining = options.force ? limit : Math.max(limit - alreadyToday, 0);
  if (remaining <= 0) {
    return {
      ...result,
      ok: true,
      skipped: true,
      reason: "Nothing left to publish for this run",
    };
  }

  const stories = await fetchRecentAiStories(40);
  if (!stories.length) {
    return {
      ...result,
      ok: false,
      reason: "No AI stories fetched from RSS feeds",
      errors: ["empty_feeds"],
    };
  }

  const existing = await prisma.newsPost.findMany({
    select: { id: true, projectUrl: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const usedUrls = new Set(
    existing
      .map((p) => p.projectUrl)
      .filter(Boolean)
      .map((u) => normalizeUrl(String(u))),
  );
  const usedTitles = new Set(existing.map((p) => p.title.toLowerCase().trim()));

  const candidates = stories.filter((story) => {
    const url = normalizeUrl(story.url);
    if (usedUrls.has(url)) return false;
    if (usedTitles.has(story.title.toLowerCase().trim())) return false;
    if (!story.summary || story.summary.length < 40) return false;
    if (looksLikeRawFeedCopy(story.summary) && story.summary.length < 120) return false;
    return true;
  });

  if (!candidates.length) {
    return {
      ...result,
      ok: true,
      skipped: true,
      reason: "No fresh AI stories left after dedupe",
    };
  }

  const owner =
    (await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    })) || null;

  let indexOffset = alreadyToday;
  // Try extra candidates if some fail quality checks
  for (const story of candidates.slice(0, Math.max(remaining * 3, remaining))) {
    if (result.published.length >= remaining) break;

    try {
      const draft = sanitizeNewsDraft(await generateBilingualNewsDraft(story));

      if (
        !draft.excerpt ||
        draft.excerpt.length < 40 ||
        looksLikeRawFeedCopy(draft.excerpt) ||
        looksLikeRawFeedCopy(draft.excerptNl) ||
        looksLikeRawFeedCopy(draft.description) ||
        looksLikeRawFeedCopy(draft.descriptionNl)
      ) {
        result.errors.push(`${story.url}: skipped (unclean copy)`);
        continue;
      }

      let id = slugifyAutoNewsId(draft.title, clock.isoDate, indexOffset);
      if (await prisma.newsPost.findUnique({ where: { id } })) {
        id = `${slugifyNewsId(draft.title)}-${Date.now().toString(36)}`.slice(0, 80);
      }

      // Always write a local cover from title/industry (Pollinations → fallback SVG)
      const coverImage = await ensureNewsCoverImage(
        {
          id,
          title: draft.title,
          industry: draft.industry,
          tags: draft.tags,
          excerpt: draft.excerpt,
        },
        { force: true, download: true, retries: 5, delayMs: 1500 },
      );

      if (!coverImage) {
        result.errors.push(`${story.url}: skipped (no cover)`);
        continue;
      }

      const created = await createNewsPost({
        id,
        title: draft.title,
        titleNl: draft.titleNl,
        excerpt: draft.excerpt,
        excerptNl: draft.excerptNl,
        description: draft.description,
        descriptionNl: draft.descriptionNl,
        translations: draft.translations,
        autoTranslate: false,
        date: clock.isoDate,
        coverImage,
        author: AUTO_NEWS_AUTHOR,
        projectUrl: story.url,
        industry: draft.industry,
        // Public tags only (source brand + topics). No internal "auto-news" / feed ids.
        tags: Array.from(new Set(draft.tags)),
        published: true,
        createdById: owner?.id || null,
      });

      // Fill remaining locales with a time budget. The translate-content cron
      // resumes any language that did not finish before the next request.
      try {
        await completeNewsTranslations(created.id, {
          deadlineMs: 90_000,
        });
      } catch (i18nError) {
        const message =
          i18nError instanceof Error ? i18nError.message : String(i18nError);
        console.warn("[auto-news] multi-locale fill failed", created.id, message);
        result.errors.push(`${created.id}: multi-locale fill: ${message}`);
      }

      usedUrls.add(normalizeUrl(story.url));
      usedTitles.add(created.title.toLowerCase().trim());
      result.published.push({
        id: created.id,
        title: created.title,
        titleNl: created.titleNl || draft.titleNl,
        url: story.url,
      });
      indexOffset += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[auto-news] post failed", story.url, message);
      result.errors.push(`${story.url}: ${message}`);
    }
  }

  if (!result.published.length) {
    result.ok = false;
    result.reason = result.reason || "Failed to publish any posts";
  }

  return result;
}
