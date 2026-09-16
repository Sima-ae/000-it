/**
 * Localized public URL segments for every enabled locale.
 * Internal App Router paths stay Dutch/shared (e.g. /diensten); middleware
 * rewrites locale-specific URLs onto those internals via next-intl pathnames.
 */

import { enabledLanguages } from "./languages";
import {
  canonicalEntityKey,
  publicEntitySlug,
  type EntityType,
} from "@/lib/entity-slug-cache";

export const LOCALES = enabledLanguages().map((l) => l.code) as [string, ...string[]];

type LocaleMap = Record<string, string>;

function mapAll(values: Record<string, string>, fallback: string): LocaleMap {
  const out: LocaleMap = {};
  for (const code of LOCALES) {
    out[code] = values[code] || fallback;
  }
  return out;
}

/**
 * Static top-level segments (no leading slash).
 * Internal key → per-locale public slug.
 */
export const SEGMENT_I18N = {
  diensten: mapAll(
    {
      nl: "diensten",
      en: "services",
      fr: "services",
      de: "dienstleistungen",
      es: "servicios",
      pt: "servicos",
      it: "servizi",
      el: "ypiresies",
      pl: "uslugi",
      cs: "sluzby",
      sk: "sluzby",
      hu: "szolgaltatasok",
      ro: "servicii",
      bg: "uslugi",
      hr: "usluge",
      sr: "usluge",
      bs: "usluge",
      cnr: "usluge",
      sq: "sherbime",
      mk: "uslugi",
      lt: "paslaugos",
      da: "ydelser",
      sv: "tjanster",
      no: "tjenester",
      fi: "palvelut",
      uk: "poslugy",
      ru: "uslugi",
      tr: "hizmetler",
      he: "sherutim",
      ar: "khadamat",
      ka: "servisebi",
      hy: "tsarayutyunner",
      az: "xidmetler",
      zh: "fuwu",
      ja: "sabisu",
    },
    "services",
  ),
  categorie: mapAll(
    {
      nl: "categorie",
      en: "category",
      fr: "categorie",
      de: "kategorie",
      es: "categoria",
      pt: "categoria",
      it: "categoria",
      el: "katigoria",
      pl: "kategoria",
      cs: "kategorie",
      sk: "kategoria",
      hu: "kategoria",
      ro: "categorie",
      bg: "kategoriya",
      hr: "kategorija",
      sr: "kategorija",
      bs: "kategorija",
      cnr: "kategorija",
      sq: "kategori",
      mk: "kategorija",
      lt: "kategorija",
      da: "kategori",
      sv: "kategori",
      no: "kategori",
      fi: "kategoria",
      uk: "kategoriya",
      ru: "kategoriya",
      tr: "kategori",
      he: "kategoria",
      ar: "fia",
      ka: "kategoria",
      hy: "katagoria",
      az: "kateqoriya",
      zh: "fenlei",
      ja: "category",
    },
    "category",
  ),
  kennisbank: mapAll(
    {
      nl: "kennisbank",
      en: "knowledgebase",
      fr: "base-de-connaissances",
      de: "wissensdatenbank",
      es: "base-de-conocimientos",
      pt: "base-de-conhecimento",
      it: "knowledge-base",
      el: "basi-gnoseon",
      pl: "baza-wiedzy",
      cs: "databaze-znalosti",
      sk: "databaza-znalosti",
      hu: "tudastar",
      ro: "baza-de-cunostinte",
      bg: "baza-znaniya",
      hr: "baza-znanja",
      sr: "baza-znanja",
      bs: "baza-znanja",
      cnr: "baza-znanja",
      sq: "baza-e-njohurive",
      mk: "baza-na-znaenje",
      lt: "ziniu-baze",
      da: "vidensbase",
      sv: "kunskapsbank",
      no: "kunnskapsbase",
      fi: "tietopankki",
      uk: "baza-znan",
      ru: "baza-znaniy",
      tr: "bilgi-bankasi",
      he: "bank-yeda",
      ar: "qaedat-almarefa",
      ka: "codnis-baza",
      hy: "giteliqneri-baza",
      az: "bilik-banki",
      zh: "zhishiku",
      ja: "knowledge-base",
    },
    "knowledgebase",
  ),
  nieuws: mapAll(
    {
      nl: "nieuws",
      en: "news",
      fr: "actualites",
      de: "nachrichten",
      es: "noticias",
      pt: "noticias",
      it: "notizie",
      el: "nea",
      pl: "aktualnosci",
      cs: "novinky",
      sk: "novinky",
      hu: "hirek",
      ro: "stiri",
      bg: "novini",
      hr: "vijesti",
      sr: "vesti",
      bs: "vijesti",
      cnr: "vijesti",
      sq: "lajme",
      mk: "vesti",
      lt: "naujienos",
      da: "nyheder",
      sv: "nyheter",
      no: "nyheter",
      fi: "uutiset",
      uk: "novyny",
      ru: "novosti",
      tr: "haberler",
      he: "chadashot",
      ar: "akhbar",
      ka: "akhali-ambebi",
      hy: "norutyunner",
      az: "xeberler",
      zh: "xinwen",
      ja: "nyusu",
    },
    "news",
  ),
  "over-ons": mapAll(
    {
      nl: "over-ons",
      en: "about-us",
      fr: "a-propos",
      de: "uber-uns",
      es: "sobre-nosotros",
      pt: "sobre-nos",
      it: "chi-siamo",
      el: "sxetika-me-emas",
      pl: "o-nas",
      cs: "o-nas",
      sk: "o-nas",
      hu: "rolunk",
      ro: "despre-noi",
      bg: "za-nas",
      hr: "o-nama",
      sr: "o-nama",
      bs: "o-nama",
      cnr: "o-nama",
      sq: "rreth-nesh",
      mk: "za-nas",
      lt: "apie-mus",
      da: "om-os",
      sv: "om-oss",
      no: "om-oss",
      fi: "tietoa-meista",
      uk: "pro-nas",
      ru: "o-nas",
      tr: "hakkimizda",
      he: "odotenu",
      ar: "man-nahnu",
      ka: "chvens-shesakheb",
      hy: "mez-masin",
      az: "haqqimizda",
      zh: "guanyu-women",
      ja: "watashitachi-ni-tsuite",
    },
    "about-us",
  ),
  afspraak: mapAll(
    {
      nl: "afspraak",
      en: "appointment",
      fr: "rendez-vous",
      de: "termin",
      es: "cita",
      pt: "agendamento",
      it: "appuntamento",
      el: "rantevou",
      pl: "wizyta",
      cs: "schuzka",
      sk: "stretnutie",
      hu: "idopont",
      ro: "programare",
      bg: "chas",
      hr: "termin",
      sr: "termin",
      bs: "termin",
      cnr: "termin",
      sq: "takim",
      mk: "termin",
      lt: "susitikimas",
      da: "aftale",
      sv: "bokning",
      no: "avtale",
      fi: "ajanvaraus",
      uk: "zustrich",
      ru: "zapis",
      tr: "randevu",
      he: "pgisha",
      ar: "mawed",
      ka: "shekhvedra",
      hy: "handipum",
      az: "gorus",
      zh: "yuyue",
      ja: "yoyaku",
    },
    "appointment",
  ),
  locaties: mapAll(
    {
      nl: "locaties",
      en: "locations",
      fr: "emplacements",
      de: "standorte",
      es: "ubicaciones",
      pt: "localizacoes",
      it: "sedi",
      el: "topothesies",
      pl: "lokalizacje",
      cs: "lokality",
      sk: "lokality",
      hu: "helyszinek",
      ro: "locatii",
      bg: "lokacii",
      hr: "lokacije",
      sr: "lokacije",
      bs: "lokacije",
      cnr: "lokacije",
      sq: "vendndodhjet",
      mk: "lokacii",
      lt: "vietoves",
      da: "lokationer",
      sv: "platser",
      no: "lokasjoner",
      fi: "sijainnit",
      uk: "lokaciyi",
      ru: "lokacii",
      tr: "konumlar",
      he: "mearot",
      ar: "mawaqe",
      ka: "lokaciebi",
      hy: "vayrer",
      az: "mekanlar",
      zh: "didian",
      ja: "basho",
    },
    "locations",
  ),
  voorwaarden: mapAll(
    {
      nl: "voorwaarden",
      en: "terms",
      fr: "conditions",
      de: "agb",
      es: "terminos",
      pt: "termos",
      it: "termini",
      el: "oroi",
      pl: "regulamin",
      cs: "podminky",
      sk: "podmienky",
      hu: "feltetelek",
      ro: "termeni",
      bg: "usloviya",
      hr: "uvjeti",
      sr: "uslovi",
      bs: "uslovi",
      cnr: "uslovi",
      sq: "kushtet",
      mk: "uslovi",
      lt: "salygos",
      da: "vilkar",
      sv: "villkor",
      no: "vilkar",
      fi: "ehdot",
      uk: "umovy",
      ru: "usloviya",
      tr: "kosullar",
      he: "tnaim",
      ar: "shurut",
      ka: "pirobebi",
      hy: "paymanner",
      az: "shertler",
      zh: "tiaokuan",
      ja: "riyokiyaku",
    },
    "terms",
  ),
  "ai-scan": mapAll(
    {
      nl: "ai-scan",
      en: "ai-scan",
      fr: "scan-ia",
      de: "ki-scan",
      es: "escaneo-ia",
      pt: "scan-ia",
      it: "scan-ia",
      el: "ai-scan",
      pl: "skan-ai",
      cs: "ai-scan",
      sk: "ai-scan",
      hu: "ai-scan",
      ro: "scanare-ai",
      bg: "ai-skan",
      hr: "ai-scan",
      sr: "ai-sken",
      bs: "ai-scan",
      cnr: "ai-scan",
      sq: "skanim-ai",
      mk: "ai-sken",
      lt: "ai-skenavimas",
      da: "ai-scan",
      sv: "ai-scan",
      no: "ai-scan",
      fi: "ai-skannaus",
      uk: "ai-skan",
      ru: "ai-skan",
      tr: "ai-tarama",
      he: "ai-scan",
      ar: "ai-scan",
      ka: "ai-skani",
      hy: "ai-skan",
      az: "ai-scan",
      zh: "ai-saomiao",
      ja: "ai-scan",
    },
    "ai-scan",
  ),
  "case-studies": mapAll(
    {
      nl: "case-studies",
      en: "case-studies",
      fr: "etudes-de-cas",
      de: "fallstudien",
      es: "casos-de-exito",
      pt: "estudos-de-caso",
      it: "casi-studio",
      el: "meletes-periptoseon",
      pl: "case-studies",
      cs: "pripadove-studie",
      sk: "pripadove-studie",
      hu: "esettanulmanyok",
      ro: "studii-de-caz",
      bg: "keys-stadis",
      hr: "studije-slucaja",
      sr: "studije-slucaja",
      bs: "studije-slucaja",
      cnr: "studije-slucaja",
      sq: "studime-rasti",
      mk: "studii-na-slucaj",
      lt: "atveju-analizes",
      da: "case-studies",
      sv: "fallstudier",
      no: "casestudier",
      fi: "tapaustutkimukset",
      uk: "kejsy",
      ru: "kejsy",
      tr: "vaka-calismalari",
      he: "mikre-bochan",
      ar: "dirasat-hala",
      ka: "keys-stadiebi",
      hy: "depqeri-usumnasirutyun",
      az: "keys-stadiler",
      zh: "anli",
      ja: "jirei",
    },
    "case-studies",
  ),
  "digital-design": mapAll(
    {
      nl: "digital-design",
      en: "digital-design",
      fr: "design-numerique",
      de: "digitales-design",
      es: "diseno-digital",
      pt: "design-digital",
      it: "design-digitale",
      el: "psifiako-design",
      pl: "design-cyfrowy",
      cs: "digitalni-design",
      sk: "digitalny-dizajn",
      hu: "digitalis-tervezes",
      ro: "design-digital",
      bg: "digitalen-dizajn",
      hr: "digitalni-dizajn",
      sr: "digitalni-dizajn",
      bs: "digitalni-dizajn",
      cnr: "digitalni-dizajn",
      sq: "dizajn-dixhital",
      mk: "digitalen-dizajn",
      lt: "skaitmeninis-dizainas",
      da: "digital-design",
      sv: "digital-design",
      no: "digital-design",
      fi: "digitaalinen-suunnittelu",
      uk: "cyfrovyj-dyzajn",
      ru: "cifrovoj-dizajn",
      tr: "dijital-tasarim",
      he: "itzuv-digitali",
      ar: "tasmim-raqami",
      ka: "cipruli-dizaini",
      hy: "tvayin-dizayn",
      az: "reqemsal-dizayn",
      zh: "shuzi-sheji",
      ja: "dejitaru-dezain",
    },
    "digital-design",
  ),
  portfolio: mapAll(
    {
      nl: "portfolio",
      en: "portfolio",
      fr: "portfolio",
      de: "portfolio",
      es: "portfolio",
      pt: "portfolio",
      it: "portfolio",
      el: "portfolio",
      pl: "portfolio",
      cs: "portfolio",
      sk: "portfolio",
      hu: "portfolio",
      ro: "portofoliu",
      bg: "portfolio",
      hr: "portfolio",
      sr: "portfolio",
      bs: "portfolio",
      cnr: "portfolio",
      sq: "portfolio",
      mk: "portfolio",
      lt: "portfolio",
      da: "portfolio",
      sv: "portfolio",
      no: "portfolio",
      fi: "portfolio",
      uk: "portfolio",
      ru: "portfolio",
      tr: "portfoy",
      he: "portfolio",
      ar: "portfolio",
      ka: "portfolio",
      hy: "portfolio",
      az: "portfolio",
      zh: "zuopinji",
      ja: "portfolio",
    },
    "portfolio",
  ),
  shop: mapAll(
    {
      nl: "shop",
      en: "shop",
      fr: "boutique",
      de: "shop",
      es: "tienda",
      pt: "loja",
      it: "negozio",
      el: "katastima",
      pl: "sklep",
      cs: "obchod",
      sk: "obchod",
      hu: "bolt",
      ro: "magazin",
      bg: "magazin",
      hr: "trgovina",
      sr: "prodavnica",
      bs: "prodavnica",
      cnr: "prodavnica",
      sq: "dyqan",
      mk: "prodavnica",
      lt: "parduotuve",
      da: "shop",
      sv: "butik",
      no: "butikk",
      fi: "kauppa",
      uk: "kraynya",
      ru: "magazin",
      tr: "magaza",
      he: "chanut",
      ar: "matjar",
      ka: "magazia",
      hy: "khanut",
      az: "magaza",
      zh: "shangdian",
      ja: "shoppu",
    },
    "shop",
  ),
  cart: mapAll(
    {
      nl: "cart",
      en: "cart",
      fr: "panier",
      de: "warenkorb",
      es: "carrito",
      pt: "carrinho",
      it: "carrello",
      el: "kalathi",
      pl: "koszyk",
      cs: "kosik",
      sk: "kosik",
      hu: "kosar",
      ro: "cos",
      bg: "kolichka",
      hr: "kosarica",
      sr: "korpa",
      bs: "korpa",
      cnr: "korpa",
      sq: "shporte",
      mk: "koshnichka",
      lt: "krepselis",
      da: "kurv",
      sv: "varukorg",
      no: "handlekurv",
      fi: "ostoskori",
      uk: "koshyk",
      ru: "korzina",
      tr: "sepet",
      he: "agala",
      ar: "sala",
      ka: "koshiki",
      hy: "zambyugh",
      az: "sebet",
      zh: "gouwuche",
      ja: "kart",
    },
    "cart",
  ),
  checkout: mapAll(
    {
      nl: "checkout",
      en: "checkout",
      fr: "paiement",
      de: "kasse",
      es: "pago",
      pt: "checkout",
      it: "checkout",
      el: "oloklirosi",
      pl: "kasa",
      cs: "pokladna",
      sk: "pokladna",
      hu: "penztar",
      ro: "finalizare",
      bg: "plashtane",
      hr: "blagajna",
      sr: "kasa",
      bs: "kasa",
      cnr: "kasa",
      sq: "pagesa",
      mk: "plakanje",
      lt: "apmokejimas",
      da: "kasse",
      sv: "kassa",
      no: "kasse",
      fi: "kassa",
      uk: "oformlennya",
      ru: "oformlenie",
      tr: "odeme",
      he: "tashlum",
      ar: "daf",
      ka: "gadaxda",
      hy: "vcharum",
      az: "odeme",
      zh: "jiesuan",
      ja: "checkout",
    },
    "checkout",
  ),
  success: mapAll(
    {
      nl: "success",
      en: "success",
      fr: "succes",
      de: "erfolg",
      es: "exito",
      pt: "sucesso",
      it: "successo",
      el: "epitichia",
      pl: "sukces",
      cs: "uspech",
      sk: "uspech",
      hu: "sikeres",
      ro: "succes",
      bg: "uspeh",
      hr: "uspjeh",
      sr: "uspeh",
      bs: "uspjeh",
      cnr: "uspjeh",
      sq: "sukses",
      mk: "uspeh",
      lt: "sekme",
      da: "succes",
      sv: "success",
      no: "suksess",
      fi: "onnistui",
      uk: "uspikh",
      ru: "uspeh",
      tr: "basarili",
      he: "hatzlacha",
      ar: "najah",
      ka: "warmateba",
      hy: "hajoghutyun",
      az: "ugurlu",
      zh: "chenggong",
      ja: "seiko",
    },
    "success",
  ),
  contact: mapAll({ nl: "contact", en: "contact" }, "contact"),
  faq: mapAll({ nl: "faq", en: "faq" }, "faq"),
  privacy: mapAll(
    {
      nl: "privacy",
      en: "privacy",
      fr: "confidentialite",
      de: "datenschutz",
      es: "privacidad",
      pt: "privacidade",
      it: "privacy",
      el: "aporrito",
      pl: "prywatnosc",
      cs: "soukromi",
      sk: "sukromie",
      hu: "adatvedelem",
      ro: "confidentialitate",
      bg: "poveritelnost",
      hr: "privatnost",
      sr: "privatnost",
      bs: "privatnost",
      cnr: "privatnost",
      sq: "privatesia",
      mk: "privatnost",
      lt: "privatumas",
      da: "privatliv",
      sv: "integritet",
      no: "personvern",
      fi: "tietosuoja",
      uk: "konfidencijnist",
      ru: "konfidencialnost",
      tr: "gizlilik",
      he: "pratiyut",
      ar: "khususia",
      ka: "konfidencialuroba",
      hy: "gaghtniutyun",
      az: "mexfilik",
      zh: "yinsi",
      ja: "privacy",
    },
    "privacy",
  ),
  cookies: mapAll(
    {
      nl: "cookies",
      en: "cookies",
      fr: "cookies",
      de: "cookies",
      es: "cookies",
      pt: "cookies",
      it: "cookie",
      el: "cookies",
      pl: "cookies",
      cs: "cookies",
      sk: "cookies",
      hu: "sutik",
      ro: "cookie-uri",
      bg: "biskvitki",
      hr: "kolacici",
      sr: "kolacici",
      bs: "kolacici",
      cnr: "kolacici",
      sq: "cookies",
      mk: "kolacinja",
      lt: "slapukai",
      da: "cookies",
      sv: "cookies",
      no: "informasjonskapsler",
      fi: "evasteet",
      uk: "files-cookie",
      ru: "fajly-cookie",
      tr: "cerezler",
      he: "cookies",
      ar: "kukiz",
      ka: "cookies",
      hy: "cookie-ner",
      az: "kukiler",
      zh: "cookie",
      ja: "cookie",
    },
    "cookies",
  ),
} as const;

