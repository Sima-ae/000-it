import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppointmentBooking } from "@/components/marketing/AppointmentBooking";
import { Reveal } from "@/components/marketing/Reveal";
import { BRANDING_IMAGES } from "@/lib/branding-images";
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
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="relative h-28 w-40 overflow-hidden sm:h-32 sm:w-48">
            <Image
              src={BRANDING_IMAGES.collaboration}
              alt=""
              fill
              unoptimized
              sizes="192px"
              className="rounded-2xl object-cover"
            />
          </div>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            {t("pageIntro")}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <AppointmentBooking />
      </Reveal>
    </div>
  );
}
