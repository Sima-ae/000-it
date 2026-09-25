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
    .replace(/&nbsp;/gi, " ")
    .replace(/&#xa0;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
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

/** NL/EN + common FB locales (VPS often gets RU without Accept-Language). */
const FOLLOWER_WORD =
  "volgers|followers|follower|likes|abonn[eé]s|seguidores|followerinnen|подписчик(?:а|ов)?|підписник(?:и|ів)?";

function parseFollowerCount(text: string): number | null {
  const normalized = decodeHtml(text).replace(/\u00a0/g, " ");

  const abbreviated = normalized.match(
    new RegExp(`([\\d]+(?:[.,]\\d+)?)\\s*[kк]\\s*(?:${FOLLOWER_WORD})`, "i"),
  );
  if (abbreviated) {
    const n = Number.parseFloat(abbreviated[1].replace(",", "."));
    if (Number.isFinite(n)) return Math.round(n * 1000);
  }

  // Dutch often uses a thousands-dot: "8.804 volgers"
  const dutchThousands = normalized.match(
    new RegExp(`(\\d{1,3}(?:\\.\\d{3})+)\\s*(?:${FOLLOWER_WORD})`, "i"),
  );
  if (dutchThousands) {
    const digits = dutchThousands[1].replace(/\./g, "");
    if (digits) return Number.parseInt(digits, 10);
  }

  const full = normalized.match(
    new RegExp(`([\\d.,\\s]+)\\s*(?:${FOLLOWER_WORD})`, "i"),
  );
  if (full) {
    const digits = full[1].replace(/[^\d]/g, "");
    if (digits) return Number.parseInt(digits, 10);
  }

  return null;
}

function envFollowerFallback(): number | null {
  const raw = (process.env.FACEBOOK_FOLLOWERS_COUNT || "").trim();
  if (!raw) return null;
  const n = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Read public page stats from Facebook OG tags (no app token needed). */
export async function fetchFacebookPageStats(): Promise<FacebookPageStats> {
  const href = FACEBOOK_PAGE_HREF;
  const fallbackFollowers = envFollowerFallback();
  try {
    const res = await fetch(href, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1",
        Accept: "text/html",
        // Without this, FB often returns a non-NL/EN description (e.g. Russian
        // "подписчика") that we used to fail to parse — hiding the count in UI.
        "Accept-Language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        followers: fallbackFollowers,
        name: null,
        href,
        image: FACEBOOK_PAGE_AVATAR,
      };
    }
    const html = await res.text();
    const description = metaContent(html, "og:description") || "";
    const name = metaContent(html, "og:title");
    const image = metaContent(html, "og:image") || FACEBOOK_PAGE_AVATAR;
    const scraped = parseFollowerCount(description);

    return {
      // FB often checkpoint/blocks datacenter IPs — keep showing last known count.
      followers: scraped ?? fallbackFollowers,
      name,
      href,
      image,
    };
  } catch {
    return {
      followers: fallbackFollowers,
      name: null,
      href,
      image: FACEBOOK_PAGE_AVATAR,
    };
  }
}

export function formatFollowerCount(count: number, locale: string) {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : locale || "en-US").format(
    count,
  );
}
