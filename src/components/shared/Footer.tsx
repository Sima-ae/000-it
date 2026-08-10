"use client";

import { useTranslations, useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { CopyrightBar } from "@/components/shared/CopyrightBar";

const legalPages = [
  { href: "/privacy", key: "privacy" },
  { href: "/cookies", key: "cookies" },
  { href: "/voorwaarden", key: "terms" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isNl = locale === "nl";
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 md:px-6 md:pt-10 md:pb-5">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="grid gap-8 px-6 py-7 sm:grid-cols-2 md:grid-cols-3 md:gap-6 md:px-8 md:py-8">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                TripleZero iT
              </p>
              <p className="mt-2 max-w-[16rem] text-sm leading-snug text-muted-foreground">
                {t("tagline")}
              </p>
              <a
                href="mailto:info@000-it.com"
                className="mt-4 inline-block text-sm font-medium text-foreground transition hover:text-primary"
              >
                info@000-it.com
              </a>
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {isNl ? "Bedrijf" : "Company"}
              </p>
              <SoftLink href={`/${locale}/over-ons`} className="leading-snug transition hover:text-foreground">
                {nav("about")}
              </SoftLink>
              <SoftLink href={`/${locale}/locaties`} className="leading-snug transition hover:text-foreground">
                {isNl ? "Locaties" : "Locations"}
              </SoftLink>
              <SoftLink href={`/${locale}/portfolio`} className="leading-snug transition hover:text-foreground">
                {nav("portfolio")}
              </SoftLink>
              <SoftLink href={`/${locale}/shop`} className="leading-snug transition hover:text-foreground">
                {nav("shop")}
              </SoftLink>
              <SoftLink href={`/${locale}/faq`} className="leading-snug transition hover:text-foreground">
                {nav("faq")}
              </SoftLink>
              <SoftLink href={`/${locale}/afspraak`} className="leading-snug transition hover:text-foreground">
                {nav("book")}
              </SoftLink>
              <SoftLink href={`/${locale}/contact`} className="leading-snug transition hover:text-foreground">
                {nav("contact")}
              </SoftLink>
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {isNl ? "Informatie" : "Legal"}
              </p>
              {legalPages.map((page) => (
                <SoftLink
                  key={page.href}
                  href={`/${locale}${page.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-snug transition hover:text-foreground"
                >
                  {nav(page.key)}
                </SoftLink>
              ))}
            </div>
          </div>
        </div>

        <CopyrightBar year={year} rights={t("rights")} />
      </div>
    </footer>
  );
}
