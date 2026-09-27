/**
 * Display / search priority for public TLD chips and result lists.
 * Lower index = higher priority. Unknown TLDs sort after these, A–Z.
 */
const TLD_POPULARITY: string[] = [
  "com",
  "nl",
  "be",
  "eu",
  "net",
  "org",
  "io",
  "app",
  "dev",
  "online",
  "shop",
  "store",
  "info",
  "biz",
  "co",
  "me",
  "ai",
  "xyz",
  "site",
  "tech",
  "cloud",
  "pro",
  "co.uk",
  "de",
  "fr",
  "es",
  "it",
  "us",
  "uk",
  "tv",
  "cc",
  "ws",
  "name",
  "mobi",
  "asia",
  "club",
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
