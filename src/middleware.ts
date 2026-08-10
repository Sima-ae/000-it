import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";
import { canAccessPath, dashboardNav } from "@/lib/roles";

const intlMiddleware = createMiddleware(routing);

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(nl|en)(\/|$)/);
  const locale = localeMatch?.[1] ?? "nl";
  const pathWithoutLocale = pathname.replace(/^\/(nl|en)/, "") || "/";

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
