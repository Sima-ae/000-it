import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/marketing/Reveal";
import { NewsGrid } from "@/components/content/NewsGrid";
import { listNewsPosts } from "@/lib/news";

export const revalidate = 60;

export default async function NieuwsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const isNl = locale === "nl";
  const posts = await listNewsPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("blog")}
        </h1>
      </Reveal>

      <NewsGrid
        items={posts}
        labels={{
          client: isNl ? "Auteur" : "Author",
          date: isNl ? "Datum" : "Date",
          industry: isNl ? "Categorie" : "Category",
          visit: isNl ? "Bekijk link" : "Open link",
        }}
      />
    </div>
  );
}
