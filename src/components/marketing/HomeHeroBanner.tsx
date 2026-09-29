"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Agent000Avatar } from "@/components/agent-000/Agent000Avatar";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { HeroCircuitPulse } from "@/components/marketing/HeroCircuitPulse";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { OPEN_CHAT_EVENT } from "@/components/chat/open-live-chat";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { localizedHref } from "@/i18n/pathnames";
import { isRtlLocale } from "@/i18n/languages";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Full-bleed homepage hero — photo base with a brand gradient overlay
 * and Agent 000 as the visual anchor.
 */
export function HomeHeroBanner({ scanCount }: { scanCount: number }) {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const rtl = isRtlLocale(locale);

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease },
        };

  return (
    <section className="relative -mt-(--nav-offset) w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.06, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease }}
      >
        <Image
          src="/branding/tech-back.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-scale-x-100 object-cover object-center"
          aria-hidden
        />
      </motion.div>
      <div className="hero-brand-gradient pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 80% at 85% 50%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(0,0,0,0.22), transparent 50%)",
        }}
      />

      <HeroCircuitPulse />

      {/* Content clears the fixed header; bg stays full-bleed underneath */}
      <div className="relative z-2 mx-auto w-full max-w-6xl px-4 pt-[calc(var(--nav-offset)+1.25rem)] pb-10 sm:pt-[calc(var(--nav-offset)+1.5rem)] sm:pb-12 md:px-6 lg:pt-[calc(var(--nav-offset)+1.75rem)] lg:pb-14">
        <div className="mx-auto flex w-fit max-w-full flex-col items-center gap-6 sm:gap-7 lg:flex-row lg:items-center lg:gap-8 xl:gap-10">
        {/* Copy + CTAs */}
        <div className="mx-auto flex w-full max-w-xl shrink-0 flex-col items-center gap-3 text-center text-white sm:gap-3.5 lg:mx-0 lg:max-w-md lg:items-start lg:text-start xl:max-w-120">
          <motion.h1
            className="font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.6rem] lg:text-[2.75rem]"
            {...item(0.05)}
          >
            <span className="block">{t("introTitleLine1")}</span>
            {t("introTitleLine2") ? (
              <span className="block">{t("introTitleLine2")}</span>
            ) : null}
          </motion.h1>

          <motion.p
            className="max-w-md text-[0.9375rem] leading-relaxed text-white/90 sm:text-base lg:max-w-none"
            {...item(0.12)}
          >
            {t("introSubtitle")}
          </motion.p>

          <motion.div className="flex w-full flex-col items-center gap-2.5 sm:gap-3 lg:items-start" {...item(0.22)}>
            <p className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
              {t("ctaHeroTitle")}
            </p>

            <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <Button
                asChild
                size="default"
                className="h-11 rounded-2xl border-0 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:h-10"
              >
                <SoftLink href={localizedHref(locale, "/ai-scan")}>{t("ctaScan")}</SoftLink>
              </Button>
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:justify-start sm:py-2">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-white" aria-hidden />
                <span className="font-display text-sm font-bold tracking-tight text-white">
                  <AnimatedCounter value={scanCount} />
                </span>
                <span className="text-start text-xs leading-snug text-white/80">{t("scansLabel")}</span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Button
                asChild
                size="default"
                className="h-11 rounded-full border-0 bg-white px-6 text-sm font-semibold text-brand hover:bg-white/90 sm:h-10 sm:px-5"
              >
                <SoftLink href={localizedHref(locale, "/diensten")}>{t("ctaServices")}</SoftLink>
              </Button>
              <Button
                asChild
                size="default"
                className="h-11 rounded-full border-0 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:h-10 sm:px-5"
              >
                <SoftLink href={localizedHref(locale, "/afspraak")}>{tNav("book")}</SoftLink>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* AI-klaar card + Agent 000 */}
        <div className="relative mx-auto flex w-full max-w-lg shrink-0 items-end justify-center lg:mx-0 lg:w-auto lg:max-w-none lg:justify-end lg:-me-10 xl:-me-14">
          <div
            className="pointer-events-none absolute bottom-6 inset-e-[20%] h-32 w-32 rounded-full bg-white/20 blur-3xl sm:h-40 sm:w-40"
            aria-hidden
          />

          <div className="relative z-10 flex w-full items-end justify-center gap-0 ps-2 pe-1 sm:ps-4 sm:pe-2 lg:w-auto lg:justify-end lg:ps-0 lg:pe-0">
            <motion.div
              className="relative z-20 mb-7 w-[72%] max-w-92 shrink-0 sm:mb-9 sm:w-92 lg:mb-12 lg:-me-16"
              initial={reduce ? false : { opacity: 0, x: rtl ? 14 : -14, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.65, delay: 0.18, ease }}
            >
              <HeroVisual variant="onDark" />
            </motion.div>

            <motion.button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent(OPEN_CHAT_EVENT, { detail: { prefill: "" } }),
                );
              }}
              className="relative z-30 -ms-6 mb-0 shrink-0 cursor-pointer rounded-full outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.98] sm:-ms-5 lg:-ms-4"
              aria-label={t("openChatWithAgent")}
              initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
              animate={
                reduce
                  ? { y: 16 }
                  : {
                      opacity: 1,
                      y: [16, 8, 16],
                      scale: 1,
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      opacity: { duration: 0.7, delay: 0.2, ease },
                      scale: { duration: 0.7, delay: 0.2, ease },
                      y: {
                        duration: 4.5,
                        delay: 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              <Agent000Avatar
                state="idle"
                size="lg"
                className="h-44 w-44 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 xl:h-80 xl:w-80"
              />
            </motion.button>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
