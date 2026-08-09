import { setRequestLocale, getTranslations } from "next-intl/server";
import { AIScanForm } from "@/components/marketing/AIScanForm";

export default async function AIScanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aiScan");

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:px-6">
      <div>
        <h1 className="text-4xl font-semibold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AIScanForm />
    </div>
  );
}
