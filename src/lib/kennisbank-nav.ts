import type { KennisbankCategoryView } from "@/lib/kennisbank";
import { localizedHref } from "@/i18n/pathnames";

export type KennisbankPopularLink = {
  label: string;
  href: string;
};

export type KennisbankTopicLabel = {
  label: string;
  href: string;
};

/** YH-style “Populair” shortcuts — category or article deep links + status. */
export function kennisbankPopularLinks(
  locale: string,
  opts?: { hostingOnly?: boolean },
): KennisbankPopularLink[] {
  const kb = (path: string) => localizedHref(locale, path);
  const links: KennisbankPopularLink[] = [
    {
      label: locale === "en" ? "Set up email" : "E-mail instellen",
      href: kb("/kennisbank/e-mail-instellen"),
    },
    {
      label: locale === "en" ? "Webmail login" : "Inloggen webmail",
      href: kb("/kennisbank/e-mail/hoe-kom-ik-bij-mijn-webmail"),
    },
    {
      label: locale === "en" ? "Manage DNS" : "DNS beheren",
      href: kb("/kennisbank/dns-records"),
    },
    {
      label: locale === "en" ? "Change password" : "Wachtwoord wijzigen",
      href: kb("/kennisbank/e-mail/wachtwoord-van-e-mailadres-wijzigen"),
    },
    {
      label: locale === "en" ? "Forward domain" : "Domein doorsturen",
      href: kb("/kennisbank/domeinnamen/domeinnaam-doorsturen"),
    },
    {
      label: locale === "en" ? "Any outage?" : "Is er een storing?",
      href: localizedHref(locale, "/statuspage"),
    },
  ];
  if (opts?.hostingOnly) return links;
  return links;
}

/** Product/topic pills (not competitor brand labels). */
export function kennisbankTopicLabels(
  locale: string,
  categories: KennisbankCategoryView[],
  opts?: { hostingOnly?: boolean },
): KennisbankTopicLabel[] {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const hosting = [
    "directadmin",
    "plesk",
    "cyberpanel",
    "wordpress",
    "vps",
    "ssl-certificaten",
    "dns-records",
    "microsoft",
    "e-mail",
    "domeinnamen",
  ];
  const fullExtra = [
    "ai-scan",
    "aeo-geo-seo",
    "shop-en-pakketten",
    "crm-klantenpanel",
  ];
  const slugs = opts?.hostingOnly ? hosting : [...hosting, ...fullExtra];
  const out: KennisbankTopicLabel[] = [];
  for (const slug of slugs) {
    const cat = bySlug.get(slug);
    if (!cat) continue;
    out.push({
      label: cat.name,
      href: localizedHref(locale, `/kennisbank/${cat.slug}`),
    });
  }
  return out;
}
