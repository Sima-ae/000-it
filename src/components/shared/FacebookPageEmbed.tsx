"use client";

import { useEffect, useState } from "react";
import {
  FACEBOOK_PAGE_AVATAR,
  FACEBOOK_PAGE_HREF,
  formatFollowerCount,
  type FacebookPageStats,
} from "@/lib/facebook-page";
import { BRAND_WEB_LOGO } from "@/components/shared/BrandLogo";

export { FACEBOOK_PAGE_HREF };

/**
 * Custom Facebook page card (cover + round avatar + follow).
 * Avatar uses a circular black border — the official Page Plugin iframe
 * cannot be styled cross-origin.
 */
export function FacebookPageEmbed({ locale }: { locale: string }) {
  const [stats, setStats] = useState<FacebookPageStats | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/facebook-page")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: FacebookPageStats | null) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const name = (stats?.name || "TripleZero iT").replace(/\s*\|\s*Dubai.*$/i, "").trim();
  const followers =
    stats?.followers != null
      ? formatFollowerCount(stats.followers, locale)
      : null;
  const followersLabel =
    followers == null
      ? null
      : locale === "nl"
        ? `${followers} volgers`
        : `${followers} followers`;
  const followLabel = locale === "nl" ? "Pagina volgen" : "Follow Page";
  const avatarSrc = avatarFailed
    ? BRAND_WEB_LOGO
    : stats?.image || FACEBOOK_PAGE_AVATAR;

  return (
    <div className="w-full">
      <a
        href={FACEBOOK_PAGE_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-primary/25 bg-white shadow-[0_8px_22px_rgba(94,59,136,0.14)] ring-1 ring-accent/20 transition hover:border-primary/40 hover:shadow-[0_10px_26px_rgba(94,59,136,0.18)]"
      >
        {/* Cover / banner */}
        <div className="relative h-14 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branding/banner.png"
            alt=""
            width={2538}
            height={463}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>

        <div className="relative px-2.5 pb-2.5">
          {/* Round page avatar with black ring */}
          <div className="-mt-6 mb-2 h-12 w-12 overflow-hidden rounded-full border-2 border-black bg-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt=""
              width={48}
              height={48}
              className={
                avatarFailed
                  ? "h-full w-full object-contain p-1"
                  : "h-full w-full object-cover"
              }
              onError={() => setAvatarFailed(true)}
            />
          </div>

          <p className="font-display text-[13px] font-semibold leading-tight text-foreground">
            {name}
          </p>
          {followersLabel ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{followersLabel}</p>
          ) : null}

          <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#1877F2] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            {followLabel}
          </span>
        </div>
      </a>
    </div>
  );
}
