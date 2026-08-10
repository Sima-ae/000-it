"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 220;

const legalLinks = [
  { href: "/voorwaarden", labelKey: "terms" },
  { href: "/cookies", labelKey: "cookies" },
  { href: "/privacy", labelKey: "privacy" },
] as const;

export function InfoDropdown({
  locale,
  label,
  aboutLabel,
  faqLabel,
  termsLabel,
  cookiesLabel,
  privacyLabel,
  active,
}: {
  locale: string;
  label: string;
  aboutLabel: string;
  faqLabel: string;
  termsLabel: string;
  cookiesLabel: string;
  privacyLabel: string;
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => clearCloseTimer(), []);

  const aboutHref = `/${locale}/over-ons`;
  const aboutActive = pathname === aboutHref || pathname.startsWith(`${aboutHref}/`);
  const faqHref = `/${locale}/faq`;
  const faqActive = pathname === faqHref || pathname.startsWith(`${faqHref}/`);

  const legalLabels = {
    terms: termsLabel,
    cookies: cookiesLabel,
    privacy: privacyLabel,
  } as const;

  const itemClass =
    "block rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground";

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
          (active || open) && "bg-primary/10 text-foreground",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-full z-50 pt-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div className="min-w-56 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-xl backdrop-blur-xl">
            <SoftLink
              href={aboutHref}
              className={cn(itemClass, aboutActive && "bg-primary/10 text-foreground")}
              onClick={() => setOpen(false)}
            >
              {aboutLabel}
            </SoftLink>
            <SoftLink
              href={faqHref}
              className={cn(itemClass, faqActive && "bg-primary/10 text-foreground")}
              onClick={() => setOpen(false)}
            >
              {faqLabel}
            </SoftLink>
            {legalLinks.map((item) => (
              <SoftLink
                key={item.href}
                href={`/${locale}${item.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
                onClick={() => setOpen(false)}
              >
                {legalLabels[item.labelKey]}
              </SoftLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
