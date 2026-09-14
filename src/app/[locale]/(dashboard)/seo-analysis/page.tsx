import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { canDelete, canEditAny } from "@/lib/roles";
import { SeoScansPanel } from "@/components/dashboard/SeoScansPanel";
import { localizedHref } from "@/i18n/pathnames";

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
  const adminView = canEditAny(session?.user?.role);
  const canManage = canDelete(session?.user?.role);

  const scans = session?.user?.id
    ? await prisma.aIScan.findMany({
        where: adminView ? undefined : { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: adminView ? 25 : 10,
      })
    : [];

  const rows = scans.map((scan) => ({
    id: scan.id,
    url: scan.url,
    company: scan.company,
    status: scan.status,
    createdAt: scan.createdAt.toISOString(),
    aeo: scoreFromResults(scan.results, "aeo"),
    geo: scoreFromResults(scan.results, "geo"),
    seo: scoreFromResults(scan.results, "seo"),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">{t("seo")}</h1>
          <p className="text-sm text-muted-foreground">
            {adminView ? t("seoStaffSubtitle") : t("seoClientSubtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href={localizedHref(locale, "/ai-scan")}>{t("runScan")}</Link>
        </Button>
      </div>

      <SeoScansPanel canManage={canManage} initialScans={rows} />
    </div>
  );
}
