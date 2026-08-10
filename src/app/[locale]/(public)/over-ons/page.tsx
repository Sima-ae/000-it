import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    title: { nl: "WordPress Bugs / Error Fix", en: "WordPress Bugs / Error Fix" },
    desc: {
      nl: "Snelle diagnose en oplossing van fouten zodat je site weer soepel draait.",
      en: "Quick diagnosis and fixes so your site runs smoothly again.",
    },
    href: "/diensten/wordpress-error-fix",
  },
  {
    title: { nl: "Malware & Security", en: "Malware & Security" },
    desc: {
      nl: "Diepe analyse, malware verwijderen en structurele beveiliging.",
      en: "Deep analysis, malware removal and lasting security hardening.",
    },
    href: "/diensten/wordpress-malware-removal",
  },
  {
    title: { nl: "Performance & Speed", en: "Performance & Speed" },
    desc: {
      nl: "Laadtijden onder 2 seconden en Core Web Vitals op orde.",
      en: "Load times under 2 seconds and Core Web Vitals optimized.",
    },
    href: "/diensten/wordpress-speed-optimization",
  },
  {
    title: { nl: "Backup & Migratie", en: "Backup & Migration" },
    desc: {
      nl: "Veilige backups en hosting-migraties zonder downtime.",
      en: "Safe backups and hosting migrations without downtime.",
    },
    href: "/diensten/wordpress-backup-hosting-migration",
  },
  {
    title: { nl: "Design & Customize", en: "Design & Customize" },
    desc: {
      nl: "Unieke, responsive designs die aansluiten op jouw merk.",
      en: "Unique, responsive design tailored to your brand.",
    },
    href: "/diensten/webdesign-support",
  },
  {
    title: { nl: "Digital Design", en: "Digital Design" },
    desc: {
      nl: "Logo’s, visitekaartjes, flyers, posters en print in Adobe.",
      en: "Logos, business cards, flyers, posters and print in Adobe.",
    },
    href: "/digital-design",
  },
  {
    title: { nl: "Web Hosting", en: "Web Hosting" },
    desc: {
      nl: "Snelle, betrouwbare hosting vanaf € 21,96 per jaar.",
      en: "Fast, reliable hosting starting from € 21.96 per year.",
    },
    href: "/diensten/web-hosting",
  },
] as const;

const stats = [
  { value: "12u", label: { nl: "gemiddelde response", en: "average response" } },
  { value: "<2s", label: { nl: "laadtijd-doel", en: "load-time target" } },
  { value: "24/7", label: { nl: "monitoring & support", en: "monitoring & support" } },
] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      {/* Hero */}
      <section className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {isNl
              ? "AI-gedreven groei, WordPress support, hosting, SEO en marketing — één systeem voor Nederlandse bedrijven."
              : "AI-driven growth, WordPress support, hosting, SEO and marketing — one system for ambitious businesses."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild size="sm" className="rounded-xl">
              <SoftLink href={`/${locale}/diensten`}>
                {isNl ? "Bekijk diensten" : "View services"}
              </SoftLink>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <SoftLink href={`/${locale}/afspraak`}>
                {isNl ? "Afspraak boeken" : "Book appointment"}
              </SoftLink>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="glass rounded-2xl px-3 py-4 text-center"
              >
                <p className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {isNl ? stat.label.nl : stat.label.en}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Mission / Vision / Philosophy */}
      <section className="mt-10 grid gap-3 md:grid-cols-3">
        {(
          [
            ["mission", "missionText"],
            ["vision", "visionText"],
            ["philosophy", "philosophyText"],
          ] as const
        ).map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.05}>
            <GlassCard className="h-full p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                0{i + 1}
              </p>
              <h2 className="font-display mt-2 text-lg font-semibold tracking-tight">
                {t(title)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(body)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      {/* What we do */}
      <section className="mt-12">
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {isNl ? "Wat wij doen" : "What we do"}
              </h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {isNl
                  ? "Praktische diensten om je website snel, veilig en vindbaar te maken."
                  : "Practical services to make your website fast, secure and findable."}
              </p>
            </div>
            <SoftLink
              href={`/${locale}/diensten`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {isNl ? "Alle diensten →" : "All services →"}
            </SoftLink>
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item, i) => (
            <Reveal key={item.href} delay={Math.min(i, 5) * 0.04}>
              <SoftLink href={`/${locale}${item.href}`} className="block h-full">
                <GlassCard className="h-full p-5 transition hover:border-primary/25">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {isNl ? item.title.nl : item.title.en}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {isNl ? item.desc.nl : item.desc.en}
                  </p>
                </GlassCard>
              </SoftLink>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Compact story + CTA */}
      <section className="mt-12 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <GlassCard className="h-full p-6" interactive={false}>
            <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
              {isNl ? "Van goed naar beter" : "From good to great"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {isNl
                ? "Met AI-integratie, SEO/AEO/GEO, performance, security en full-funnel marketing zorgen we dat je website soepel draait, beschermd blijft en meetbaar groeit."
                : "With AI integration, SEO/AEO/GEO, performance, security and full-funnel marketing we keep your website smooth, protected and measurably growing."}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {isNl
                ? "Binnen 24 uur pakken we bugs, malware, migraties of optimalisaties op — zodat jij je kunt focussen op je business."
                : "Within 24 hours we handle bugs, malware, migrations or optimizations — so you can focus on your business."}
            </p>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="relative flex h-full min-h-55 flex-col justify-between overflow-hidden rounded-3xl p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(91,60,139,0.55),transparent_45%),linear-gradient(145deg,#2a1845,#14181f_60%,#0f1720)]" />
            <div className="relative">
              <p className="font-display text-2xl font-semibold tracking-tight">
                {isNl ? "Klaar om te starten?" : "Ready to start?"}
              </p>
              <p className="mt-2 max-w-sm text-sm text-white/70">
                {isNl
                  ? "Plan een gesprek of start direct met een AI-Scan van je website."
                  : "Book a call or start with an AI Scan of your website."}
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-2.5">
              <Button asChild size="sm" className="rounded-xl bg-white text-primary hover:bg-white/90">
                <SoftLink href={`/${locale}/afspraak`}>
                  {isNl ? "Afspraak" : "Book"}
                </SoftLink>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <SoftLink href={`/${locale}/ai-scan`}>AI-Scan</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
