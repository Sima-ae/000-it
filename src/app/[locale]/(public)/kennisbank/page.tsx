import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { KennisbankCategoryGrid } from "@/components/kennisbank/KennisbankCategoryGrid";
import { listArticles, listCategories } from "@/lib/kennisbank";
import { buildStaticPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/kennisbank");
}

export default async function KennisbankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isNl = locale === "nl";
  let categories: Awaited<ReturnType<typeof listCategories>> = [];
  let total = 0;
  try {
    categories = await listCategories({ locale });
    const articles = await listArticles({ locale });
    total = articles.length;
  } catch (error) {
    console.error("[kennisbank] unavailable during render", error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          TripleZero iT Hosting
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          {isNl ? "Kennisbank" : "Knowledge base"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {isNl
            ? "Professionele handleidingen over domeinnamen, hosting, e-mail, control panels, WordPress en beveiliging."
            : "Professional guides on domains, hosting, email, control panels, WordPress and security."}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {categories.length} {isNl ? "categorieën" : "categories"} · {total}{" "}
          {isNl ? "artikelen" : "articles"}
        </p>
      </header>

      <KennisbankCategoryGrid
        categories={categories}
        locale={locale}
        articlesLabel={isNl ? "artikelen" : "articles"}
        searchPlaceholder={
          isNl ? "Zoeken in de kennisbank…" : "Search the knowledge base…"
        }
      />

      <aside className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {isNl ? "Niet gevonden wat je zoekt?" : "Cannot find what you need?"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isNl
              ? "Neem contact op met TripleZero iT Hosting support — we helpen je graag verder."
              : "Contact TripleZero iT Hosting support — we are happy to help."}
          </p>
        </div>
        <Button asChild className="shrink-0 rounded-xl">
          <SoftLink href={`/${locale}/contact`}>
            {isNl ? "Contact" : "Contact"}
          </SoftLink>
        </Button>
      </aside>
    </div>
  );
}
