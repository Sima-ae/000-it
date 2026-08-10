import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { buildStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/contact");
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-14 text-center md:px-6 md:py-20">
      <Reveal className="w-full">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("title")}
        </h1>
        <div className="mt-8 flex justify-center">
          <Button asChild className="rounded-2xl">
            <SoftLink href={`/${locale}/afspraak`}>
              {locale === "nl" ? "Direct een afspraak maken?" : "Prefer to book directly?"}
            </SoftLink>
          </Button>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground md:text-lg">{t("subtitle")}</p>
      </Reveal>
      <Reveal delay={0.08} className="mt-10 w-full">
        <GlassCard interactive={false}>
          <ContactForm centered />
        </GlassCard>
      </Reveal>
    </div>
  );
}
