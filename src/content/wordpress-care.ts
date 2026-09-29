/** WordPress care packages shown on /diensten/categorie/wordpress. */

export const WP_CARE_KEYS = ["business", "businessPro", "enterprise"] as const;
export type WpCareKey = (typeof WP_CARE_KEYS)[number];
export type WpCareHosting = "with" | "without";

/** Monthly prices in euros, including VAT. */
export const WP_CARE_PRICES: Record<
  WpCareKey,
  { withHosting: number; withoutHosting: number }
> = {
  business: { withHosting: 79, withoutHosting: 69 },
  businessPro: { withHosting: 189, withoutHosting: 179 },
  enterprise: { withHosting: 299, withoutHosting: 289 },
};

/** Index of the hosting line inside `features`. */
export const WP_CARE_HOSTING_FEATURE_INDEX = 2;

type PackageCopy = {
  name: string;
  badge: string;
  features: string[];
};

const PACKAGES: Record<
  WpCareKey,
  { featured: boolean; nl: PackageCopy; en: PackageCopy }
> = {
  business: {
    featured: false,
    nl: {
      name: "Business",
      badge: "Standaard WordPress site",
      features: [
        "Beheer van een standaard website",
        "Geoptimaliseerde snelheid",
        "Groene razendsnelle hosting",
        "Geen complexe plugins",
        "Geen webshop",
        "Geen meertaligheid",
        "Geen multisite",
      ],
    },
    en: {
      name: "Business",
      badge: "Standard WordPress site",
      features: [
        "Management of a standard website",
        "Optimized speed",
        "Green high-speed hosting",
        "No complex plugins",
        "No webshop",
        "No multilingual setup",
        "No multisite",
      ],
    },
  },
  businessPro: {
    featured: true,
    nl: {
      name: "Business pro",
      badge: "Professionele WordPress site",
      features: [
        "Beheer van een professionele website",
        "Geoptimaliseerde snelheid",
        "Groene razendsnelle hosting",
        "1-2 complexe WordPress plugins",
        "Geschikt voor multisite",
        "Geschikt voor meertaligheid",
        "Optie voor OTAP-straat",
      ],
    },
    en: {
      name: "Business pro",
      badge: "Professional WordPress site",
      features: [
        "Management of a professional website",
        "Optimized speed",
        "Green high-speed hosting",
        "1-2 complex WordPress plugins",
        "Suitable for multisite",
        "Suitable for multilingual",
        "Optional OTAP pipeline",
      ],
    },
  },
  enterprise: {
    featured: false,
    nl: {
      name: "Enterprise",
      badge: "Complexe WordPress site",
      features: [
        "Beheer van een complexe website",
        "Geoptimaliseerde snelheid",
        "Groene razendsnelle hosting",
        "2+ complexe WordPress plugins",
        "Geschikt voor webshop",
        "Service-overleg per kwartaal",
        "Inclusief OTAP-straat",
      ],
    },
    en: {
      name: "Enterprise",
      badge: "Complex WordPress site",
      features: [
        "Management of a complex website",
        "Optimized speed",
        "Green high-speed hosting",
        "2+ complex WordPress plugins",
        "Suitable for a webshop",
        "Quarterly service review",
        "OTAP pipeline included",
      ],
    },
  },
};

const UI = {
  nl: {
    title: "WordPress beheer",
    headline:
      "Maandelijks beheer van jouw WordPress-website.",
    withHosting: "Met hosting",
    withoutHosting: "Zonder hosting",
    hostingChoice: "Hosting",
    altWithout: "of {price} per maand zonder hosting",
    altWith: "of {price} per maand met hosting",
    vatNote: "Alle prijzen zijn inclusief BTW.",
  },
  en: {
    title: "WordPress care",
    headline:
      "Monthly care for your WordPress website. All prices include VAT.",
    withHosting: "With hosting",
    withoutHosting: "Without hosting",
    hostingChoice: "Hosting",
    altWithout: "or {price} per month without hosting",
    altWith: "or {price} per month with hosting",
    vatNote: "All prices include VAT.",
  },
} as const;

function lang(locale: string): "nl" | "en" {
  return locale === "nl" ? "nl" : "en";
}

export function wpCareUi(locale: string) {
  return UI[lang(locale)];
}

export function wpCareSlug(key: WpCareKey, hosting: WpCareHosting) {
  const base = key === "businessPro" ? "business-pro" : key;
  return hosting === "with" ? `wp-care-${base}-hosting` : `wp-care-${base}`;
}

export function wpCareProductId(key: WpCareKey, hosting: WpCareHosting) {
  return `service-${wpCareSlug(key, hosting)}`;
}

export function isWpCareSlug(slug: string) {
  return WP_CARE_KEYS.some(
    (key) =>
      slug === wpCareSlug(key, "with") || slug === wpCareSlug(key, "without"),
  );
}

export function wpCareKeyFromSlug(slug: string): WpCareKey | null {
  for (const key of WP_CARE_KEYS) {
    if (
      slug === wpCareSlug(key, "with") ||
      slug === wpCareSlug(key, "without")
    ) {
      return key;
    }
  }
  return null;
}

export function wpCarePackages(
  locale: string,
  prices: typeof WP_CARE_PRICES = WP_CARE_PRICES,
) {
  const code = lang(locale);
  return WP_CARE_KEYS.map((key) => {
    const pack = PACKAGES[key];
    const copy = pack[code];
    return {
      key,
      name: copy.name,
      badge: copy.badge,
      features: copy.features,
      withHosting: prices[key].withHosting,
      withoutHosting: prices[key].withoutHosting,
      featured: pack.featured,
    };
  });
}

export function wpCarePackageCopy(locale: string, key: WpCareKey) {
  return PACKAGES[key][lang(locale)];
}