export type SegmentKey = keyof typeof SEGMENT_I18N;

/** Hash anchors (no #). Internal key → localized id. */
export const HASH_I18N = {
  prijzen: mapAll(
    {
      nl: "prijzen",
      en: "prices",
      fr: "tarifs",
      de: "preise",
      es: "precios",
      pt: "precos",
      it: "prezzi",
      el: "times",
      pl: "ceny",
      cs: "ceny",
      sk: "ceny",
      hu: "arak",
      ro: "preturi",
      bg: "ceni",
      hr: "cijene",
      sr: "cene",
      bs: "cijene",
      cnr: "cijene",
      sq: "cmimet",
      mk: "ceni",
      lt: "kainos",
      da: "priser",
      sv: "priser",
      no: "priser",
      fi: "hinnat",
      uk: "ciny",
      ru: "ceny",
      tr: "fiyatlar",
      he: "mehirim",
      ar: "as-ar",
      ka: "pasebi",
      hy: "giner",
      az: "qiymetler",
      zh: "jiage",
      ja: "kakaku",
    },
    "prices",
  ),
  "meest-populair": mapAll(
    {
      nl: "meest-populair",
      en: "most-popular",
      fr: "les-plus-populaires",
      de: "beliebteste",
      es: "mas-populares",
      pt: "mais-populares",
      it: "piu-popolari",
      el: "dimofilestera",
      pl: "najpopularniejsze",
      cs: "nejoblibenejsi",
      sk: "najoblubenejsie",
      hu: "legnepszerubb",
      ro: "cele-mai-populare",
      bg: "naj-popularni",
      hr: "najpopularnije",
      sr: "najpopularnije",
      bs: "najpopularnije",
      cnr: "najpopularnije",
      sq: "me-te-popullarizuara",
      mk: "najpopularni",
      lt: "populiariausi",
      da: "mest-populaere",
      sv: "mest-popularta",
      no: "mest-populaere",
      fi: "suosituimmat",
      uk: "najpopuljarnishi",
      ru: "samye-populjarnye",
      tr: "en-populer",
      he: "hachi-popularim",
      ar: "al-akthar-shaban",
      ka: "yvelaze-popularuli",
      hy: "amenahaytni",
      az: "en-populyar",
      zh: "zui-shou-huanying",
      ja: "ninki",
    },
    "most-popular",
  ),
} as const;

