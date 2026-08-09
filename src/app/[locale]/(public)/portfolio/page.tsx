import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";

export const dynamic = "force-dynamic";

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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto max-w-[1600px] px-4 pb-20 text-muted-foreground md:px-6">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <PortfolioCard key={item.id} locale={locale} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
