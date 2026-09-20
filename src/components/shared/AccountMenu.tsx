"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { CircleUserRound } from "lucide-react";
import { SoftLink } from "@/components/shared/SoftLink";
import { cn } from "@/lib/utils";
import { localizedHref } from "@/i18n/pathnames";

const CLOSE_DELAY_MS = 180;
const WEBMAIL_URL = "https://000-it.com/webmail";

export function AccountMenu({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const itemClass =
    "block w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground";

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
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
          open && "bg-muted/70 text-foreground",
        )}
        aria-label={tCommon("account")}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <CircleUserRound className="h-5.5 w-5.5" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 pt-2"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <div
            role="menu"
            className="min-w-44 rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-xl backdrop-blur-xl"
          >
            {session?.user ? (
              <>
                <SoftLink
                  href={localizedHref(locale, "/dashboard")}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  {t("dashboard")}
                </SoftLink>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onClick={() => {
                    setOpen(false);
                    void signOut({ callbackUrl: `/${locale}` });
                  }}
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <SoftLink
                  href={localizedHref(locale, "/login")}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  {t("login")}
                </SoftLink>
                <SoftLink
                  href={localizedHref(locale, "/register")}
                  className={cn(itemClass, "font-medium text-foreground")}
                  onClick={() => setOpen(false)}
                >
                  {t("register")}
                </SoftLink>
              </>
            )}
            <a
              href={WEBMAIL_URL}
              role="menuitem"
              className={itemClass}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {t("webmail")}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
