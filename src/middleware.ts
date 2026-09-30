import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";
import { localizePath, toInternalPath } from "@/i18n/pathnames";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";
import { normalizeEntityParam } from "@/lib/entity-slug-cache";
import { canAccessPath, dashboardNav, isStaffRole } from "@/lib/roles";
import {
  SOCIAL_BOT_RE,
  antiScrapeResponse,
  withSecurityHeaders,
} from "@/lib/anti-scrape";
import {
  brandPrimaryOrigin,
  resolveHostContext,
  type ResolvedHostContext,
} from "@/lib/brand/config";

/** Compare paths ignoring %XX vs Unicode differences (script-locale slugs). */
function pathsEquivalent(a: string, b: string) {
  const norm = (path: string) =>
    path
      .split("/")
      .map((seg) => normalizeEntityParam(seg))
      .join("/");
  return norm(a) === norm(b);
}

const intlAlwaysNl = createMiddleware({
  ...routing,
  localePrefix: "always",
  defaultLocale: "nl",
  localeDetection: true,
});

/** ExtraHosting.eu — English first; no Accept-Language override to /nl. */
const intlAlwaysEn = createMiddleware({
  ...routing,
  localePrefix: "always",
  defaultLocale: "en",
  localeDetection: false,
});

const intlNeverNl = createMiddleware({
  ...routing,
  localePrefix: "never",
  defaultLocale: "nl",
  localeDetection: false,
});

const localePattern = routing.locales
  .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const localePathRe = new RegExp(`^/(${localePattern})(?=/|$)`);

const protectedPrefixes = [
  ...new Set([
    ...dashboardNav.map((item) => item.href),
    "/tickets",
    "/clients",
    "/leads",
    "/crm/invoices",
    "/crm/messages",
    "/crm/tasks",
    "/crm/settings",
  ]),
];

/** Staff-only areas — redirect off ExtraHosting to TripleZero. */
const staffOnlyPrefixes = [
  "/shop-admin",
  "/hosting-admin",
  "/hosting-orders",
  "/domains-admin",
  "/domain-orders",
  "/all-orders",
  "/clients",
  "/leads",
  "/users",
  "/content-generator",
  "/seo-analysis",
  "/crm",
  "/dashboard/activity-logs",
  "/todos",
  "/projects",
];

function isApexOrWww(host: string, apex: string) {
  return host === apex || host === `www.${apex}`;
}

function publicAbsoluteUrl(hostCtx: ResolvedHostContext, pathname: string, search = "") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const host =
    hostCtx.host.startsWith("www.") && hostCtx.brand === "triplezero"
      ? hostCtx.config.primaryHost
      : hostCtx.host.replace(/^www\./, "") || hostCtx.config.primaryHost;
  return `https://${host}${path}${search}`;
}

function socialPreviewRewrite(request: NextRequest, pathname: string, defaultLocale: string) {
  const previewUrl = request.nextUrl.clone();
  let path = pathname || "/";
  if (path === "/" || path === "") {
    path = `/${defaultLocale}`;
  }
  const encoded = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  previewUrl.pathname = `/api/social-preview/${encoded}`;
  previewUrl.search = "";
  const headers = new Headers(request.headers);
  headers.set("x-social-path", path);
  headers.set("x-site-brand", resolveHostContext(request.headers.get("host")).brand);
  return NextResponse.rewrite(previewUrl, { request: { headers } });
}

