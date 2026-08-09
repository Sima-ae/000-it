import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";

const keys = ["ai", "seo", "web", "content", "ads", "software"] as const;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {keys.map((key) => (
          <GlassCard key={key}>
            <h2 className="text-xl font-medium">{t(`items.${key}.title`)}</h2>
            <p className="mt-2 text-muted-foreground">{t(`items.${key}.desc`)}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
