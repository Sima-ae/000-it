/**
 * Display / search priority for public TLD chips and result lists.
 * Lower index = higher priority. Unknown TLDs sort after these, A–Z.
 */
const TLD_POPULARITY: string[] = [
  "ai",
  "com",
  "eu",
  "nl",
  "be",
  "de",
  "fr",
  "it",
  "asia",
  "ae",
  "es",
  "co.uk",
  "uk",
  "us",
  "cloud",
  "online",
  "app",
  "biz",
  "club",
  "dev",
  "net",
  "site",
  "shop",
  "store",
  "io",
  "pro",
  "tech",
  "info",
  "org",
  "co",
  "cc",
  "me",
  "tv",
  "xyz",
  "name",
  "mobi",
  "top",
  "icu",
  "vip",
  "fun",
  "live",
  "world",
  "digital",
  "email",
  "agency",
  "studio",
  "design",
  "marketing",
  "ws",
];

const rank = new Map(TLD_POPULARITY.map((tld, i) => [tld, i]));

export function tldPopularityRank(tld: string): number {
  const key = tld.toLowerCase().replace(/^\./, "");
  return rank.get(key) ?? 1000 + key.charCodeAt(0);
}

export function compareTldsByPopularity(a: string, b: string): number {
  const ra = tldPopularityRank(a);
  const rb = tldPopularityRank(b);
  if (ra !== rb) return ra - rb;
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export function sortByTldPopularity<T extends { tld: string }>(items: T[]): T[] {
  return [...items].sort((x, y) => compareTldsByPopularity(x.tld, y.tld));
}
