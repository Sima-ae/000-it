import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppointmentBooking } from "@/components/marketing/AppointmentBooking";
import { Reveal } from "@/components/marketing/Reveal";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/afspraak");
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appointment");

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <p className="mb-6 text-center text-sm text-muted-foreground md:text-base">
          {t("pageIntro")}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <AppointmentBooking />
      </Reveal>
    </div>
  );
}
