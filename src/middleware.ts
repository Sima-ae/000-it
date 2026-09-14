import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";
import { localizePath, toInternalPath } from "@/i18n/pathnames";
import { hydrateEntitySlugs } from "@/lib/entity-slugs";
import { canAccessPath, dashboardNav } from "@/lib/roles";

const intlMiddleware = createMiddleware(routing);

const localePattern = routing.locales
  .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");
const localePathRe = new RegExp(`^/(${localePattern})(?=/|$)`);

/** Meta/WhatsApp/etc. — previews often fail if the first response is a redirect. */
const SOCIAL_BOT_RE =
  /facebookexternalhit|Facebot|WhatsApp|meta-externalagent|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot/i;

const CANONICAL_HOST = "000-it.com";

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

function isProductionHost(host: string) {
  const h = host.split(":")[0].toLowerCase();
  return h === CANONICAL_HOST || h === `www.${CANONICAL_HOST}`;
}

/** Public https URL without the internal Next listen port (e.g. :3066 behind LiteSpeed). */
function publicAbsoluteUrl(pathname: string, search = "") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://${CANONICAL_HOST}${path}${search}`;
}

function socialPreviewRewrite(request: NextRequest, pathname: string) {
  const previewUrl = request.nextUrl.clone();
  let path = pathname || "/";
  if (path === "/" || path === "") {
    path = `/${routing.defaultLocale}`;
  }
  previewUrl.pathname = "/api/social-preview";
  previewUrl.search = `?u=${encodeURIComponent(path)}`;
  return NextResponse.rewrite(previewUrl);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const search = request.nextUrl.search;
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const isSocialBot = SOCIAL_BOT_RE.test(ua);

  // WhatsApp only reads ~5KB of HTML and misses Next.js OG tags (fonts/scripts first).
  // Serve a tiny OG-first HTML shell to social crawlers — no redirects.
  if (isSocialBot && isProductionHost(host)) {
    return socialPreviewRewrite(request, pathname);
  }

  // Humans: canonicalize www → apex (never leak internal :3066 port).
  if (host === `www.${CANONICAL_HOST}`) {
    return NextResponse.redirect(publicAbsoluteUrl(pathname || "/", search), 301);
  }

  const localeMatch = pathname.match(localePathRe);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(localePathRe, "") || "/";

  // Load per-locale entity slug maps so canonicalize + auth use correct keys.
  try {
    await hydrateEntitySlugs(locale);
  } catch {
    /* ignore — maps stay empty; pages still resolve when possible */
  }

  // Canonicalize segments + entity slugs to the preferred public URL.
  // e.g. /en/diensten/aeo-optimization → /en/services/aeo-optimierung
  if (pathWithoutLocale !== "/") {
    const internal = toInternalPath(locale, pathWithoutLocale);
    const expected = localizePath(locale, internal);
    const currentBare =
      pathWithoutLocale.length > 1 && pathWithoutLocale.endsWith("/")
        ? pathWithoutLocale.slice(0, -1)
        : pathWithoutLocale;
    if (expected !== currentBare && expected !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${expected}`;
      return NextResponse.redirect(url, 301);
    }
  }

  const internalPath = toInternalPath(locale, pathWithoutLocale);

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      internalPath === prefix || internalPath.startsWith(`${prefix}/`),
  );
  const isAuthPage =
    internalPath.startsWith("/login") ||
    internalPath.startsWith("/register") ||
    internalPath.startsWith("/forgot-password");

  if (isProtected || isAuthPage) {
    // Production uses HTTPS cookies named `__Secure-authjs.session-token`.
    // getToken defaults secureCookie=false → looks for `authjs.session-token` and
    // always misses the session, bouncing users back to login after a successful sign-in.
    const isSecure =
      request.nextUrl.protocol === "https:" ||
      request.headers.get("x-forwarded-proto") === "https";

    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: isSecure,
    });

    if (isProtected && !token) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtected && token) {
      const role = typeof token.role === "string" ? token.role : "CLIENT";
      if (!canAccessPath(internalPath, role)) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Prisma entity-slug hydrate needs Node (not Edge).
  runtime: "nodejs",
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
