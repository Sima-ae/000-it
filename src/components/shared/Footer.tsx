"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 bg-background/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="text-lg font-semibold text-foreground">TripleZero iT</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link href={`/${locale}/diensten`} className="hover:text-foreground">
            {nav("services")}
          </Link>
          <Link href={`/${locale}/ai-scan`} className="hover:text-foreground">
            {nav("aiScan")}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-foreground">
            {nav("contact")}
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>info@000-it.com</p>
          <p className="mt-4">
            © {year} TripleZero iT. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
