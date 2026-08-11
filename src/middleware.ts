import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";
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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostHeader = request.headers.get("host") || "";
  const host = hostHeader.split(":")[0].toLowerCase();
  const ua = request.headers.get("user-agent") || "";
  const isSocialBot = SOCIAL_BOT_RE.test(ua);

  // Canonicalize www → apex so WhatsApp/Messenger share one host (OG urls use apex).
  if (host === `www.${CANONICAL_HOST}`) {
    const target = request.nextUrl.clone();
    target.hostname = CANONICAL_HOST;
    target.protocol = "https:";
    // Collapse root → /nl in one hop for social bots (avoids www→apex then /→/nl).
    if (isSocialBot && (pathname === "/" || pathname === "")) {
      target.pathname = `/${routing.defaultLocale}`;
    }
    return NextResponse.redirect(target, 301);
  }

  // Social bots on bare "/" : rewrite to default locale (no redirect) so OG tags are in the 200 HTML.
  if (
    isSocialBot &&
    isProductionHost(host) &&
    (pathname === "/" || pathname === "")
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/${routing.defaultLocale}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  const localeMatch = pathname.match(localePathRe);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(localePathRe, "") || "/";

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`),
  );
  const isAuthPage =
    pathWithoutLocale.startsWith("/login") ||
    pathWithoutLocale.startsWith("/register") ||
    pathWithoutLocale.startsWith("/forgot-password");

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
      if (!canAccessPath(pathWithoutLocale, role)) {
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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
