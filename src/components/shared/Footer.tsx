"use client";

import { useTranslations, useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { legalPages, serviceCatalog } from "@/content/fixweb/catalog";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isNl = locale === "nl";
  const year = new Date().getFullYear();

  const quickServices = serviceCatalog
    .filter((s) =>
      [
        "wordpress-support",
        "seo-optimization",
        "digital-marketing",
        "web-hosting",
        "wordpress-hosting",
        "domains",
      ].includes(s.slug),
    );

  return (
    <footer className="relative mt-20 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="glass grid gap-10 rounded-4xl p-8 md:grid-cols-4 md:p-10">
          <div className="md:col-span-1">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              TripleZero iT
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">
              {nav("services")}
            </p>
            {quickServices.map((item) => (
              <SoftLink
                key={item.slug}
                href={`/${locale}/diensten/${item.slug}`}
                className="transition hover:text-foreground"
              >
                {isNl ? item.titleNl : item.title}
              </SoftLink>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">
              {isNl ? "Bedrijf" : "Company"}
            </p>
            <SoftLink href={`/${locale}/over-ons`} className="transition hover:text-foreground">
              {nav("about")}
            </SoftLink>
            <SoftLink href={`/${locale}/portfolio`} className="transition hover:text-foreground">
              {nav("portfolio")}
            </SoftLink>
            <SoftLink href={`/${locale}/faq`} className="transition hover:text-foreground">
              {nav("faq")}
            </SoftLink>
            <SoftLink href={`/${locale}/afspraak`} className="transition hover:text-foreground">
              {nav("book")}
            </SoftLink>
            <SoftLink href={`/${locale}/contact`} className="transition hover:text-foreground">
              {nav("contact")}
            </SoftLink>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground">
              {isNl ? "Juridisch" : "Legal"}
            </p>
            <div className="flex flex-col gap-2.5">
              {legalPages.map((page) => (
                <SoftLink
                  key={page.href}
                  href={`/${locale}${page.href}`}
                  className="transition hover:text-foreground"
                >
                  {isNl ? page.titleNl : page.title}
                </SoftLink>
              ))}
            </div>
            <p className="mt-6 font-medium text-foreground">info@000-it.com</p>
            <p className="mt-2 text-xs leading-relaxed">
              © {year} TripleZero iT. {t("rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
