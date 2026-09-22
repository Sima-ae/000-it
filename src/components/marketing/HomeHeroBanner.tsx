"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Agent000Avatar } from "@/components/agent-000/Agent000Avatar";
import { OPEN_CHAT_EVENT } from "@/components/content/FaqPageClient";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { localizedHref } from "@/i18n/pathnames";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Full-bleed homepage hero — photo base with TripleZero gradient overlay
 * (#5e3b88 → #007c8d) and Agent 000 as the visual anchor.
 */
export function HomeHeroBanner() {
  const t = useTranslations("hero");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const bullets = [t("bullet1"), t("bullet2"), t("bullet3")];

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease },
        };

  return (
    <section className="relative w-full overflow-hidden">
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
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(50, 28, 78, 0.88) 0%, rgba(0, 78, 92, 0.88) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 80% at 85% 50%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(ellipse 50% 60% at 10% 80%, rgba(0,0,0,0.22), transparent 50%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 md:gap-8 md:px-6 md:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2.5 text-center text-white md:gap-3 lg:mx-0 lg:items-start lg:text-left">
          <motion.h1
            className="font-display text-3xl font-semibold leading-[1.06] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]"
            {...item(0.05)}
          >
            {t("title")}
          </motion.h1>
          <motion.p
            className="text-base leading-snug text-white/90 md:text-lg"
            {...item(0.14)}
          >
            {t("subtitle")}
          </motion.p>

          <ul className="w-full space-y-1">
            {bullets.map((bullet, i) => (
              <motion.li
                key={bullet}
                className="flex items-center justify-center gap-2 text-sm leading-tight text-white/95 sm:text-[0.9375rem] md:text-[0.975rem] md:whitespace-nowrap lg:justify-start"
                {...item(0.22 + i * 0.07)}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden />
                </span>
                <span>{bullet}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="flex w-full max-w-md flex-nowrap items-center justify-center gap-2 pt-0.5 sm:gap-2.5 lg:max-w-none lg:justify-start"
            {...item(0.48)}
          >
            <Button
              asChild
              size="default"
              className="h-10 min-w-0 flex-1 rounded-full border-0 bg-white px-3 text-sm font-semibold text-brand hover:bg-white/90 sm:h-11 sm:flex-none sm:px-7 sm:text-base"
            >
              <SoftLink href={localizedHref(locale, "/diensten")}>{t("ctaServices")}</SoftLink>
            </Button>
            <Button
              asChild
              size="default"
              className="h-10 min-w-0 flex-1 rounded-full border-0 bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:h-11 sm:flex-none sm:px-7 sm:text-base"
            >
              <SoftLink href={localizedHref(locale, "/afspraak")}>{tNav("book")}</SoftLink>
            </Button>
          </motion.div>
        </div>

        <div className="relative flex min-h-56 items-end justify-center md:min-h-72 lg:min-h-80 lg:justify-end">
          <div
            className="pointer-events-none absolute bottom-8 right-1/2 h-40 w-40 translate-x-1/2 rounded-full bg-white/20 blur-3xl lg:right-24 lg:translate-x-0"
            aria-hidden
          />
          <motion.button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent(OPEN_CHAT_EVENT, { detail: { prefill: "" } }),
              );
            }}
            className="relative z-1 cursor-pointer rounded-full outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.98]"
            aria-label={t("openChatWithAgent")}
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={
              reduce
                ? undefined
                : {
                    opacity: 1,
                    y: [0, -8, 0],
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
              className="h-56 w-56 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] md:h-72 md:w-72 lg:h-80 lg:w-80"
            />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
