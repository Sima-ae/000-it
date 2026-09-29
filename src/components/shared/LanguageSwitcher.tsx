"use client";

import { Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  enabledLanguages,
  flagSrc,
  getLanguage,
  indiaLanguages,
  isIndiaLanguage,
  type SiteLanguage,
} from "@/i18n/languages";
import { switchLocalizedPath } from "@/i18n/pathnames";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 180;

function Flag({
  flag,
  size = 28,
  className,
}: {
  flag: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-black/10 bg-muted shadow-sm",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc(flag)}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

type SwitcherEntry =
  | { kind: "language"; lang: SiteLanguage }
  | { kind: "india" };

function switcherEntries(languages: SiteLanguage[]): SwitcherEntry[] {
  let indiaInserted = false;
  const entries: SwitcherEntry[] = [];
  for (const lang of languages) {
    if (isIndiaLanguage(lang.code)) {
      if (!indiaInserted) {
        entries.push({ kind: "india" });
        indiaInserted = true;
      }
      continue;
    }
    entries.push({ kind: "language", lang });
  }
  return entries;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [indiaOpen, setIndiaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = getLanguage(locale) ?? enabledLanguages()[0];
  const languages = enabledLanguages();
  const entries = switcherEntries(languages);
  const indiaOptions = indiaLanguages();
  const indiaActive = isIndiaLanguage(locale);
  const indiaLabel = indiaOptions.map((lang) => lang.nativeName).join(", ");

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setIndiaOpen(false);
    }, CLOSE_DELAY_MS);
  }

  useEffect(() => {
    setOpen(false);
    setIndiaOpen(false);
  }, [pathname]);

  useEffect(() => () => clearCloseTimer(), []);

  function selectLanguage(next: SiteLanguage) {
    if (next.code === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `NEXT_LOCALE=${next.code};path=/;max-age=31536000;samesite=lax`;
    setIndiaOpen(false);
    setOpen(false);
    const hash =
      typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    router.push(switchLocalizedPath(pathname, next.code, hash));
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => {
        clearCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl p-0 transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-9",
          open && "bg-muted/70",
        )}
        aria-label={t("title")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() =>
          setOpen((value) => {
            if (value) setIndiaOpen(false);
            return !value;
          })
        }
      >
        {current ? <Flag flag={current.flag} size={20} /> : null}
      </button>

      {open ? (
        <div
          className="absolute inset-e-0 top-full z-100 pt-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div
            role="menu"
            aria-label={t("title")}
            className="w-[min(92vw,18.5rem)] rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-xl"
          >
            <div className="grid max-h-[min(70vh,22rem)] grid-cols-7 gap-1 overflow-y-auto p-0.5">
              {entries.map((entry) => {
                if (entry.kind === "india") {
                  return (
                    <button
                      key="india"
                      type="button"
                      role="menuitem"
                      title={indiaLabel}
                      aria-label={indiaLabel}
                      aria-haspopup="menu"
                      aria-expanded={indiaOpen}
                      aria-current={indiaActive ? "true" : undefined}
                      onClick={() => setIndiaOpen((value) => !value)}
                      className={cn(
                        "relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition",
                        indiaActive || indiaOpen
                          ? "bg-primary/15 ring-1 ring-primary/35"
                          : "hover:bg-muted/70",
                      )}
                    >
                      <Flag flag="in" size={22} />
                      <span className="absolute bottom-0.5 inset-e-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm">
                        <ChevronDown
                          className={cn(
                            "h-2.5 w-2.5 transition",
                            indiaOpen && "rotate-180",
                          )}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      </span>
                    </button>
                  );
                }

                const lang = entry.lang;
                const active = lang.code === locale;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="menuitem"
                    title={lang.nativeName}
                    aria-label={lang.nativeName}
                    aria-current={active ? "true" : undefined}
                    onClick={() => selectLanguage(lang)}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-xl transition",
                      active
                        ? "bg-primary/15 ring-1 ring-primary/35"
                        : "hover:bg-muted/70",
                    )}
                  >
                    <Flag flag={lang.flag} size={22} />
                  </button>
                );
              })}
            </div>
            {indiaOpen ? (
              <div
                role="menu"
                aria-label={indiaLabel}
                className="mt-1 border-t border-border/70 px-0.5 pt-1"
              >
                {indiaOptions.map((lang) => {
                  const active = lang.code === locale;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="menuitem"
                      dir="ltr"
                      aria-current={active ? "true" : undefined}
                      onClick={() => selectLanguage(lang)}
                      className={cn(
                        "relative flex w-full items-center justify-center rounded-lg px-2.5 py-1.5 text-center text-sm transition",
                        active
                          ? "bg-primary/15 text-foreground"
                          : "text-foreground hover:bg-muted/70",
                      )}
                    >
                      <span className="truncate">{lang.nativeName}</span>
                      {active ? (
                        <Check
                          className="absolute inset-e-2.5 h-3.5 w-3.5 text-primary"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
