export type SiteSearchKind =
  | "page"
  | "service"
  | "kennisbank"
  | "news"
  | "faq";

export type SiteSearchHit = {
  kind: SiteSearchKind;
  id: string;
  title: string;
  excerpt: string;
  href: string;
  meta?: string;
  score: number;
};

export type SiteSearchResult = {
  query: string;
  pages: SiteSearchHit[];
  services: SiteSearchHit[];
  kennisbank: SiteSearchHit[];
  news: SiteSearchHit[];
  faq: SiteSearchHit[];
};

export function siteSearchHasResults(result: SiteSearchResult) {
  return (
    result.pages.length +
      result.services.length +
      result.kennisbank.length +
      result.news.length +
      result.faq.length >
    0
  );
}
