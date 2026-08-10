import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { FaqCategories } from "@/components/content/FaqAccordion";
import { getFaqContent } from "@/content/faq";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = getFaqContent(locale);
  const total = content.categories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">FAQ</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">{content.subtitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {content.categories.length} {locale === "nl" ? "categorieën" : "categories"} · {total}{" "}
          {locale === "nl" ? "vragen" : "questions"}
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-10">
          <FaqCategories categories={content.categories} />
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-12 overflow-hidden rounded-4xl border border-border bg-linear-to-br from-primary/10 via-background to-accent/10 p-8 md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {content.ctaTitle}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{content.ctaText}</p>
          <Button asChild className="mt-6" size="lg">
            <SoftLink href={`/${locale}/contact`}>{content.ctaButton}</SoftLink>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
