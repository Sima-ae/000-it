import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/marketing/GlassCard";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bot, Sparkles, Zap } from "lucide-react";

const serviceKeys = ["ai", "seo", "web", "content", "ads", "software"] as const;

const agents = [
  { name: "SEOPilot", status: "running" },
  { name: "PixelForge", status: "idle" },
  { name: "SocialPulse", status: "paused" },
  { name: "AdsNinja", status: "running" },
  { name: "CodeNinja", status: "running" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const hero = await getTranslations("hero");
  const services = await getTranslations("services");
  const pricing = await getTranslations("pricing");
  const faq = await getTranslations("faq");

  return (
    <div>
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:px-6 md:pt-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-10 h-64 w-64 animate-pulse rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-10 top-32 h-56 w-56 animate-pulse rounded-full bg-secondary/20 blur-3xl [animation-delay:1s]" />
        </div>

        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          TripleZero iT
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          {hero("title")}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{hero("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}/ai-scan`}>{hero("ctaScan")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${locale}/diensten`}>{hero("ctaApproach")}</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <span className="mr-2 text-2xl font-semibold text-accent">
            <AnimatedCounter value={1284} />
          </span>
          {hero("scansLabel")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{services("title")}</h2>
            <p className="mt-2 text-muted-foreground">{services("subtitle")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceKeys.map((key) => (
            <GlassCard key={key}>
              <div className="mb-3 inline-flex rounded-lg bg-primary/15 p-2 text-primary">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-medium">{services(`items.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {services(`items.${key}.desc`)}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="mb-6 text-2xl font-semibold md:text-3xl">AI Agents</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur"
            >
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{agent.name}</span>
              </div>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                {agent.status}
              </p>
              <div
                className={`mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted ${
                  agent.status === "running" ? "animate-pulse" : ""
                }`}
              >
                <div
                  className={`h-full rounded-full ${
                    agent.status === "running"
                      ? "w-2/3 bg-accent"
                      : agent.status === "paused"
                        ? "w-1/3 bg-amber-400"
                        : "w-1/4 bg-primary"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="text-2xl font-semibold md:text-3xl">{pricing("title")}</h2>
        <p className="mt-2 text-muted-foreground">{pricing("subtitle")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { name: pricing("starter"), price: "€499", features: ["AI-Scan", "SEO basics", "1 agent"] },
            { name: pricing("growth"), price: "€999", features: ["Full stack", "5 agents", "Content + Ads"] },
            { name: pricing("enterprise"), price: pricing("custom"), features: ["Custom agents", "SLA", "API access"] },
          ].map((plan) => (
            <GlassCard key={plan.name} className="flex flex-col">
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-3 text-3xl font-semibold">
                {plan.price}
                {plan.price.startsWith("€") && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {pricing("month")}
                  </span>
                )}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href={`/${locale}/register`}>{pricing("cta")}</Link>
              </Button>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h2 className="mb-4 text-2xl font-semibold">{faq("title")}</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="1">
            <AccordionTrigger>{faq("q1")}</AccordionTrigger>
            <AccordionContent>{faq("a1")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>{faq("q2")}</AccordionTrigger>
            <AccordionContent>{faq("a2")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>{faq("q3")}</AccordionTrigger>
            <AccordionContent>{faq("a3")}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-card to-secondary/20 p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold md:text-3xl">{t("hero.ctaScan")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("hero.subtitle")}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href={`/${locale}/ai-scan`}>{t("hero.ctaScan")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
