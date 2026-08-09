import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-4xl font-semibold">{t("title")}</h1>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <GlassCard>
          <h2 className="text-lg font-medium">{t("mission")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("missionText")}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-medium">{t("vision")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("visionText")}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-medium">{t("philosophy")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("philosophyText")}</p>
        </GlassCard>
      </div>
    </div>
  );
}
