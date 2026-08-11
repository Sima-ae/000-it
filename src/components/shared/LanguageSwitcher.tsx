"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  enabledLanguages,
  flagSrc,
  getLanguage,
  switchLocalePath,
  type SiteLanguage,
} from "@/i18n/languages";
import { cn } from "@/lib/utils";

const CLOSE_DELAY_MS = 180;

function Flag({
  lang,
  size = 28,
  className,
}: {
  lang: SiteLanguage;
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
        src={flagSrc(lang.flag)}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = getLanguage(locale) ?? enabledLanguages()[0];
  const languages = enabledLanguages();

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

  function selectLanguage(next: SiteLanguage) {
    if (next.code === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `NEXT_LOCALE=${next.code};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    router.push(switchLocalePath(pathname, next.code));
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
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0 transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-muted/70",
        )}
        aria-label={t("title")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {current ? <Flag lang={current} size={22} /> : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 pt-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div
            role="menu"
            aria-label={t("title")}
            className="w-[min(92vw,17.5rem)] rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-xl"
          >
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-7">
              {languages.map((lang) => {
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
                    <Flag lang={lang} size={22} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
