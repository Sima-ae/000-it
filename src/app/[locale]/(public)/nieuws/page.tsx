import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { NewsGrid } from "@/components/content/NewsGrid";
import { NewsPagination } from "@/components/content/NewsPagination";
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
  searchParams: Promise<{ page?: string }>;
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
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("news");

  const requestedPage = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
  const { items, page, totalPages } = await listNewsPostsPage({
    locale,
    page: requestedPage,
    pageSize: NEWS_PAGE_SIZE,
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
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {tNav("blog")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <div className="mt-8">
        <NewsPagination
          locale={locale}
          page={page}
          totalPages={totalPages}
          labels={paginationLabels}
        />
      </div>

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

      <div className="mt-10">
        <NewsPagination
          locale={locale}
          page={page}
          totalPages={totalPages}
          labels={paginationLabels}
        />
      </div>
    </div>
  );
}
