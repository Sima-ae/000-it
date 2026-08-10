"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

/** Primary public routes — prefetched after idle so clicks feel instant. */
const PUBLIC_PATHS = [
  "",
  "/over-ons",
  "/ai-scan",
  "/diensten",
  "/portfolio",
  "/shop",
  "/nieuws",
  "/faq",
  "/contact",
  "/afspraak",
] as const;

export function PrefetchPublicRoutes() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      for (const path of PUBLIC_PATHS) {
        try {
          router.prefetch(`/${locale}${path}`);
        } catch {
          /* ignore */
        }
      }
    };

    const ric = window.requestIdleCallback?.(run, { timeout: 2500 });
    const timeout =
      typeof ric === "number"
        ? undefined
        : window.setTimeout(run, 600);

    return () => {
      cancelled = true;
      if (typeof ric === "number") window.cancelIdleCallback?.(ric);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [locale, router]);

  return null;
}
