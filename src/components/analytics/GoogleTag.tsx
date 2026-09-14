"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

/** GA4 measurement ID (Search Console / Analytics). Override via env if needed. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-1WXFSCS58G";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Fires a GA4 page_view on App Router client navigations.
 * The initial load is handled by gtag('config', …) in the script below.
 */
function GoogleTagPageviews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    const qs = searchParams.toString();
    const page_path = qs ? `${pathname}?${qs}` : pathname;
    window.gtag("config", GA_MEASUREMENT_ID, { page_path });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Official Google tag (gtag.js) for the whole app.
 * Loads afterInteractive so it does not block first paint.
 */
export function GoogleTag() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-gtag" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
        `.trim()}
      </Script>
      <Suspense fallback={null}>
        <GoogleTagPageviews />
      </Suspense>
    </>
  );
}
