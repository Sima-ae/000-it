import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ContentGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{t("content")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("comingSoon")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            AI content generation connects to OpenAI/Anthropic in a later release.
          </p>
          <Button asChild variant="outline">
            <Link href={`/${locale}/ai-scan`}>{t("runScan")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
