"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 220;

export function InfoDropdown({
  locale,
  label,
  contactLabel,
  aboutLabel,
  faqLabel,
  termsLabel,
  cookiesLabel,
  newsLabel,
  privacyLabel,
  active,
}: {
  locale: string;
  label: string;
  contactLabel: string;
  aboutLabel: string;
  faqLabel: string;
  termsLabel: string;
  cookiesLabel: string;
  newsLabel: string;
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

  const contactHref = localizedHref(locale, "/contact");
  const contactActive =
    pathname === contactHref || pathname.startsWith(`${contactHref}/`);
  const aboutHref = localizedHref(locale, "/over-ons");
  const aboutActive = pathname === aboutHref || pathname.startsWith(`${aboutHref}/`);
  const newsHref = localizedHref(locale, "/nieuws");
  const newsActive = pathname === newsHref || pathname.startsWith(`${newsHref}/`);
  const faqHref = localizedHref(locale, "/faq");
  const faqActive = pathname === faqHref || pathname.startsWith(`${faqHref}/`);

  const itemClass =
    "block rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground";

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
          "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] text-muted-foreground transition hover:bg-primary hover:text-primary-foreground",
          (active || open) && "bg-primary text-primary-foreground",
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
          <div className="min-w-56 rounded-2xl border border-border/60 bg-white p-1.5 shadow-xl dark:bg-zinc-950">
            <SoftLink
              href={contactHref}
              className={cn(itemClass, contactActive && "bg-primary text-primary-foreground")}
              onClick={() => setOpen(false)}
            >
              {contactLabel}
            </SoftLink>
            <SoftLink
              href={aboutHref}
              className={cn(itemClass, aboutActive && "bg-primary text-primary-foreground")}
              onClick={() => setOpen(false)}
            >
              {aboutLabel}
            </SoftLink>
            <SoftLink
              href={localizedHref(locale, "/voorwaarden")}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              {termsLabel}
            </SoftLink>
            <SoftLink
              href={localizedHref(locale, "/cookies")}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              {cookiesLabel}
            </SoftLink>
            <SoftLink
              href={newsHref}
              className={cn(itemClass, newsActive && "bg-primary text-primary-foreground")}
              onClick={() => setOpen(false)}
            >
              {newsLabel}
            </SoftLink>
            <SoftLink
              href={localizedHref(locale, "/privacy")}
              target="_blank"
              rel="noopener noreferrer"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              {privacyLabel}
            </SoftLink>
            <SoftLink
              href={faqHref}
              className={cn(itemClass, faqActive && "bg-primary text-primary-foreground")}
              onClick={() => setOpen(false)}
            >
              {faqLabel}
            </SoftLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
