import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  return buildStaticPageMetadata(locale, "/faq");
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getFaqContent(locale);
  const total = content.categories.reduce((sum, c) => sum + c.items.length, 0);
  const isNl = locale === "nl";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {isNl ? "Veelgestelde vragen" : "FAQ"}
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{content.subtitle}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {content.categories.length} {isNl ? "categorieën" : "categories"} · {total}{" "}
          {isNl ? "vragen" : "questions"}
        </p>
      </header>

      <FaqCategories categories={content.categories} />

      <aside className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">{content.ctaTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{content.ctaText}</p>
        </div>
        <Button asChild className="shrink-0 rounded-xl">
          <SoftLink href={`/${locale}/contact`}>{content.ctaButton}</SoftLink>
        </Button>
      </aside>
    </div>
  );
}