export type HashKey = keyof typeof HASH_I18N;

function localePathTemplate(internal: string, locale: string): string {
  const parts = internal.split("/").filter(Boolean);
  const localized = parts.map((part) => {
    if (part.startsWith("[") && part.endsWith("]")) return part;
    const key = part as SegmentKey;
    if (key in SEGMENT_I18N) {
      return SEGMENT_I18N[key][locale] || part;
    }
    return part;
  });
  return `/${localized.join("/")}`;
}

/** Internal pathnames accepted by the App Router. */
export const INTERNAL_PATHNAMES = [
  "/",
  "/diensten",
  "/diensten/categorie/[group]",
  "/diensten/[slug]",
  "/kennisbank",
  "/kennisbank/[category]",
  "/kennisbank/[category]/[slug]",
  "/nieuws",
  "/nieuws/[slug]",
  "/over-ons",
  "/afspraak",
  "/locaties",
  "/locaties/[city]",
  "/voorwaarden",
  "/ai-scan",
  "/case-studies",
  "/digital-design",
  "/portfolio",
  "/portfolio/[slug]",
  "/shop",
  "/shop/[slug]",
  "/shop/cart",
  "/shop/checkout",
  "/shop/success",
  "/contact",
  "/faq",
  "/privacy",
  "/cookies",
] as const;

