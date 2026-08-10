import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";

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
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">{t("subtitle")}</p>
      </Reveal>
      <div className="masonry-services mt-10">
        {keys.map((key, i) => {
          const cardMinH = i % 2 === 0 ? "min-h-45" : "min-h-35";
          return (
            <Reveal key={key} delay={i * 0.05}>
              <GlassCard className={cardMinH}>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  {t(`items.${key}.title`)}
                </h2>
                <p className="mt-3 text-muted-foreground">{t(`items.${key}.desc`)}</p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
