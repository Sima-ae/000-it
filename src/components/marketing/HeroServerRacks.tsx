"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { serviceGroupHref } from "@/content/fixweb/catalog";
import { cn } from "@/lib/utils";

const ONLINE_GREEN = "#22c55e";

const RACKS = [
  {
    labelKey: "rackShared" as const,
    u: 6,
    delay: 0.05,
    blinkDelay: "0s",
    sectionId: "gedeelde-hosting",
  },
  {
    labelKey: "rackCloud" as const,
    u: 6,
    delay: 0.1,
    blinkDelay: "0.25s",
    sectionId: "cloud-hosting-pakketten",
  },
  {
    labelKey: "rackWordpress" as const,
    u: 6,
    delay: 0.15,
    blinkDelay: "0.5s",
    sectionId: "wordpress-hosting-pakketten",
  },
  {
    labelKey: "rackVps" as const,
    u: 6,
    delay: 0.2,
    blinkDelay: "0.75s",
    sectionId: "vps-hosting-pakketten",
  },
];

function Led({
  delay,
  reduce,
  size = "sm",
}: {
  delay: string;
  reduce: boolean | null;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "hero-rack-led shrink-0 rounded-full",
        size === "md" ? "h-1.5 w-1.5" : "h-1 w-1",
        reduce && "opacity-100",
      )}
      style={
        reduce
          ? {
              backgroundColor: ONLINE_GREEN,
              boxShadow: `0 0 8px ${ONLINE_GREEN}`,
            }
          : { animationDelay: delay }
      }
      aria-hidden
    />
  );
}

function Rack3D({
  units,
  blinkDelay,
  reduce,
}: {
  units: number;
  blinkDelay: string;
  reduce: boolean | null;
}) {
  return (
    <div className="hero-rack-3d relative mx-auto h-29 w-[4.6rem] sm:h-32 sm:w-20">
      <div
        className="pointer-events-none absolute -bottom-0.5 left-[8%] right-[2%] h-2.5 rounded-[100%] bg-black/30 blur-xs"
        aria-hidden
      />

      {/* Side panel */}
      <div
        className="absolute top-[6%] bottom-[4%] inset-e-0 w-3 rounded-e-md"
        style={{
          background: "linear-gradient(180deg, #1a5fad 0%, #0a2f6b 45%, #041428 100%)",
          transform: "translateX(70%) skewY(-12deg)",
          boxShadow: "2px 4px 10px rgba(4,20,40,0.35)",
        }}
        aria-hidden
      />

      {/* Top panel */}
      <div
        className="absolute inset-s-[4%] inset-e-[8%] top-0 h-2.5 rounded-t-md"
        style={{
          background: "linear-gradient(90deg, #5eb0ff 0%, #1e9bff 40%, #0a4f9c 100%)",
          transform: "translateY(-35%) skewX(-28deg)",
          boxShadow: "0 -1px 0 rgba(255,255,255,0.25) inset",
        }}
        aria-hidden
      />

      {/* Front chassis */}
      <div
        className="relative z-1 flex h-full flex-col rounded-md border border-[#7ec8ff]/40 p-1.5"
        style={{
          background:
            "linear-gradient(165deg, #0d5fb8 0%, #0a2f6b 42%, #061830 100%)",
          boxShadow:
            "0 14px 28px rgba(4,20,40,0.4), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -2px 6px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mb-1.5 flex items-center justify-between px-0.5">
          <Led delay={blinkDelay} reduce={reduce} size="md" />
          <span className="h-1 w-3.5 rounded-full bg-white/25" aria-hidden />
        </div>

        <div className="flex flex-1 flex-col justify-between gap-1">
          {Array.from({ length: units }, (_, i) => (
            <div
              key={i}
              className="relative flex h-full items-center gap-1 overflow-hidden rounded-[3px] border border-white/12 px-1"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(4,20,40,0.72) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <Led
                delay={`calc(${blinkDelay} + ${i * 0.11}s)`}
                reduce={reduce}
              />
              <span className="h-0.5 flex-1 rounded-full bg-white/18" />
              <span className="h-0.5 w-2 rounded-full bg-white/12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Domains/hosting hero visual — four 3D server racks with blinking online LEDs.
 */
export function HeroServerRacks({ className }: { className?: string }) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const hostingHref = serviceGroupHref(locale, "hosting");

  return (
    <div
      className={cn(
        "relative rounded-[1.35rem] border border-white/55 bg-white/95 p-4 shadow-[0_22px_50px_rgba(10,47,107,0.28)] backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.35rem] opacity-90"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 12% 0%, rgba(30,155,255,0.16), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(10,79,156,0.12), transparent 50%)",
        }}
      />

      <div className="relative">
        <p className="text-center font-display text-lg font-semibold tracking-tight text-[#0a2f6b] sm:text-xl">
          {t("serversTitle")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5">
          {RACKS.map((rack) => (
            <motion.div
              key={rack.labelKey}
              className="flex flex-col items-center"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: rack.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              <SoftLink
                href={`${hostingHref}#${rack.sectionId}`}
                className="group flex w-full flex-col items-center rounded-xl outline-offset-4 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#0a4f9c]"
                aria-label={t(rack.labelKey)}
              >
                <Rack3D units={rack.u} blinkDelay={rack.blinkDelay} reduce={reduce} />
                <p className="mt-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0a2f6b] transition group-hover:text-[#0a4f9c] sm:text-[11px]">
                  {t(rack.labelKey)}
                </p>
              </SoftLink>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#0a4f9c]/15 pt-3 text-[11px] text-[#0a4f9c]">
          <span className="inline-flex items-center gap-1.5">
            <Led delay="0.15s" reduce={reduce} size="md" />
            {t("serversOnline")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5eb0ff]" aria-hidden />
            {t("domainsReady")}
          </span>
        </div>
      </div>
    </div>
  );
}
