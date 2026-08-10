import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { buildStaticPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/portfolio");
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");

  const items = await prisma.portfolioProject.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const serializable = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    description: item.description,
    coverImage: item.coverImage,
    gallery: item.gallery,
    projectUrl: item.projectUrl,
    repoUrl: item.repoUrl,
    clientName: item.clientName,
    industry: item.industry,
    year: item.year,
    tags: item.tags,
    technologies: item.technologies,
    featured: item.featured,
  }));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <p className="pb-10 text-muted-foreground">{t("empty")}</p>
        ) : (
          <PortfolioGrid
            items={serializable}
            labels={{
          client: t("client"),
          industry: t("industry"),
          technologies: t("technologies"),
          visit: t("visit"),
          repo: t("repo"),
        }}
          />
        )}
      </div>
    </div>
  );
}
