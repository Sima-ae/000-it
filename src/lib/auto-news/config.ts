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

export const AUTO_NEWS_COVERS = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80",
] as const;

export const AUTO_NEWS_PER_RUN = 6;
export const AUTO_NEWS_AUTHOR = "TripleZero iT";
export const AUTO_NEWS_TIMEZONE = "Europe/Amsterdam";
