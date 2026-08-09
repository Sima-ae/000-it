import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/clients",
  "/ai-agents",
  "/seo-analysis",
  "/content-generator",
  "/settings",
  "/portfolio-admin",
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
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });

    if (isProtected && !token) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
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
