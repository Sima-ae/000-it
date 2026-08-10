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
  const t = await getTranslations("nav");
  const isNl = locale === "nl";

  const requestedPage = Math.max(1, Number.parseInt(pageParam || "1", 10) || 1);
  const { items, page, totalPages } = await listNewsPostsPage({
    locale,
    page: requestedPage,
    pageSize: NEWS_PAGE_SIZE,
  });

  const paginationLabels = {
    previous: isNl ? "Vorige" : "Previous",
    next: isNl ? "Volgende" : "Next",
    pageOf: isNl ? "Pagina {page} van {total}" : "Page {page} of {total}",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "TripleZero iT", path: `/${locale}` },
          { name: t("blog"), path: `/${locale}/nieuws` },
        ])}
      />

      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("blog")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {isNl
            ? "AI- en tech-nieuws met praktische inzichten voor bedrijven in Nederland."
            : "AI and tech news with practical insights for growing businesses."}
        </p>
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
          client: isNl ? "Auteur" : "Author",
          date: isNl ? "Datum" : "Date",
          industry: isNl ? "Categorie" : "Category",
          visit: isNl ? "Bekijk link" : "Open link",
          readMore: isNl ? "Lees artikel" : "Read article",
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
