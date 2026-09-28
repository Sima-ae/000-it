"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { localizedHref } from "@/i18n/pathnames";

const SHOW_AFTER_MOBILE_PX = 400;
const SHOW_AFTER_DESKTOP_PX = 750;
const MOBILE_MQ = "(max-width: 767px)";

/** Hide on auth / dashboard / admin surfaces — marketing pages only. */
function shouldMountOnPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const parts = pathname.split("/").filter(Boolean);
  // /{locale}/... → strip locale segment
  const rest = parts.slice(1).join("/");
  if (!rest) return true; // home
  if (
    /^(login|register|dashboard|crm|shop-admin|hosting-admin|domains-admin|all-orders|hosting-orders|my-|agent-000)/i.test(
      rest,
    )
  ) {
    return false;
  }
  if (rest.includes("-admin") || rest.startsWith("crm")) return false;
  return true;
}

function normalizeQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

function scrollThresholdPx() {
  if (typeof window === "undefined") return SHOW_AFTER_DESKTOP_PX;
  return window.matchMedia(MOBILE_MQ).matches
    ? SHOW_AFTER_MOBILE_PX
    : SHOW_AFTER_DESKTOP_PX;
}

export function StickyDomainBar() {
  const t = useTranslations("stickyDomainBar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const allowed = shouldMountOnPath(pathname);

  useEffect(() => {
    if (!allowed) {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY >= scrollThresholdPx());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const mq = window.matchMedia(MOBILE_MQ);
    mq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, [allowed]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = normalizeQuery(query);
      if (!cleaned) return;
      const href = localizedHref(
        locale,
        `/domeinen?q=${encodeURIComponent(cleaned)}`,
      );
      router.push(href);
    },
    [locale, query, router],
  );

  if (!allowed) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="sticky-domain-bar"
          role="search"
          aria-label={t("ariaLabel")}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className={
            // Mobile: sit above the chat FAB (h-14 + gap). Desktop: tight to bottom.
            "pointer-events-none fixed inset-x-0 bottom-0 z-40 " +
            "pb-[calc(4.75rem+env(safe-area-inset-bottom))] " +
            "md:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          }
        >
          {/* Same width math as Footer: max-w-7xl includes horizontal padding */}
          <div className="pointer-events-none mx-auto max-w-7xl px-3 md:px-4">
            <div className="pointer-events-auto w-full rounded-2xl border border-white/40 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:rounded-3xl dark:border-white/10 dark:bg-[#101620]">
              <div className="flex flex-col items-stretch gap-2 px-2.5 py-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-5 sm:px-4 sm:py-3 md:px-5 lg:pr-20">
                <p className="hidden shrink-0 text-sm font-medium text-foreground md:block lg:text-[15px]">
                  {t("prompt")}
                </p>

                <form
                  onSubmit={submit}
                  className="flex min-w-0 flex-1 items-center gap-0 overflow-hidden rounded-full border border-border/70 bg-background shadow-sm sm:max-w-xl lg:max-w-2xl"
                >
                  <span
                    className="hidden select-none pl-4 text-sm text-muted-foreground sm:inline"
                    aria-hidden
                  >
                    www
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("placeholder")}
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:px-4 sm:py-3 sm:pl-2"
                    aria-label={t("placeholder")}
                  />
                  <button
                    type="submit"
                    className="m-1 shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:px-5 sm:py-2.5"
                  >
                    {t("check")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
