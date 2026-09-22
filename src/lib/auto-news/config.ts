/** RSS / Atom sources for factual AI industry news (public blogs only). */
export const AUTO_NEWS_FEEDS = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
  },
  {
    id: "google-ai",
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
  },
  {
    id: "deepmind",
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/feed/basic/",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    // Official Anthropic site has no RSS; community mirror updated via GitHub Actions.
    url: "https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml",
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    id: "theverge-ai",
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
  {
    id: "marktechpost",
    name: "MarkTechPost",
    url: "https://www.marktechpost.com/feed/",
  },
  {
    id: "ai-news",
    name: "AI News",
    url: "https://www.artificialintelligence-news.com/feed/",
  },
  {
    id: "mit-tr-ai",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
  },
  {
    id: "nvidia",
    name: "NVIDIA Technical Blog",
    url: "https://developer.nvidia.com/blog/feed",
  },
  {
    id: "huggingface",
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
  },
  {
    id: "azure",
    name: "Azure Blog",
    url: "https://azure.microsoft.com/en-us/blog/feed/",
  },
  {
    id: "lastweekinai",
    name: "Last Week in AI",
    url: "https://lastweekin.ai/feed",
  },
  {
    id: "wired-ai",
    name: "Wired AI",
    url: "https://www.wired.com/feed/tag/ai/latest/rss",
  },
  // arXiv intentionally excluded from daily auto posts — raw paper RSS causes
  // metadata junk ("Announce Type" / "Aankondiging Type") and overly academic copy.
] as const;

/** 3 posts/day × 7 days = 21 posts/week */
export const AUTO_NEWS_PER_RUN = 3;
export const AUTO_NEWS_AUTHOR = "TripleZero iT";
export const AUTO_NEWS_TIMEZONE = "Europe/Amsterdam";

/** Soft cap so high-volume feeds (e.g. TechCrunch) do not dominate a run. */
export const AUTO_NEWS_MAX_PER_SOURCE_PER_RUN = 1;
