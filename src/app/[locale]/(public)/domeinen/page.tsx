import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SoftLink } from "@/components/shared/SoftLink";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { DomainSearch } from "@/components/domains/DomainSearch";
import { DomainTransferForm } from "@/components/domains/DomainTransferForm";
import { localizedHref } from "@/i18n/pathnames";
import { buildServiceMetadata } from "@/lib/seo";
import { getServiceContent } from "@/lib/fixweb-content";
import { ensurePaidCheckoutAndInvoice } from "@/lib/shop/order-invoice";

const SLUG = "domains";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = await getServiceContent(SLUG, locale);
  const t = await getTranslations({ locale, namespace: "domainsPage" });
  return buildServiceMetadata({
    locale,
    slug: SLUG,
    title: content?.title || t("metaTitle"),
    description: content?.subtitle || t("metaDescription"),
    image: content?.image || "/uploads/infoweb/domains.png",
  });
}

export default async function DomainsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    order?: string;
    session_id?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("domainsPage");

  let invoiceSent = false;
  if (sp.success === "1" && sp.session_id) {
    try {
      const result = await ensurePaidCheckoutAndInvoice(sp.session_id);
      invoiceSent = result.sent || result.reason === "ALREADY_SENT";
    } catch (error) {
      console.error("[domeinen/success] invoice", error);
    }
  }

  return (
    <div className="min-w-0 overflow-x-hidden">
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 45% at 95% 70%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 md:px-6 md:py-20">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center md:mx-0 md:max-w-none md:text-left">
              <h1 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {t("heroTitle")}
              </h1>
              <div className="mt-4 space-y-1.5 text-muted-foreground">
                <p className="text-pretty text-base leading-snug md:max-w-3xl md:text-lg">
                  {t("heroSubtitle")}
                </p>
                <p className="text-pretty text-xs leading-snug md:max-w-3xl md:text-sm">
                  {t("heroSubtitleNote")}
                </p>
              </div>
            </div>
          </Reveal>

          {sp.success === "1" ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm">
              {t("successBanner", {
                order: sp.order ? ` (${sp.order})` : "",
              })}
              {invoiceSent ? (
                <p className="mt-1 text-xs opacity-90">{t("invoiceEmailSent")}</p>
              ) : null}
            </div>
          ) : null}
          {sp.canceled === "1" ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm">
              {t("canceledBanner")}
            </div>
          ) : null}

          <Reveal delay={0.05}>
            <div className="mt-8 w-full min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-background/80 p-3 shadow-sm backdrop-blur sm:mt-10 sm:rounded-[1.75rem] sm:p-5 md:p-6">
              <DomainSearch />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-5 md:px-6 md:py-16">
        <div className="grid gap-8 text-center sm:gap-10 md:grid-cols-3 md:text-left">
          {(
            [
              ["step1Title", "step1Body"],
              ["step2Title", "step2Body"],
              ["step3Title", "step3Body"],
            ] as const
          ).map(([titleKey, bodyKey], i) => (
            <Reveal key={titleKey} delay={i * 0.04}>
              <div className="mx-auto max-w-md md:mx-0 md:max-w-none">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  0{i + 1}
                </p>
                <h2 className="font-display mt-2 text-balance text-xl font-semibold tracking-tight">
                  {t(titleKey)}
                </h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground">
                  {t(bodyKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08}>
          <div className="mt-12 rounded-3xl border border-border/70 bg-linear-to-br from-primary/10 via-background to-accent/10 px-4 py-7 sm:mt-14 sm:rounded-[1.75rem] sm:px-6 md:px-10 md:py-8">
            <h2 className="font-display text-balance text-2xl font-semibold tracking-tight">
              {t("transferTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              {t("transferBody")}
            </p>
            <div className="mt-5 min-w-0">
              <DomainTransferForm />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-border/70 bg-linear-to-br from-primary/10 via-background to-accent/10 px-4 py-7 sm:mt-14 sm:rounded-[1.75rem] sm:px-6 md:px-10 md:py-8">
            <h2 className="font-display text-balance text-2xl font-semibold tracking-tight">
              {t("dnsTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
              {t("dnsBody")}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full rounded-2xl sm:w-auto">
                <SoftLink href={localizedHref(locale, "/my-domains")}>
                  {t("ctaMyDomains")}
                </SoftLink>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-2xl sm:w-auto">
                <SoftLink href={localizedHref(locale, "/afspraak")}>
                  {t("ctaBook")}
                </SoftLink>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-2xl sm:w-auto">
                <SoftLink href={localizedHref(locale, "/contact")}>
                  {t("ctaContact")}
                </SoftLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
