import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function scoreFromResults(results: unknown, key: string): number | null {
  if (!results || typeof results !== "object") return null;
  const value = (results as Record<string, unknown>)[key];
  return typeof value === "number" ? value : null;
}

export default async function SeoAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const session = await auth();

  const scans = session?.user?.id
    ? await prisma.aIScan.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("seo")}</h1>
          <p className="text-sm text-muted-foreground">
            Review your AI/SEO scan history and run a new scan.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/ai-scan`}>{t("runScan")}</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent scans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!scans.length && (
            <p className="text-muted-foreground">
              No scans yet. Start with a free AI Scan to generate SEO, AEO and GEO scores.
            </p>
          )}
          {scans.map((scan) => {
            const seo = scoreFromResults(scan.results, "seo");
            const aeo = scoreFromResults(scan.results, "aeo");
            const geo = scoreFromResults(scan.results, "geo");
            return (
              <div
                key={scan.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium">{scan.url}</p>
                  <p className="text-xs text-muted-foreground">
                    {scan.company ? `${scan.company} · ` : ""}
                    {new Date(scan.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{scan.status}</Badge>
                  {seo !== null ? <Badge variant="secondary">SEO {seo}</Badge> : null}
                  {aeo !== null ? <Badge variant="secondary">AEO {aeo}</Badge> : null}
                  {geo !== null ? <Badge variant="outline">GEO {geo}</Badge> : null}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
