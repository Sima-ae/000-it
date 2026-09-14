import { defineRouting } from "next-intl/routing";
import { enabledLanguages } from "./languages";
import { buildPathnamesConfig } from "./pathnames";

/** Active app locales — keep in sync with `enabledLanguages()` in languages.ts. */
const locales = enabledLanguages().map((lang) => lang.code) as [string, ...string[]];

export const routing = defineRouting({
  locales,
  defaultLocale: "nl",
  localePrefix: "always",
  pathnames: buildPathnamesConfig(),
});

export type AppLocale = (typeof routing.locales)[number];
