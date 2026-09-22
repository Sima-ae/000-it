"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Agent000Avatar } from "@/components/agent-000/Agent000Avatar";
import { OPEN_CHAT_EVENT } from "@/components/content/FaqPageClient";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { localizedHref } from "@/i18n/pathnames";

/**
 * Full-bleed homepage hero — Hostnet-style layout with TripleZero gradient
 * (#5e3b88 → #007c8d) and Agent 000 as the visual anchor.
 */
export function HomeHeroBanner() {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(90deg, #5e3b88 0%, #007c8d 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 80% at 85% 50%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(0,0,0,0.12), transparent 50%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:gap-10 md:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="max-w-xl text-white">
          <h1 className="font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/90 md:text-xl">
            {t("subtitle")}
          </p>

          <ul className="mt-6 space-y-2">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-sm leading-snug text-white/95 sm:text-[0.95rem] md:text-base md:whitespace-nowrap"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full border-0 bg-white px-8 text-base font-semibold text-brand hover:bg-white/90"
            >
              <SoftLink href={localizedHref(locale, "/diensten")}>{t("ctaServices")}</SoftLink>
            </Button>
            <Button
              asChild
              size="lg"
              className="rounded-full border-0 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <SoftLink href={localizedHref(locale, "/afspraak")}>{tNav("book")}</SoftLink>
            </Button>
          </div>
        </div>

        <div className="relative flex min-h-70 items-end justify-center lg:min-h-90 lg:justify-end">
          <div
            className="pointer-events-none absolute bottom-8 right-1/2 h-40 w-40 translate-x-1/2 rounded-full bg-white/20 blur-3xl lg:right-24 lg:translate-x-0"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent(OPEN_CHAT_EVENT, { detail: { prefill: "" } }),
              );
            }}
            className="relative z-1 cursor-pointer rounded-full outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.98]"
            aria-label={t("openChatWithAgent")}
          >
            <Agent000Avatar
              state="idle"
              size="lg"
              className="h-56 w-56 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] md:h-72 md:w-72 lg:h-80 lg:w-80"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
