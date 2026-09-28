import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StatusPageView } from "@/components/status/StatusPageView";
import { buildStaticPageMetadata } from "@/lib/seo";
import { loadStatusPagePayload } from "@/lib/statuspage/hostinger";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/statuspage");
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const initial = await loadStatusPagePayload();
  return <StatusPageView initial={initial} />;
}
