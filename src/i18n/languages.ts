/**
 * Site language registry.
 *
 * Only `enabled: true` languages appear in the switcher and must also exist in
 * `src/i18n/routing.ts` + `messages/{code}.json`.
 * When adding a language: create messages, add locale to routing, then flip `enabled`.
 */
export type SiteLanguage = {
  /** Locale code used in URLs (`/nl/...`, `/en/...`). */
  code: string;
  /** Native language name shown in the switcher. */
  nativeName: string;
  /** Flag file in `/public/uploads/flags/{flag}.svg`. */
  flag: string;
  /** When false, hidden from the switcher until translations are ready. */
  enabled: boolean;
};

export const siteLanguages: SiteLanguage[] = [
  { code: "nl", nativeName: "Nederlands", flag: "nl", enabled: true },
  { code: "en", nativeName: "English", flag: "en", enabled: true },
  // Ready to enable one-by-one once message files + routing exist:
  { code: "de", nativeName: "Deutsch", flag: "de", enabled: false },
  { code: "fr", nativeName: "Français", flag: "fr", enabled: false },
  { code: "es", nativeName: "Español", flag: "es", enabled: false },
  { code: "it", nativeName: "Italiano", flag: "it", enabled: false },
  { code: "pt", nativeName: "Português", flag: "pt", enabled: false },
  { code: "pl", nativeName: "Polski", flag: "pl", enabled: false },
  { code: "tr", nativeName: "Türkçe", flag: "tr", enabled: false },
  { code: "ru", nativeName: "Русский", flag: "ru", enabled: false },
  { code: "uk", nativeName: "Українська", flag: "ua", enabled: false },
  { code: "ro", nativeName: "Română", flag: "ro", enabled: false },
  { code: "bg", nativeName: "Български", flag: "bg", enabled: false },
  { code: "cs", nativeName: "Čeština", flag: "cz", enabled: false },
  { code: "sk", nativeName: "Slovenčina", flag: "sk", enabled: false },
  { code: "sl", nativeName: "Slovenščina", flag: "si", enabled: false },
  { code: "hr", nativeName: "Hrvatski", flag: "hr", enabled: false },
  { code: "sr", nativeName: "Српски", flag: "rs", enabled: false },
  { code: "sq", nativeName: "Shqip", flag: "sq", enabled: false },
  { code: "hu", nativeName: "Magyar", flag: "hu", enabled: false },
  { code: "el", nativeName: "Ελληνικά", flag: "gr", enabled: false },
  { code: "fi", nativeName: "Suomi", flag: "fi", enabled: false },
  { code: "sv", nativeName: "Svenska", flag: "se", enabled: false },
  { code: "no", nativeName: "Norsk", flag: "no", enabled: false },
  { code: "da", nativeName: "Dansk", flag: "dk", enabled: false },
  { code: "lt", nativeName: "Lietuvių", flag: "lt", enabled: false },
  { code: "lv", nativeName: "Latviešu", flag: "lv", enabled: false },
  { code: "et", nativeName: "Eesti", flag: "ee", enabled: false },
  { code: "ar", nativeName: "العربية", flag: "sa", enabled: false },
  { code: "he", nativeName: "עברית", flag: "he", enabled: false },
  { code: "zh", nativeName: "中文", flag: "cn", enabled: false },
  { code: "ja", nativeName: "日本語", flag: "jp", enabled: false },
];

export function enabledLanguages(): SiteLanguage[] {
  return siteLanguages.filter((lang) => lang.enabled);
}

export function getLanguage(code: string): SiteLanguage | undefined {
  return siteLanguages.find((lang) => lang.code === code);
}

export function flagSrc(flag: string): string {
  return `/uploads/flags/${flag}.svg`;
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
