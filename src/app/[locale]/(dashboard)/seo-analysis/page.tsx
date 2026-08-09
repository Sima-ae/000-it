import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SeoAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("seo")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("comingSoon")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Full SEO/AEO/GEO dashboards land in the next phase. Use the free AI Scan
            for simulated scores today.
          </p>
          <Button asChild>
            <Link href={`/${locale}/ai-scan`}>{t("runScan")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
