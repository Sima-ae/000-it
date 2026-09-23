import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  BookOpen,
  CreditCard,
  FileText,
  ImageIcon,
  Layers,
  Palette,
  PenTool,
  Stamp,
  Type,
} from "lucide-react";
import { localizedHref } from "@/i18n/pathnames";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { ShopProductImage } from "@/components/shop/ShopProductImage";
import {
  getServiceGroup,
  serviceCatalog,
  serviceGroupHref,
  serviceHref,
} from "@/content/fixweb/catalog";
import { catalogGroupTitle, catalogServiceTitle } from "@/content/fixweb/catalog-title";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/grafisch-design");
}

const HERO_IMAGE = "/uploads/fixweb/grafisch-design.png";

const tools = [
  { name: "Adobe Photoshop", icon: ImageIcon },
  { name: "Adobe Illustrator", icon: PenTool },
  { name: "Adobe InDesign", icon: BookOpen },
] as const;

const offerings = [
  { slug: "logo-brand-identity", icon: Palette, blurbKey: "blurbLogo" as const },
  { slug: "business-cards", icon: CreditCard, blurbKey: "blurbCards" as const },
  { slug: "briefpapier", icon: FileText, blurbKey: "blurbLetterhead" as const },
  { slug: "flyers-posters", icon: Type, blurbKey: "blurbFlyers" as const },
  { slug: "stickers-packaging", icon: Stamp, blurbKey: "blurbStickers" as const },
  { slug: "magazines-brochures", icon: Layers, blurbKey: "blurbBrochures" as const },
] as const;

export default async function GraphicDesignPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("digitalDesign");
  const designGroup = getServiceGroup("design");
  const designLabel = designGroup
    ? catalogGroupTitle(designGroup.id, locale, designGroup.title)
    : "Design";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 45% at 95% 70%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <Reveal>
            <p className="text-sm text-muted-foreground">
              <SoftLink href={localizedHref(locale, "/diensten")} className="hover:text-foreground">
                {tNav("services")}
              </SoftLink>
              <span className="mx-2">/</span>
              <SoftLink
                href={serviceGroupHref(locale, "design")}
                className="hover:text-foreground"
              >
                {designLabel}
              </SoftLink>
              <span className="mx-2">/</span>
              <span>{t("title")}</span>
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <SoftLink
                  href={serviceGroupHref(locale, "design")}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:underline"
                >
                  {designLabel}
                </SoftLink>
                <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {t("title")}
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
                  {t("subtitle")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-2xl">
                    <SoftLink href={localizedHref(locale, "/afspraak")}>
                      {tNav("book")}
                    </SoftLink>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-2xl">
                    <SoftLink href={localizedHref(locale, "/portfolio")}>
                      {t("viewPortfolio")}
                    </SoftLink>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-[1.75rem] border border-border/70 shadow-sm">
                <ShopProductImage
                  src={HERO_IMAGE}
                  alt={t("title")}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("whatWeDesign")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("whatWeDesignSubtitle")}</p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((item, i) => {
            const meta = serviceCatalog.find((s) => s.slug === item.slug);
            if (!meta) return null;
            const Icon = item.icon;
            return (
              <Reveal key={item.slug} delay={i * 0.04}>
                <SoftLink
                  href={serviceHref(locale, meta)}
                  className="group flex h-full flex-col rounded-3xl border border-border/70 bg-background/50 p-5 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                    {catalogServiceTitle(meta.slug, locale, meta.title)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{t(item.blurbKey)}</p>
                  <span className="mt-4 text-sm font-medium text-primary group-hover:underline">
                    {t("learnMore")}
                  </span>
                </SoftLink>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {t("toolsTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("toolsSubtitle")}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Reveal key={tool.name} delay={i * 0.05}>
                  <div className="rounded-3xl border border-border/70 bg-background/70 px-5 py-6">
                    <Icon className="h-6 w-6 text-primary" />
                    <p className="mt-3 font-medium">{tool.name}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <Reveal>
          <div className="rounded-4xl border border-border/70 bg-linear-to-br from-primary/12 via-background to-accent/10 px-6 py-10 md:px-10 md:py-12">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("ctaSubtitle")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl">
                <SoftLink href={localizedHref(locale, "/afspraak")}>{t("startDesign")}</SoftLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl">
                <SoftLink href={localizedHref(locale, "/diensten/webdesign-support")}>
                  {t("websiteSupport")}
                </SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
