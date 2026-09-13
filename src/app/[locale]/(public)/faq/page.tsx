import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { FaqCategories } from "@/components/content/FaqAccordion";
import { getFaqContent } from "@/content/faq";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = buildStaticPageMetadata(locale, "/faq");
  if (locale === "nl" || locale === "en") return base;
  const content = getFaqContent(locale);
  return {
    ...base,
    title: `${content.title} — TripleZero iT`,
    description: content.subtitle,
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getFaqContent(locale);
  const t = await getTranslations({ locale, namespace: "faqPage" });
  const total = content.categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {content.subtitle}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {content.categories.length} {t("categoriesLabel")} · {total}{" "}
          {t("questionsLabel")}
        </p>
      </header>

      <FaqCategories categories={content.categories} />

      <aside className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {content.ctaTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{content.ctaText}</p>
        </div>
        <Button asChild className="shrink-0 rounded-xl">
          <SoftLink href={`/${locale}/contact`}>{content.ctaButton}</SoftLink>
        </Button>
      </aside>
    </div>
  );
}
