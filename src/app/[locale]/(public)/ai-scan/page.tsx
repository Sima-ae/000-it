import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AIScanForm } from "@/components/marketing/AIScanForm";
import { Reveal } from "@/components/marketing/Reveal";
import { BRANDING_IMAGES } from "@/lib/branding-images";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/ai-scan");
}

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
        <div className="relative mt-8 hidden aspect-5/4 overflow-hidden rounded-3xl bg-muted/30 md:block">
          <Image
            src={BRANDING_IMAGES.dashboardOverview}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-top"
          />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <AIScanForm />
      </Reveal>
    </div>
  );
}
