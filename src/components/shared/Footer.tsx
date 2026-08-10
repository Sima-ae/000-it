"use client";

import { useTranslations, useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="glass grid gap-8 rounded-4xl p-8 md:grid-cols-3 md:p-10">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              TripleZero iT
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <SoftLink href={`/${locale}/diensten`} className="transition hover:text-foreground">
              {nav("services")}
            </SoftLink>
            <SoftLink href={`/${locale}/portfolio`} className="transition hover:text-foreground">
              {nav("portfolio")}
            </SoftLink>
            <SoftLink href={`/${locale}/ai-scan`} className="transition hover:text-foreground">
              {nav("aiScan")}
            </SoftLink>
            <SoftLink href={`/${locale}/contact`} className="transition hover:text-foreground">
              {nav("contact")}
            </SoftLink>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">info@000-it.com</p>
            <p className="mt-6 text-xs leading-relaxed">
              © {year} TripleZero iT. {t("rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