function withBrandHeaders(
  response: NextResponse,
  hostCtx: ResolvedHostContext,
  locale?: string,
) {
  response.headers.set("x-site-brand", hostCtx.brand);
  const siteLocale =
    locale || hostCtx.fixedLocale || hostCtx.defaultLocale || "";
  if (siteLocale) {
    response.headers.set("x-site-locale", siteLocale);
  }
  const override = response.headers.get("x-middleware-override-headers");
  if (override) {
    const keys = override
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    if (!keys.includes("x-site-brand")) keys.push("x-site-brand");
    if (siteLocale && !keys.includes("x-site-locale")) keys.push("x-site-locale");
    response.headers.set("x-middleware-override-headers", keys.join(","));
    response.headers.set("x-middleware-request-x-site-brand", hostCtx.brand);
    if (siteLocale) {
      response.headers.set("x-middleware-request-x-site-locale", siteLocale);
    }
  }
  if (hostCtx.fixedLocale) {
    response.headers.set("x-fixed-locale", hostCtx.fixedLocale);
  }
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const search = request.nextUrl.search;
  const hostHeader = request.headers.get("host") || "";
  const hostCtx = resolveHostContext(hostHeader);
  const host = hostCtx.host;
  request.headers.set("x-site-brand", hostCtx.brand);
  const ua = request.headers.get("user-agent") || "";
  const isSocialBot = SOCIAL_BOT_RE.test(ua);

  // Always read uploads from disk via API (covers written after boot).
  if (pathname.startsWith("/uploads/")) {
    const blockedUploads = antiScrapeResponse(request, "/uploads");
    if (blockedUploads) return blockedUploads;
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Extra Hosting favicon / app icon (browsers often hit /favicon.ico first).
  if (hostCtx.brand === "extrahosting") {
    if (
      pathname === "/favicon.ico" ||
      pathname === "/branding/favicon.png" ||
      pathname === "/branding/favicon-16x16.png" ||
      pathname === "/branding/favicon-32x32.png" ||
      pathname === "/branding/apple-touch-icon.png" ||
      pathname === "/branding/icon-192.png" ||
      pathname === "/branding/icon-512.png"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/branding/FAVICON-EXTRA-HOSTING.png";
      return NextResponse.rewrite(url);
    }
  }

  const isProdBrandHost =
    isApexOrWww(host, "000-it.com") ||
    isApexOrWww(host, "extrahosting.eu") ||
    isApexOrWww(host, "extrahosting.nl");

  if (
    isSocialBot &&
    isProdBrandHost &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/")
  ) {
    const socialPath =
      hostCtx.localePrefix === "never" && hostCtx.fixedLocale
        ? `/${hostCtx.fixedLocale}${pathname === "/" ? "" : pathname}`
        : pathname;
    return socialPreviewRewrite(request, socialPath, hostCtx.defaultLocale);
  }

  const localeMatchEarly = pathname.match(localePathRe);
  const localeEarly =
    hostCtx.fixedLocale ||
    localeMatchEarly?.[1] ||
    hostCtx.defaultLocale ||
    routing.defaultLocale;
  const pathWithoutLocaleEarly =
    hostCtx.localePrefix === "never"
      ? pathname || "/"
      : pathname.replace(localePathRe, "") || "/";
  const internalEarly = pathname.startsWith("/api/")
    ? pathname
    : toInternalPath(localeEarly, pathWithoutLocaleEarly);

  const blocked = antiScrapeResponse(request, internalEarly);
  if (blocked) return blocked;

  if (
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/sitemaps/")
  ) {
    return withBrandHeaders(
      withSecurityHeaders(NextResponse.next(), pathname, internalEarly),
      hostCtx,
      localeEarly,
    );
  }

  // Humans: canonicalize www → apex (never leak internal listen port).
  if (host.startsWith("www.")) {
    const apex = host.replace(/^www\./, "");
    return NextResponse.redirect(
      `https://${apex}${pathname || "/"}${search}`,
      301,
    );
  }

  // Extra Hosting: Dutch lives on extrahosting.nl; every other language on extrahosting.eu.
  if (hostCtx.brand === "extrahosting" && (host === "extrahosting.nl" || host === "extrahosting.eu")) {
    const prefixed = pathname.match(localePathRe);
    const localeInPath = prefixed?.[1];
    if (host === "extrahosting.nl" && localeInPath && localeInPath !== "nl") {
      return NextResponse.redirect(
        `https://extrahosting.eu${pathname}${search}`,
        301,
      );
    }
    if (host === "extrahosting.eu" && localeInPath === "nl") {
      const rest = pathname.replace(/^\/nl(?=\/|$)/, "") || "/";
      return NextResponse.redirect(`https://extrahosting.nl${rest}${search}`, 301);
    }
  }

  // ExtraHosting.eu: bare `/` always opens English (`/en`).
  if (
    hostCtx.brand === "extrahosting" &&
    hostCtx.localePrefix === "always" &&
    (pathname === "/" || pathname === "")
  ) {
    return NextResponse.redirect(
      publicAbsoluteUrl(hostCtx, `/${hostCtx.defaultLocale || "en"}`, search),
      302,
    );
  }

  // Country TLD: strip accidental /nl prefix → root Dutch URL.
  if (hostCtx.localePrefix === "never" && hostCtx.fixedLocale) {
    const prefixed = pathname.match(localePathRe);
    if (prefixed?.[1] === hostCtx.fixedLocale) {
      const rest = pathname.replace(localePathRe, "") || "/";
      return NextResponse.redirect(
        publicAbsoluteUrl(hostCtx, rest, search),
        301,
      );
    }
  }

  const localeMatch = pathname.match(localePathRe);
  const locale =
    hostCtx.fixedLocale ||
    localeMatch?.[1] ||
    hostCtx.defaultLocale ||
    routing.defaultLocale;
  request.headers.set("x-site-locale", locale);
  const pathWithoutLocale =
    hostCtx.localePrefix === "never"
      ? pathname || "/"
      : pathname.replace(localePathRe, "") || "/";

  try {
    await hydrateEntitySlugs(locale);
  } catch {
    /* ignore */
  }

  // Canonicalize segments + entity slugs (prefix hosts only).
  if (hostCtx.localePrefix === "always" && pathWithoutLocale !== "/") {
    const internal = toInternalPath(locale, pathWithoutLocale);
    const expected = localizePath(locale, internal);
    const currentBare =
      pathWithoutLocale.length > 1 && pathWithoutLocale.endsWith("/")
        ? pathWithoutLocale.slice(0, -1)
        : pathWithoutLocale;
    if (expected !== "/" && !pathsEquivalent(expected, currentBare)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${expected}`;
      return NextResponse.redirect(url, 301);
    }
  }

  const internalPath = toInternalPath(locale, pathWithoutLocale);

  // ExtraHosting: staff tools live on TripleZero — redirect there.
  if (!hostCtx.config.staffUi) {
    const isStaffPath = staffOnlyPrefixes.some(
      (prefix) =>
        internalPath === prefix || internalPath.startsWith(`${prefix}/`),
    );
    if (isStaffPath) {
      const target = new URL(
        `/${locale}${internalPath}${search}`,
        brandPrimaryOrigin("triplezero"),
      );
      return NextResponse.redirect(target, 302);
    }
  }

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      internalPath === prefix || internalPath.startsWith(`${prefix}/`),
  );
  const isAuthPage =
    internalPath.startsWith("/login") ||
    internalPath.startsWith("/register") ||
    internalPath.startsWith("/forgot-password");

  if (isProtected || isAuthPage) {
    const isSecure =
      request.nextUrl.protocol === "https:" ||
      request.headers.get("x-forwarded-proto") === "https";

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: isSecure,
    });

    if (isProtected && !token) {
      const loginPath =
        hostCtx.localePrefix === "never"
          ? `/login`
          : `/${locale}/login`;
      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtected && token) {
      const role = typeof token.role === "string" ? token.role : "CLIENT";
      if (!canAccessPath(internalPath, role)) {
        const dash =
          hostCtx.localePrefix === "never"
            ? `/dashboard`
            : `/${locale}/dashboard`;
        return NextResponse.redirect(new URL(dash, request.url));
      }
      // Staff landing on ExtraHosting client dashboard is fine; deep staff URLs redirected above.
      if (!hostCtx.config.staffUi && isStaffRole(role) && isStaffPathLike(internalPath)) {
        const target = new URL(
          `/${locale}${internalPath}${search}`,
          brandPrimaryOrigin("triplezero"),
        );
        return NextResponse.redirect(target, 302);
      }
    }

    if (isAuthPage && token) {
      const dash =
        hostCtx.localePrefix === "never"
          ? `/dashboard`
          : `/${locale}/dashboard`;
      return NextResponse.redirect(new URL(dash, request.url));
    }
  }

  const intlMw =
    hostCtx.localePrefix === "never"
      ? intlNeverNl
      : hostCtx.brand === "extrahosting"
        ? intlAlwaysEn
        : intlAlwaysNl;
  const intlResponse = intlMw(request) as NextResponse;
  return withBrandHeaders(
    withSecurityHeaders(intlResponse, pathname, internalPath),
    hostCtx,
    locale,
  );
}

function isStaffPathLike(internalPath: string) {
  return staffOnlyPrefixes.some(
    (prefix) =>
      internalPath === prefix || internalPath.startsWith(`${prefix}/`),
  );
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/uploads/:path*",
    "/api/:path*",
    "/sitemap.xml",
    "/sitemaps/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
