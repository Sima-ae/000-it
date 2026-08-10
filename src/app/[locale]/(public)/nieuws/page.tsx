import { getTranslations, setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";

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

export default async function NieuwsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("blog")}
        </h1>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.title} delay={i * 0.07}>
            <GlassCard className="h-full">
              <p className="text-xs text-muted-foreground">{post.date}</p>
              <h2 className="font-display mt-2 text-lg font-semibold tracking-tight">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
