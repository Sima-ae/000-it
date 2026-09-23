import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/marketing/ContactForm";
import { GlassCard } from "@/components/marketing/GlassCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { BRANDING_IMAGES } from "@/lib/branding-images";
import { buildStaticPageMetadata } from "@/lib/seo";
import { localizedHref } from "@/i18n/pathnames";
import { Mail, MapPin, Route } from "lucide-react";

const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!4v1790197217557!6m8!1m7!1sellhEZiM9ZU3WEQ2bjDNfg!2m2!1d25.18586404416713!2d55.2645970745307!3f158.64569306014448!4f29.438024565055244!5f0.7820865974627469";

const MAP_OPEN_URL =
  "https://www.google.com/maps/@?api=1&map_action=pano&pano=ellhEZiM9ZU3WEQ2bjDNfg&viewpoint=25.18586404416713,55.2645970745307&heading=158.64569306014448&pitch=29.438024565055244";

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
  const tNav = await getTranslations("nav");

  const addressLines = [
    t("addressLine1"),
    t("addressLine2"),
    t("addressLine3"),
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-4 md:px-6 md:pt-14 md:pb-6">
      <Reveal>
        <div className="grid items-end gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-primary md:text-5xl">
              {t("title")}
            </h1>
            <Button asChild size="sm" className="rounded-xl">
              <SoftLink href={localizedHref(locale, "/afspraak")}>
                {tNav("book")}
              </SoftLink>
            </Button>
          </div>
          <div className="relative mx-auto hidden h-36 w-full max-w-xs overflow-hidden lg:block">
            <Image
              src={BRANDING_IMAGES.consultantLaptop}
              alt=""
              fill
              unoptimized
              priority
              sizes="320px"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-5">
        <Reveal delay={0.04} className="h-full">
          <GlassCard interactive={false} className="h-full p-5 md:p-6">
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {t("companyName")}
              </h2>

              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("addressLabel")}
                  </p>
                  <address className="mt-1.5 not-italic text-sm leading-relaxed text-foreground">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("emailLabel")}:
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {(
                      [
                        "info@000-it.com",
                        "privacy@000-it.com",
                        "sales@000-it.com",
                        "support@000-it.com",
                      ] as const
                    ).map((email) => (
                      <li key={email} className="flex gap-1.5 text-sm">
                        <span className="text-muted-foreground" aria-hidden>
                          ·
                        </span>
                        <a
                          href={`mailto:${email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary transition hover:underline"
                        >
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Route className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("routeLabel")}
                  </p>
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-border/60">
                    <iframe
                      title={t("routeLabel")}
                      src={MAP_EMBED_SRC}
                      className="pointer-events-none h-36 w-full border-0 md:h-40"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                    <a
                      href={MAP_OPEN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                      aria-label={t("routeOpenAria")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.08} className="h-full">
          <GlassCard
            interactive={false}
            className="flex h-full flex-col p-5 md:p-6"
          >
            <p className="mb-4 shrink-0 text-sm font-medium leading-relaxed text-accent md:text-[15px]">
              {t("detailsNote")}
            </p>
            <ContactForm className="flex min-h-0 flex-1 flex-col gap-4" fillHeight />
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
