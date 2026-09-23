/** Official TripleZero iT Facebook Page (New Page Experience profile id). */
export const FACEBOOK_PAGE_HREF = "https://www.facebook.com/TripleZero.iT";
export const FACEBOOK_PAGE_ID = "100081017330204";
export const FACEBOOK_PAGE_PLUGIN_HREF = `https://www.facebook.com/profile.php?id=${FACEBOOK_PAGE_ID}`;
export const FACEBOOK_PAGE_AVATAR = `https://graph.facebook.com/${FACEBOOK_PAGE_ID}/picture?type=large`;

export type FacebookPageStats = {
  followers: number | null;
  name: string | null;
  href: string;
  /** Page profile / OG image (used as avatar). */
  image: string | null;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/gi, "/");
}

function metaContent(html: string, property: string) {
  const re1 = new RegExp(
    `property="${property}"\\s+content="([^"]+)"`,
    "i",
  );
  const re2 = new RegExp(
    `content="([^"]+)"\\s+property="${property}"`,
    "i",
  );
  const raw = html.match(re1)?.[1] || html.match(re2)?.[1] || null;
  return raw ? decodeHtml(raw) : null;
}

function parseFollowerCount(text: string): number | null {
  const abbreviated = text.match(
    /([\d]+(?:[.,]\d+)?)\s*d\.?\s*(volgers|followers)/i,
  );
  if (abbreviated) {
    const n = Number.parseFloat(abbreviated[1].replace(",", "."));
    if (Number.isFinite(n)) return Math.round(n * 1000);
  }

  const full = text.match(/([\d.,\u00a0\s]+)\s*(volgers|followers)/i);
  if (full) {
    const digits = full[1].replace(/[^\d]/g, "");
    if (digits) return Number.parseInt(digits, 10);
  }

  return null;
}

/** Read public page stats from Facebook OG tags (no app token needed). */
export async function fetchFacebookPageStats(): Promise<FacebookPageStats> {
  const href = FACEBOOK_PAGE_HREF;
  try {
    const res = await fetch(href, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1",
        Accept: "text/html",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return { followers: null, name: null, href, image: FACEBOOK_PAGE_AVATAR };
    }
    const html = await res.text();
    const description = metaContent(html, "og:description") || "";
    const name = metaContent(html, "og:title");
    const image = metaContent(html, "og:image") || FACEBOOK_PAGE_AVATAR;

    return {
      followers: parseFollowerCount(description),
      name,
      href,
      image,
    };
  } catch {
    return { followers: null, name: null, href, image: FACEBOOK_PAGE_AVATAR };
  }
}

export function formatFollowerCount(count: number, locale: string) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : locale || "en-US").format(
    count,
  );
}
