"use client";

import { useTranslations, useLocale } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { CopyrightBar } from "@/components/shared/CopyrightBar";

const handyLinkPages = [
  { href: "/afspraak", key: "book", external: false },
  { href: "/faq", key: "faq", external: false },
  { href: "/privacy", key: "privacy", external: true },
  { href: "/cookies", key: "cookies", external: true },
  { href: "/voorwaarden", key: "terms", external: true },
] as const;

const socialLinks = [
  {
    name: "Facebook",
    href: "#",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    name: "Instagram",
    href: "#",
    path: "M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.92A3.12 3.12 0 1 1 12 8.88a3.12 3.12 0 0 1 0 6.24ZM17.52 6.96a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0ZM12 2.16c-2.63 0-2.96.01-4 0.06-2.66.12-4.5 1.96-4.62 4.62-.05 1.04-.06 1.37-.06 4 0 2.63.01 2.96.06 4 .12 2.66 1.96 4.5 4.62 4.62 1.04.05 1.37.06 4 .06s2.96-.01 4-.06c2.66-.12 4.5-1.96 4.62-4.62.05-1.04.06-1.37.06-4 0-2.63-.01-2.96-.06-4-.12-2.66-1.96-4.5-4.62-4.62-1.04-.05-1.37-.06-4-.06Zm0 1.8c2.59 0 2.89.01 3.91.06 1.95.09 3.03 1.17 3.12 3.12.05 1.02.06 1.32.06 3.91s-.01 2.89-.06 3.91c-.09 1.95-1.17 3.03-3.12 3.12-1.02.05-1.32.06-3.91.06s-2.89-.01-3.91-.06c-1.95-.09-3.03-1.17-3.12-3.12-.05-1.02-.06-1.32-.06-3.91s.01-2.89.06-3.91c.09-1.95 1.17-3.03 3.12-3.12 1.02-.05 1.32-.06 3.91-.06Z",
  },
  {
    name: "LinkedIn",
    href: "#",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    name: "Threads",
    href: "#",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z",
  },
  {
    name: "WhatsApp",
    href: "#",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  },
  {
    name: "X",
    href: "#",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    name: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isNl = locale === "nl";
  const year = new Date().getFullYear();
  const handyLinks = [...handyLinkPages].sort((a, b) =>
    nav(a.key).localeCompare(nav(b.key), locale, { sensitivity: "base" }),
  );

  return (
    <footer className="relative mt-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-4 md:px-6 md:pt-10 md:pb-5">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="grid gap-8 px-6 py-7 sm:grid-cols-2 md:grid-cols-3 md:gap-6 md:px-8 md:py-8">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                TripleZero iT
              </p>
              <p className="mt-2 max-w-[16rem] text-sm leading-snug text-muted-foreground">
                {t("tagline")}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-primary transition hover:opacity-80"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4 fill-current"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {isNl ? "Informatie" : "Information"}
              </p>
              <SoftLink href={`/${locale}/over-ons`} className="leading-snug transition hover:text-foreground">
                {nav("about")}
              </SoftLink>
              <SoftLink href={`/${locale}/diensten`} className="leading-snug transition hover:text-foreground">
                {nav("services")}
              </SoftLink>
              <SoftLink href={`/${locale}/portfolio`} className="leading-snug transition hover:text-foreground">
                {nav("portfolio")}
              </SoftLink>
              <SoftLink href={`/${locale}/nieuws`} className="leading-snug transition hover:text-foreground">
                {nav("blog")}
              </SoftLink>
              <SoftLink href={`/${locale}/contact`} className="leading-snug transition hover:text-foreground">
                {nav("contact")}
              </SoftLink>
            </div>

            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {isNl ? "Handige links" : "Useful links"}
              </p>
              {handyLinks.map((page) => (
                <SoftLink
                  key={page.href}
                  href={`/${locale}${page.href}`}
                  {...(page.external
                    ? { target: "_blank" as const, rel: "noopener noreferrer" }
                    : {})}
                  className="leading-snug transition hover:text-foreground"
                >
                  {nav(page.key)}
                </SoftLink>
              ))}
            </div>
          </div>
        </div>

        <CopyrightBar year={year} rights={t("rights")} />
      </div>
    </footer>
  );
}
