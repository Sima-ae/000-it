"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { Reveal } from "@/components/marketing/Reveal";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { localizedHref } from "@/i18n/pathnames";

export function HomeIntroSection({ scanCount }: { scanCount: number }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const visualY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [36, -36]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-24, 24]);
  const visualOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    reduce ? [1, 1, 1, 1] : [0.55, 1, 1, 0.7],
  );

  return (
    <section ref={ref} className="relative bg-transparent">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-4 pt-8 md:px-6 md:pb-6 md:pt-10 lg:grid-cols-2 lg:gap-10">
        <motion.div style={{ y: visualY, opacity: visualOpacity }} className="will-change-transform">
          <Reveal from="left" duration={0.65}>
            <HeroVisual />
          </Reveal>
        </motion.div>

        <motion.div style={{ y: textY }} className="will-change-transform">
          <Reveal from="right" delay={0.08} duration={0.65} className="ml-auto max-w-xl text-right">
            <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              {t("introTitle")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("introSubtitle")}
            </p>
            <div className="mt-8 space-y-3">
              <p className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                {t("ctaHeroTitle")}
              </p>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button asChild size="lg" className="rounded-2xl px-7">
                  <SoftLink href={localizedHref(locale, "/ai-scan")}>{t("ctaScan")}</SoftLink>
                </Button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 px-3 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-display text-base font-bold tracking-tight text-foreground">
                    <AnimatedCounter value={scanCount} />
                  </span>
                  <span className="text-xs text-muted-foreground">{t("scansLabel")}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
