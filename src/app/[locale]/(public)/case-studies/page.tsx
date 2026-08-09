import { setRequestLocale } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Badge } from "@/components/ui/badge";

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
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-semibold">
        {locale === "nl" ? "Case Studies" : "Case Studies"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {locale === "nl"
          ? "Resultaten van klanten die met TripleZero groeien."
          : "Results from clients growing with TripleZero."}
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cases.map((item) => (
          <GlassCard key={item.title}>
            <Badge variant="secondary">{item.industry}</Badge>
            <h2 className="mt-3 text-xl font-medium">{item.title}</h2>
            <p className="mt-2 text-accent">{item.metric}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
