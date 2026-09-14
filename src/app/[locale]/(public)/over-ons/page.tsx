import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { buildStaticPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/over-ons");
}

const pillars = [
  {
    titleKey: "pillarBugsTitle",
    descKey: "pillarBugsDesc",
    href: "/diensten/wordpress-error-fix",
  },
  {
    titleKey: "pillarMalwareTitle",
    descKey: "pillarMalwareDesc",
    href: "/diensten/wordpress-malware-removal",
  },
  {
    titleKey: "pillarSpeedTitle",
    descKey: "pillarSpeedDesc",
    href: "/diensten/wordpress-speed-optimization",
  },
  {
    titleKey: "pillarBackupTitle",
    descKey: "pillarBackupDesc",
    href: "/diensten/wordpress-backup-hosting-migration",
  },
  {
    titleKey: "pillarDesignTitle",
    descKey: "pillarDesignDesc",
    href: "/diensten/webdesign-support",
  },
  {
    titleKey: "pillarDigitalTitle",
    descKey: "pillarDigitalDesc",
    href: "/digital-design",
  },
  {
    titleKey: "pillarHostingTitle",
    descKey: "pillarHostingDesc",
    href: "/diensten/web-hosting",
  },
] as const;

const stats = [
  { value: "1-4 uur", labelKey: "statResponse" as const },
  { value: "7 dagen", labelKey: "statAvailable" as const },
  { value: "24 uur", labelKey: "statMonitoring" as const },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <section className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("heroSubtitle")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button asChild size="sm" className="rounded-xl">
              <SoftLink href={localizedHref(locale, "/diensten")}>
                {t("viewServices")}
              </SoftLink>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <SoftLink href={localizedHref(locale, "/afspraak")}>
                {tNav("book")}
              </SoftLink>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.value}
                className="glass glow-hover rounded-2xl px-3 py-4 text-center"
              >
                <p className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

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

      <section className="mt-12">
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {t("whatWeDo")}
              </h2>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {t("whatWeDoSubtitle")}
              </p>
            </div>
            <SoftLink
              href={localizedHref(locale, "/diensten")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("allServicesArrow")}
            </SoftLink>
          </div>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item, i) => (
            <Reveal key={item.href} delay={Math.min(i, 5) * 0.04}>
              <SoftLink href={localizedHref(locale, item.href)} className="block h-full">
                <GlassCard className="h-full p-5 transition hover:border-primary/25">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {t(item.titleKey)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(item.descKey)}
                  </p>
                </GlassCard>
              </SoftLink>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <GlassCard className="h-full p-6" interactive={false}>
            <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
              {t("storyTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("storyP1")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              {t("storyP2")}
            </p>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="relative flex h-full min-h-55 flex-col justify-between overflow-hidden rounded-3xl p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(91,60,139,0.55),transparent_45%),linear-gradient(145deg,#2a1845,#14181f_60%,#0f1720)]" />
            <div className="relative">
              <p className="font-display text-2xl font-semibold tracking-tight">
                {t("readyTitle")}
              </p>
              <p className="mt-2 max-w-sm text-sm text-white/70">
                {t("readySubtitle")}
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-2.5">
              <Button asChild size="sm" className="rounded-xl bg-white text-primary hover:bg-white/90">
                <SoftLink href={localizedHref(locale, "/afspraak")}>
                  {tNav("book")}
                </SoftLink>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <SoftLink href={localizedHref(locale, "/ai-scan")}>{tNav("aiScan")}</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
