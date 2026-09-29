/**
 * Site language registry.
 *
 * Only enabled languages appear in the switcher and must also exist in
 * `messages/{code}.json`. Routing locales are derived from `enabledLanguages()`.
 */
export type SiteLanguage = {
  /** Locale code used in URLs (`/nl/...`, `/en/...`). */
  code: string;
  /** Native language name (tooltips / a11y). */
  nativeName: string;
  /** Flag file in `/public/uploads/flags/{flag}.svg`. */
  flag: string;
  /** When false, hidden from the switcher until translations are ready. */
  enabled: boolean;
};

/** 42 languages matching the language-switcher flag set. */
export const siteLanguages: SiteLanguage[] = [
  { code: "nl", nativeName: "Nederlands", flag: "nl", enabled: true },
  { code: "en", nativeName: "English", flag: "en", enabled: true },
  { code: "fr", nativeName: "Français", flag: "fr", enabled: true },
  { code: "de", nativeName: "Deutsch", flag: "de", enabled: true },
  { code: "es", nativeName: "Español", flag: "es", enabled: true },
  { code: "pt", nativeName: "Português", flag: "pt", enabled: true },
  { code: "it", nativeName: "Italiano", flag: "it", enabled: true },
  { code: "el", nativeName: "Ελληνικά", flag: "gr", enabled: true },
  { code: "pl", nativeName: "Polski", flag: "pl", enabled: true },
  { code: "cs", nativeName: "Čeština", flag: "cz", enabled: true },
  { code: "sk", nativeName: "Slovenčina", flag: "sk", enabled: true },
  { code: "hu", nativeName: "Magyar", flag: "hu", enabled: true },
  { code: "ro", nativeName: "Română", flag: "ro", enabled: true },
  { code: "bg", nativeName: "Български", flag: "bg", enabled: true },
  { code: "hr", nativeName: "Hrvatski", flag: "hr", enabled: true },
  { code: "sr", nativeName: "Српски", flag: "rs", enabled: true },
  { code: "bs", nativeName: "Bosanski", flag: "ba", enabled: true },
  { code: "cnr", nativeName: "Crnogorski", flag: "me", enabled: true },
  { code: "sq", nativeName: "Shqip", flag: "sq", enabled: true },
  { code: "mk", nativeName: "Македонски", flag: "mk", enabled: true },
  { code: "lt", nativeName: "Lietuvių", flag: "lt", enabled: true },
  { code: "da", nativeName: "Dansk", flag: "dk", enabled: true },
  { code: "sv", nativeName: "Svenska", flag: "se", enabled: true },
  { code: "no", nativeName: "Norsk bokmål", flag: "no", enabled: true },
  { code: "fi", nativeName: "Suomi", flag: "fi", enabled: true },
  { code: "uk", nativeName: "Українська", flag: "ua", enabled: true },
  { code: "ru", nativeName: "Русский", flag: "ru", enabled: true },
  { code: "tr", nativeName: "Türkçe", flag: "tr", enabled: true },
  { code: "he", nativeName: "עברית", flag: "he", enabled: true },
  { code: "ar", nativeName: "العربية", flag: "sa", enabled: true },
  { code: "ka", nativeName: "ქართული", flag: "ka", enabled: true },
  { code: "hy", nativeName: "Հայերեն", flag: "hy", enabled: true },
  { code: "az", nativeName: "Azərbaycan", flag: "az", enabled: true },
  { code: "zh", nativeName: "中文", flag: "cn", enabled: true },
  { code: "ja", nativeName: "日本語", flag: "jp", enabled: true },
  { code: "bn", nativeName: "বাংলা", flag: "bd", enabled: true },
  { code: "hi", nativeName: "हिन्दी", flag: "in", enabled: true },
  { code: "mr", nativeName: "मराठी", flag: "in", enabled: true },
  { code: "ps", nativeName: "پښتو", flag: "in", enabled: true },
  { code: "pa", nativeName: "ਪੰਜਾਬੀ", flag: "in", enabled: true },
  { code: "te", nativeName: "తెలుగు", flag: "in", enabled: true },
  { code: "ur", nativeName: "اردو", flag: "pk", enabled: true },
];

/**
 * Languages that share the India flag. The switcher shows one India flag
 * and a menu to pick among these.
 */
export const INDIA_LANGUAGE_CODES = ["hi", "mr", "ps", "pa", "te"] as const;

const indiaLanguageCodeSet = new Set<string>(INDIA_LANGUAGE_CODES);

export function isIndiaLanguage(code: string): boolean {
  return indiaLanguageCodeSet.has(code);
}

export function indiaLanguages(): SiteLanguage[] {
  return INDIA_LANGUAGE_CODES.flatMap((code) => {
    const lang = siteLanguages.find((item) => item.code === code);
    return lang?.enabled ? [lang] : [];
  });
}

export function enabledLanguages(): SiteLanguage[] {
  return siteLanguages.filter((lang) => lang.enabled);
}

export function getLanguage(code: string): SiteLanguage | undefined {
  return siteLanguages.find((lang) => lang.code === code);
}

export function flagSrc(flag: string): string {
  return `/uploads/flags/${flag}.svg`;
}

/** Locales that use right-to-left script (html `dir="rtl"`). */
export const RTL_LOCALES = new Set(["ar", "he", "ps", "ur"]);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

export function localeTextDir(locale: string): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

/** Swap the locale segment in a pathname (`/nl/contact` → `/en/contact`). */
export function switchLocalePath(pathname: string, nextLocale: string): string {
  const parts = pathname.split("/");
  if (parts.length >= 2 && parts[1]) {
    parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }
  return `/${nextLocale}`;
}
