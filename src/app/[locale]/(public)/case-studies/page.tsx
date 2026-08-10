import { setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/Reveal";

const cases = [
  {
    title: "Nova Retail",
    industry: "E-commerce",
    metric: "+148% organic traffic",
    summary: "SEO + AEO program with AI content agents.",
  },
  {
    title: "BlueHarbor Logistics",
    industry: "Logistics",
    metric: "-32% CAC",
    summary: "AI ads optimization across Google and Meta.",
  },
  {
    title: "Studio Meridian",
    industry: "Services",
    metric: "3.1x lead quality",
    summary: "Full-growth stack with chatbot and conversion redesign.",
  },
];

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Case Studies
        </h1>
        <p className="mt-3 text-muted-foreground md:text-lg">
          {locale === "nl"
            ? "Resultaten van klanten die met AI groeien."
            : "Results from clients growing with TripleZero."}
        </p>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cases.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.07}>
            <GlassCard className="h-full">
              <Badge variant="secondary">{item.industry}</Badge>
              <h2 className="font-display mt-3 text-xl font-semibold tracking-tight">
                {item.title}
              </h2>
              <p className="mt-2 font-medium text-accent">{item.metric}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
