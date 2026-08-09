import { setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";

const posts = [
  {
    title: "What is AEO in 2026?",
    excerpt: "How brands win visibility inside AI answer engines.",
    date: "2026-07-12",
  },
  {
    title: "GEO: Generative Engine Optimization",
    excerpt: "Practical tactics to show up in ChatGPT and Gemini answers.",
    date: "2026-06-28",
  },
  {
    title: "Building an AI agent stack",
    excerpt: "From SEOPilot to AdsNinja — orchestration patterns that work.",
    date: "2026-05-03",
  },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-semibold">Blog</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <GlassCard key={post.title}>
            <p className="text-xs text-muted-foreground">{post.date}</p>
            <h2 className="mt-2 text-lg font-medium">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
