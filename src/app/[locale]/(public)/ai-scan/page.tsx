import { setRequestLocale, getTranslations } from "next-intl/server";
import { AIScanForm } from "@/components/marketing/AIScanForm";
import { Reveal } from "@/components/marketing/Reveal";

export default async function AIScanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aiScan");

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20 md:items-start">
      <Reveal>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground md:text-lg">{t("subtitle")}</p>
      </Reveal>
      <Reveal delay={0.08}>
        <AIScanForm />
      </Reveal>
    </div>
  );
}
