import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { NewsGrid } from "@/components/content/NewsGrid";
import { NewsPagination } from "@/components/content/NewsPagination";
import { NewsSearch } from "@/components/content/NewsSearch";
import { JsonLd } from "@/components/seo/JsonLd";
import { listNewsPostsPage, NEWS_PAGE_SIZE } from "@/lib/news";
import {
  breadcrumbJsonLd,
  buildNewsIndexMetadata,
  organizationJsonLd,
} from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
  return buildNewsIndexMetadata(locale, page);
}

export default async function NieuwsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam, q: qParam } = await searchParams;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("news");

  const query = (qParam || "").trim();
  const requestedPage = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
  const { items, page, totalPages } = await listNewsPostsPage({
    locale,
    page: requestedPage,
    pageSize: NEWS_PAGE_SIZE,
    q: query,
  });

  const paginationLabels = {
    previous: t("previous"),
    next: t("next"),
    // Keep {page}/{total} placeholders for NewsPagination string replace.
    pageOf: t.raw("pageOf") as string,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "TripleZero iT", path: localizedHref(locale, "/") },
          { name: tNav("blog"), path: localizedHref(locale, "/nieuws") },
        ])}
      />

      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand md:text-5xl">
          {tNav("blog")}
        </h1>
        <p className="mt-3 max-w-2xl text-brand-mint">{t("subtitle")}</p>
      </Reveal>

      <div className="mt-8">
        <NewsSearch initialQuery={query} placeholder={t("searchPlaceholder")} />
      </div>

      <div className="mt-6">
        <NewsPagination
          locale={locale}
          page={page}
          totalPages={totalPages}
          labels={paginationLabels}
          query={query}
        />
      </div>

      {items.length ? (
        <NewsGrid
          locale={locale}
          items={items}
          labels={{
            client: t("author"),
            date: t("date"),
            industry: t("category"),
            visit: t("openLink"),
            readMore: t("readArticle"),
          }}
        />
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-border/70 px-5 py-10 text-center text-sm text-muted-foreground">
          {t("searchEmpty")}
        </p>
      )}

      <div className="mt-10">
        <NewsPagination
          locale={locale}
          page={page}
          totalPages={totalPages}
          labels={paginationLabels}
          query={query}
        />
      </div>
    </div>
  );
}
