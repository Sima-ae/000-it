import { setRequestLocale, getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(
          [
            ["mission", "missionText"],
            ["vision", "visionText"],
            ["philosophy", "philosophyText"],
          ] as const
        ).map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.07}>
            <GlassCard className="h-full min-h-50">
              <h2 className="font-display text-xl font-semibold tracking-tight">{t(title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t(body)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