export type InternalPathname = (typeof INTERNAL_PATHNAMES)[number];

/** next-intl `pathnames` config: internal → per-locale external. */
export function buildPathnamesConfig(): Record<
  string,
  string | Record<string, string>
> {
  const config: Record<string, string | Record<string, string>> = {
    "/": "/",
  };

  for (const internal of INTERNAL_PATHNAMES) {
    if (internal === "/") continue;
    const perLocale: Record<string, string> = {};
    let allSame = true;
    for (const locale of LOCALES) {
      const localized = localePathTemplate(internal, locale);
      perLocale[locale] = localized;
      if (localized !== internal) allSame = false;
    }
    config[internal] = allSame ? internal : perLocale;
  }

  return config;
}

export function segmentFor(locale: string, key: SegmentKey): string {
  return SEGMENT_I18N[key][locale] || SEGMENT_I18N[key].en || String(key);
}

export function hashFor(locale: string, key: HashKey): string {
  return HASH_I18N[key][locale] || HASH_I18N[key].en || String(key);
}

/** Resolve any localized hash back to the stable element id (Dutch key). */
export function resolveHashElementId(hash: string): string {
  const clean = hash.replace(/^#/, "").trim();
  if (!clean) return "";
  for (const [key, map] of Object.entries(HASH_I18N)) {
    if (key === clean) return key;
    for (const value of Object.values(map)) {
      if (value === clean) return key;
    }
  }
  return clean;
}

function localizeHashFragment(locale: string, hash: string): string {
  const key = resolveHashElementId(hash) as HashKey;
  if (key in HASH_I18N) return hashFor(locale, key);
  return hash;
}

/**
 * Localize an internal public path (no locale prefix) for a locale.
 * Accepts `/diensten/foo`, `/kennisbank`, `/?x=1`, `#prijzen`, `/#prijzen`.
 */
export function localizePath(locale: string, path: string): string {
  if (!path || path === "/") return "/";

  let hash = "";
  let search = "";
  let bare = path;

  const hashIdx = bare.indexOf("#");
  if (hashIdx !== -1) {
    hash = bare.slice(hashIdx + 1);
    bare = bare.slice(0, hashIdx) || "/";
  }
  const qIdx = bare.indexOf("?");
  if (qIdx !== -1) {
    search = bare.slice(qIdx);
    bare = bare.slice(0, qIdx) || "/";
  }

  let out = "/";
  if (bare && bare !== "/") {
    if (!bare.startsWith("/")) bare = `/${bare}`;
    bare = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
    const parts = bare.split("/").filter(Boolean);
    const reverse = reverseSegmentMap(locale);
    const firstInternal = reverse[parts[0]] || parts[0];

    // Remap dynamic entity segments using canonical → public maps.
    remapEntityPartsOutbound(locale, firstInternal, parts);

    const localizedParts = parts.map((part, index) => {
      if (index === 0 && part in SEGMENT_I18N) {
        return segmentFor(locale, part as SegmentKey);
      }
      if (index === 0 && firstInternal in SEGMENT_I18N) {
        return segmentFor(locale, firstInternal as SegmentKey);
      }
      if (
        index === 1 &&
        (firstInternal === "shop" || firstInternal === "diensten") &&
        part in SEGMENT_I18N
      ) {
        return segmentFor(locale, part as SegmentKey);
      }
      return part;
    });
    // Ensure first segment uses localized form of internal key
    if (firstInternal in SEGMENT_I18N) {
      localizedParts[0] = segmentFor(locale, firstInternal as SegmentKey);
    }
    out = `/${localizedParts.join("/")}`;
  }

  if (search) out += search.startsWith("?") ? search : `?${search}`;
  if (hash) out += `#${localizeHashFragment(locale, hash)}`;
  return out;
}

/**
 * Full public href including locale prefix.
 * `internalPath` is the App Router path without locale (`/diensten`, `/nieuws/x`, `#prijzen`).
 */
export function localizedHref(locale: string, internalPath = "/"): string {
  if (internalPath.startsWith("#")) {
    return `/${locale}#${localizeHashFragment(locale, internalPath.slice(1))}`;
  }
  const localized = localizePath(locale, internalPath);
  if (localized === "/") return `/${locale}`;
  // `/#prices` → `/en#prices` (not `/en/#prices`)
  if (localized.startsWith("/#")) return `/${locale}${localized.slice(1)}`;
  if (localized.startsWith("/?")) return `/${locale}${localized}`;
  return `/${locale}${localized}`;
}

/** Convert a locale-prefixed public URL path → internal path (no locale). */
export function toInternalPath(locale: string, pathWithoutLocale: string): string {
  let bare = pathWithoutLocale.split("?")[0].split("#")[0] || "/";
  if (!bare.startsWith("/")) bare = `/${bare}`;
  if (bare.length > 1 && bare.endsWith("/")) bare = bare.slice(0, -1);
  if (bare === "/") return "/";

  const parts = bare.split("/").filter(Boolean).map((part) => {
    // Mirror page-param decoding: script-locale segments may still be %XX-encoded.
    try {
      return /%[0-9A-Fa-f]{2}/.test(part)
        ? decodeURIComponent(part).normalize("NFC")
        : part.normalize("NFC");
    } catch {
      return part;
    }
  });
  if (!parts.length) return "/";

  const reverse = reverseSegmentMap(locale);
  const firstInternal = reverse[parts[0]] || parts[0];
  parts[0] = firstInternal;

  if (
    parts[1] &&
    firstInternal === "shop" &&
    (parts[1] === segmentFor(locale, "cart") ||
      parts[1] === segmentFor(locale, "checkout") ||
      parts[1] === segmentFor(locale, "success") ||
      parts[1] in SEGMENT_I18N)
  ) {
    parts[1] = reverse[parts[1]] || parts[1];
  } else {
    remapEntityPartsInbound(locale, firstInternal, parts);
  }

  return `/${parts.join("/")}`;
}

function remapEntityPartsOutbound(
  locale: string,
  firstInternal: string,
  parts: string[],
) {
  if (firstInternal === "diensten" && parts[1]) {
    if (parts[1] === "categorie" || parts[1] === segmentFor(locale, "categorie")) {
      parts[1] = "categorie";
    } else {
      parts[1] = publicEntitySlug(locale, "service", parts[1]);
    }
  } else if (firstInternal === "kennisbank") {
    if (parts[1]) parts[1] = publicEntitySlug(locale, "kb_category", parts[1]);
    if (parts[2]) parts[2] = publicEntitySlug(locale, "kb_article", parts[2]);
  } else if (firstInternal === "locaties" && parts[1]) {
    parts[1] = publicEntitySlug(locale, "city", parts[1]);
  } else if (firstInternal === "portfolio" && parts[1]) {
    parts[1] = publicEntitySlug(locale, "portfolio", parts[1]);
  } else if (
    firstInternal === "shop" &&
    parts[1] &&
    !(parts[1] in SEGMENT_I18N) &&
    parts[1] !== "cart" &&
    parts[1] !== "checkout" &&
    parts[1] !== "success"
  ) {
    parts[1] = publicEntitySlug(locale, "shop", parts[1]);
  }
}

function remapEntityPartsInbound(
  locale: string,
  firstInternal: string,
  parts: string[],
) {
  if (firstInternal === "diensten" && parts[1]) {
    if (parts[1] === "categorie" || parts[1] === segmentFor(locale, "categorie")) {
      parts[1] = "categorie";
    } else {
      parts[1] = canonicalEntityKey(locale, "service", parts[1]);
    }
  } else if (firstInternal === "kennisbank") {
    if (parts[1]) parts[1] = canonicalEntityKey(locale, "kb_category", parts[1]);
    if (parts[2]) parts[2] = canonicalEntityKey(locale, "kb_article", parts[2]);
  } else if (firstInternal === "locaties" && parts[1]) {
    parts[1] = canonicalEntityKey(locale, "city", parts[1]);
  } else if (firstInternal === "portfolio" && parts[1]) {
    parts[1] = canonicalEntityKey(locale, "portfolio", parts[1]);
  } else if (
    firstInternal === "shop" &&
    parts[1] &&
    !(parts[1] in SEGMENT_I18N)
  ) {
    parts[1] = canonicalEntityKey(locale, "shop", parts[1]);
  }
}

/** Detect entity type for a canonical internal path (no locale). */
export function entityTypeForInternalPath(
  internalPath: string,
): { type: EntityType; key: string } | null {
  const parts = internalPath.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (parts[0] === "diensten" && parts[1] && parts[1] !== "categorie") {
    return { type: "service", key: parts[1] };
  }
  if (parts[0] === "kennisbank" && parts[2]) return { type: "kb_article", key: parts[2] };
  if (parts[0] === "kennisbank" && parts[1]) return { type: "kb_category", key: parts[1] };
  if (parts[0] === "locaties" && parts[1]) return { type: "city", key: parts[1] };
  if (parts[0] === "portfolio" && parts[1]) return { type: "portfolio", key: parts[1] };
  if (
    parts[0] === "shop" &&
    parts[1] &&
    !["cart", "checkout", "success"].includes(parts[1])
  ) {
    return { type: "shop", key: parts[1] };
  }
  return null;
}

const reverseCache = new Map<string, Record<string, string>>();

function reverseSegmentMap(locale: string): Record<string, string> {
  const cached = reverseCache.get(locale);
  if (cached) return cached;
  const map: Record<string, string> = {};
  for (const [internal, locales] of Object.entries(SEGMENT_I18N)) {
    const localized = locales[locale] || locales.en || internal;
    map[localized] = internal;
    map[internal] = internal;
  }
  reverseCache.set(locale, map);
  return map;
}

/**
 * Switch locale while remapping localized segments + hash.
 * `pathname` may be `/en/services/...` (with locale).
 */
export function switchLocalizedPath(
  pathname: string,
  nextLocale: string,
  hash = "",
): string {
  const parts = pathname.split("/");
  const currentLocale = parts[1] || "nl";
  const rest = "/" + parts.slice(2).join("/");
  const internal = toInternalPath(currentLocale, rest === "/" ? "/" : rest.replace(/\/$/, "") || "/");
  const hashPart = hash
    ? hash.replace(/^#/, "")
    : pathname.includes("#")
      ? pathname.split("#")[1]
      : "";
  const base = localizedHref(nextLocale, internal);
  if (!hashPart) return base;
  const internalHash = resolveHashElementId(hashPart);
  return `${base}#${hashFor(nextLocale, internalHash as HashKey)}`;
}
