import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { BRANDING_IMAGES } from "@/lib/branding-images";
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
    titleKey: "pillarAiTitle",
    descKey: "pillarAiDesc",
    href: "/diensten/ai-integration",
  },
  {
    titleKey: "pillarOptTitle",
    descKey: "pillarOptDesc",
    href: "/diensten/seo-optimization",
  },
  {
    titleKey: "pillarWebTitle",
    descKey: "pillarWebDesc",
    href: "/diensten/custom-webdesign",
  },
  {
    titleKey: "pillarWpTitle",
    descKey: "pillarWpDesc",
    href: "/diensten/wordpress-error-fix",
  },
  {
    titleKey: "pillarHostTitle",
    descKey: "pillarHostDesc",
    href: "/diensten/web-hosting",
  },
  {
    titleKey: "pillarMarketTitle",
    descKey: "pillarMarketDesc",
    href: "/diensten/digital-marketing",
  },
  {
    titleKey: "pillarDesignTitle",
    descKey: "pillarDesignDesc",
    href: "/grafisch-design",
  },
] as const;

const approachSteps = [
  ["approach1Title", "approach1Desc"],
  ["approach2Title", "approach2Desc"],
  ["approach3Title", "approach3Desc"],
  ["approach4Title", "approach4Desc"],
] as const;

const whyItems = [
  ["why1Title", "why1Desc"],
  ["why2Title", "why2Desc"],
  ["why3Title", "why3Desc"],
] as const;

const stats = [
  { valueKey: "statResponseValue" as const, labelKey: "statResponse" as const },
  { valueKey: "statAvailableValue" as const, labelKey: "statAvailable" as const },
  { valueKey: "statMonitoringValue" as const, labelKey: "statMonitoring" as const },
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
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <section className="grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-1.5 text-3xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("heroSubtitle")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
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
          <div className="mt-5 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.valueKey}
                className="glass glow-hover rounded-2xl px-2.5 py-3.5 text-center"
              >
                <p className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
                  {t(stat.valueKey)}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-muted/40 shadow-sm">
            <Image
              src={BRANDING_IMAGES.duoSuccess}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              unoptimized
              className="object-cover object-center"
            />
          </div>
        </Reveal>
      </section>

      <section className="mt-8 grid gap-2.5 md:grid-cols-3">
        {(
          [
            ["mission", "missionText"],
            ["vision", "visionText"],
            ["philosophy", "philosophyText"],
          ] as const
        ).map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.04}>
            <GlassCard className="h-full p-4 md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                0{i + 1}
              </p>
              <h2 className="font-display mt-1.5 text-lg font-semibold tracking-tight">
                {t(title)}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(body)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </section>

      <section className="mt-9">
        <Reveal>
          <div className="grid items-stretch gap-3 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-56 overflow-hidden rounded-3xl bg-muted/40 lg:min-h-full">
              <Image
                src={BRANDING_IMAGES.consultantLaptop}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                unoptimized
                className="object-cover object-[center_20%]"
              />
            </div>
            <GlassCard className="p-5 md:p-6" interactive={false}>
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                {t("storyTitle")}
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-foreground md:text-base">
                {t("storyLead")}
              </p>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                <p>{t("storyP1")}</p>
                <p>{t("storyP2")}</p>
                <p>{t("storyP3")}</p>
              </div>
            </GlassCard>
          </div>
        </Reveal>
      </section>

      <section className="mt-9">
        <Reveal>
          <div className="mb-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {t("approachTitle")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("approachSubtitle")}
            </p>
          </div>
        </Reveal>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map(([titleKey, descKey], i) => (
            <Reveal key={titleKey} delay={i * 0.04}>
              <GlassCard className="h-full p-4" interactive={false}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-1.5 text-base font-semibold tracking-tight">
                  {t(titleKey)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-9">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2.5">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {t("whatWeDo")}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
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

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((item, i) => (
            <Reveal key={item.href} delay={Math.min(i, 5) * 0.03}>
              <SoftLink href={localizedHref(locale, item.href)} className="block h-full">
                <GlassCard className="h-full p-4 transition hover:border-primary/25 md:p-5">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {t(item.titleKey)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {t(item.descKey)}
                  </p>
                </GlassCard>
              </SoftLink>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-9 grid gap-2.5 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div className="grid h-full gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative min-h-44 overflow-hidden rounded-3xl bg-muted/40">
              <Image
                src={BRANDING_IMAGES.collaboration}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 30vw"
                unoptimized
                className="object-cover"
              />
            </div>
            <GlassCard className="h-full p-5" interactive={false}>
              <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                {t("serveTitle")}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                {t("serveText")}
              </p>
            </GlassCard>
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {whyItems.map(([titleKey, descKey], i) => (
              <GlassCard key={titleKey} className="h-full p-4" interactive={false}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  {t("whyEyebrow")} {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-1.5 text-base font-semibold tracking-tight">
                  {t(titleKey)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(descKey)}
                </p>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-8">
        <Reveal>
          <div className="relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl p-5 text-white md:p-6">
            <div className="absolute inset-0">
              <Image
                src={BRANDING_IMAGES.tabletMarketer}
                alt=""
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                unoptimized
                className="object-cover object-center opacity-45"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(94,59,136,0.55),transparent_45%),linear-gradient(145deg,rgba(42,24,69,0.88),rgba(20,24,31,0.92)_60%,rgba(15,23,32,0.94))]" />
            </div>
            <div className="relative max-w-xl">
              <p className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {t("readyTitle")}
              </p>
              <p className="mt-2 text-sm text-white/75 md:text-[15px]">
                {t("readySubtitle")}
              </p>
            </div>
            <div className="relative mt-5 flex flex-wrap gap-2.5">
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
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <SoftLink href={localizedHref(locale, "/contact")}>{tNav("contact")}</SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
