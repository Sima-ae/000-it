"use client";

import { useTranslations, useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { CopyrightBar } from "@/components/shared/CopyrightBar";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { FacebookPageEmbed } from "@/components/shared/FacebookPageEmbed";
import { serviceCatalog, serviceGroupHref, serviceHref } from "@/content/fixweb/catalog";
import { catalogGroupTitle, catalogServiceTitle } from "@/content/fixweb/catalog-title";
import { localizedHref } from "@/i18n/pathnames";
import { useBrand } from "@/lib/brand/BrandProvider";

const WEBMAIL_URL = "https://web-mail.cloud";

type FooterLink = {
  href: string;
  /** next-intl nav key, or null when label comes from catalog / external */
  key: string | null;
  label?: string;
  external?: boolean;
};

/** Informatie: about + legal / FAQ / status / kennisbank */
function buildInfoLinks(locale: string): FooterLink[] {
  return [
    { href: localizedHref(locale, "/over-ons"), key: "about" },
    { href: localizedHref(locale, "/voorwaarden"), key: "terms", external: true },
    { href: localizedHref(locale, "/cookies"), key: "cookies", external: true },
    { href: localizedHref(locale, "/privacy"), key: "privacy", external: true },
    { href: localizedHref(locale, "/faq"), key: "faq" },
    { href: localizedHref(locale, "/statuspage"), key: "statuspage" },
    { href: localizedHref(locale, "/kennisbank"), key: "kennisbank" },
  ];
}

function domainsFooterLink(locale: string): FooterLink {
  const item = serviceCatalog.find((s) => s.slug === "domains");
  if (item) {
    return {
      href: serviceHref(locale, item),
      key: null,
      label: catalogServiceTitle(item.slug, locale, item.title),
    };
  }
  return {
    href: localizedHref(locale, "/domeinen"),
    key: null,
    label: "Domains",
  };
}

/** Handige links: booking, site sections, hosting, domains, pricing, webmail */
function buildHandyLinks(
  locale: string,
  catalogMode: "full" | "domains_hosting",
): FooterLink[] {
  if (catalogMode === "domains_hosting") {
    return [
      { href: localizedHref(locale, "/afspraak"), key: "book" },
      {
        href: serviceGroupHref(locale, "hosting"),
        key: null,
        label: catalogGroupTitle("hosting", locale, "Hosting"),
      },
      domainsFooterLink(locale),
      { href: localizedHref(locale, "/shop"), key: "pricing" },
      { href: localizedHref(locale, "/kennisbank"), key: "kennisbank" },
      { href: localizedHref(locale, "/nieuws"), key: "blog" },
      { href: localizedHref(locale, "/contact"), key: "contact" },
      { href: WEBMAIL_URL, key: "webmail", external: true },
    ];
  }
  return [
    { href: localizedHref(locale, "/afspraak"), key: "book" },
    { href: localizedHref(locale, "/diensten"), key: "services" },
    {
      href: serviceGroupHref(locale, "hosting"),
      key: null,
      label: catalogGroupTitle("hosting", locale, "Hosting"),
    },
    domainsFooterLink(locale),
    // Portfolio hidden until the page is filled — restore by uncommenting:
    // { href: localizedHref(locale, "/portfolio"), key: "portfolio" },
    { href: localizedHref(locale, "/shop"), key: "pricing" },
    { href: localizedHref(locale, "/nieuws"), key: "blog" },
    { href: localizedHref(locale, "/contact"), key: "contact" },
    { href: WEBMAIL_URL, key: "webmail", external: true },
  ];
}

function sortFooterLinks(
  items: FooterLink[],
  labelFor: (item: FooterLink) => string,
  locale: string,
) {
  return [...items].sort((a, b) =>
    labelFor(a).localeCompare(labelFor(b), locale, { sensitivity: "base" }),
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const brand = useBrand();
  const year = new Date().getFullYear();

  const labelFor = (item: FooterLink) =>
    item.label || (item.key ? nav(item.key) : "");

  const info = sortFooterLinks(buildInfoLinks(locale), labelFor, locale);
  const handy = sortFooterLinks(
    buildHandyLinks(locale, brand.catalogMode),
    labelFor,
    locale,
  );

  const columnTitleClass =
    "flex h-9 md:h-10 items-center justify-center text-xs font-bold uppercase leading-none tracking-[0.14em] text-foreground";

  return (
    <footer className="relative mt-6">
      {/* Extra bottom space so copyright clears the sticky domain bar at scroll end */}
      <div className="mx-auto max-w-7xl px-3 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:px-4 md:pt-8 md:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="grid items-start gap-8 px-6 pb-1 pt-7 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.3fr_1fr_1fr] lg:gap-x-5 lg:gap-y-8 lg:px-8 lg:pb-2 lg:pt-8">
            {/* 1 — Brand */}
            <div className="flex flex-col items-center text-center">
              <SoftLink
                href={localizedHref(locale, "/")}
                aria-label={brand.displayName}
                className="inline-flex h-9 items-center md:h-10"
              >
                <BrandLogo className="h-9 w-auto md:h-10" />
              </SoftLink>
              <div className="mt-3 max-w-[20rem] text-sm leading-relaxed text-muted-foreground text-pretty lg:max-w-none">
                <p>{t("tagline")}</p>
                <p className="mt-2 font-bold">{t("taglineClose")}</p>
              </div>
            </div>

            {/* 2 — Facebook */}
            <div className="flex min-w-0 w-full flex-col items-center text-center">
              <p className={columnTitleClass}>{t("socialMedia")}</p>
              <div className="mt-3 w-full max-w-70">
                <FacebookPageEmbed locale={locale} />
              </div>
            </div>

            {/* 3 — Informatie */}
            <div className="flex flex-col items-center text-center text-sm text-muted-foreground">
              <p className={columnTitleClass}>{nav("info")}</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {info.map((page) => (
                  <SoftLink
                    key={page.href}
                    href={page.href}
                    {...(page.external
                      ? { target: "_blank" as const, rel: "noopener noreferrer" }
                      : {})}
                    className="leading-snug transition hover:text-foreground"
                  >
                    {labelFor(page)}
                  </SoftLink>
                ))}
              </div>
            </div>

            {/* 4 — Handige links */}
            <div className="flex flex-col items-center text-center text-sm text-muted-foreground">
              <p className={columnTitleClass}>{t("usefulLinks")}</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {handy.map((page) =>
                  page.external ? (
                    <a
                      key={page.href}
                      href={page.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-snug transition hover:text-foreground"
                    >
                      {labelFor(page)}
                    </a>
                  ) : (
                    <SoftLink
                      key={page.href}
                      href={page.href}
                      className="leading-snug transition hover:text-foreground"
                    >
                      {labelFor(page)}
                    </SoftLink>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Full-width copyright row under all columns */}
          <CopyrightBar
            year={year}
            rights={t("rights")}
            className="bg-transparent px-6 pb-5 pt-0 text-center md:px-8 md:pb-6"
          />
        </div>
      </div>
    </footer>
  );
}
