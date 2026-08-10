/** RSS / Atom sources for factual AI industry news */
export const AUTO_NEWS_FEEDS = [
  {
    id: "openai",
    name: "OpenAI",
    url: "https://openai.com/blog/rss.xml",
  },
  {
    id: "google-ai",
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
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
    id: "arxiv-ai",
    name: "arXiv cs.AI",
    url: "https://rss.arxiv.org/rss/cs.AI",
  },
] as const;

/** 3 posts/day × 7 days = 21 posts/week */
export const AUTO_NEWS_PER_RUN = 3;
export const AUTO_NEWS_AUTHOR = "TripleZero iT";
export const AUTO_NEWS_TIMEZONE = "Europe/Amsterdam";
