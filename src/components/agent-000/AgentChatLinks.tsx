"use client";

import {
  BookOpen,
  Calendar,
  ExternalLink,
  Globe,
  HelpCircle,
  Mail,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SoftLink } from "@/components/shared/SoftLink";
import { Button } from "@/components/ui/button";
import { localizedHref } from "@/i18n/pathnames";
import type { AgentAction, AgentLink } from "@/lib/agent-000/ask";
import { formatEuro } from "@/lib/format-euro";
import { cn } from "@/lib/utils";

type Props = {
  locale: string;
  links?: AgentLink[];
  mode?: "answer" | "clarify";
  actions?: AgentAction[];
  onPickLink?: (link: AgentLink) => void;
  onOpenTicket?: () => void;
  className?: string;
  /** Light bubbles (live chat) vs dark pane */
  tone?: "light" | "dark";
};

function AgentProductCard({
  link,
  tone,
  openLabel,
}: {
  link: AgentLink;
  tone: "light" | "dark";
  openLabel: string;
}) {
  const price =
    typeof link.priceInclCents === "number" && link.priceInclCents > 0
      ? formatEuro(link.priceInclCents / 100)
      : null;

  return (
    <SoftLink
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex gap-2.5 rounded-xl border p-2.5 transition",
        tone === "dark"
          ? "border-white/15 bg-white/5 hover:bg-white/10"
          : "border-border/80 bg-background/80 hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {link.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={link.image}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg",
            tone === "dark" ? "bg-cyan-500/15 text-cyan-200" : "bg-primary/10 text-primary",
          )}
        >
          <ExternalLink className="h-5 w-5" aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1">
        {link.badge ? (
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              tone === "dark" ? "text-cyan-300/80" : "text-muted-foreground",
            )}
          >
            {link.badge}
          </p>
        ) : null}
        <p
          className={cn(
            "truncate text-sm font-semibold leading-tight",
            tone === "dark" ? "text-slate-50" : "text-foreground",
          )}
        >
          {link.title}
        </p>
        {link.subtitle ? (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-[11px] leading-snug",
              tone === "dark" ? "text-slate-400" : "text-muted-foreground",
            )}
          >
            {link.subtitle}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {price ? (
            <span
              className={cn(
                "text-xs font-semibold",
                tone === "dark" ? "text-cyan-200" : "text-primary",
              )}
            >
              {price}
            </span>
          ) : null}
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium",
              tone === "dark" ? "text-slate-400" : "text-muted-foreground",
            )}
          >
            {openLabel}
            <ExternalLink className="h-2.5 w-2.5" aria-hidden />
          </span>
        </div>
      </div>
    </SoftLink>
  );
}

export function AgentChatLinks({
  locale,
  links,
  mode = "answer",
  actions,
  onPickLink,
  onOpenTicket,
  className,
  tone = "light",
}: Props) {
  const t = useTranslations("agent000");
  if (!links?.length && !actions?.length) return null;

  const products = (links || []).filter((l) => l.kind === "product");
  const helpLinks = (links || []).filter((l) => l.kind !== "product");

  const labelClass =
    tone === "dark"
      ? "text-[10px] font-medium uppercase tracking-wide text-cyan-300/80"
      : "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

  const outlineClass =
    tone === "dark"
      ? "h-8 max-w-full rounded-lg border-white/20 bg-white/5 text-start text-xs text-slate-100 hover:bg-white/10"
      : "h-8 max-w-full rounded-lg text-start text-xs";

  return (
    <div className={cn("mt-2 space-y-2", className)}>
      {products.length ? (
        <div className="space-y-1.5">
          <p className={labelClass}>{t("relatedProducts")}</p>
          <div className="flex flex-col gap-1.5">
            {products.map((link, index) => (
              <AgentProductCard
                key={`product-${link.href}-${index}`}
                link={link}
                tone={tone}
                openLabel={t("openProduct")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {helpLinks.length ? (
        <div className="space-y-1.5">
          <p className={labelClass}>
            {mode === "clarify" ? t("pickOption") : t("relatedLinks")}
          </p>
          <div className="flex flex-col gap-1.5">
            {helpLinks.map((link, index) => (
              <div
                key={`${link.kind}-${link.href}-${index}`}
                className="flex flex-wrap items-center gap-1.5"
              >
                {mode === "clarify" && onPickLink ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 max-w-full rounded-lg text-start text-xs"
                    onClick={() => onPickLink(link)}
                  >
                    {link.kind === "kennisbank" ? (
                      <BookOpen className="me-1 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <HelpCircle className="me-1 h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      {index + 1}. {link.title}
                    </span>
                  </Button>
                ) : null}
                <Button
                  asChild
                  size="sm"
                  variant={mode === "clarify" ? "outline" : "secondary"}
                  className={outlineClass}
                >
                  <SoftLink href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.kind === "kennisbank" ? (
                      <BookOpen className="me-1 h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <HelpCircle className="me-1 h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      {link.kind === "kennisbank" ? t("linkKb") : t("linkFaq")}:{" "}
                      {link.title}
                    </span>
                  </SoftLink>
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {actions?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {actions.includes("domain_register") ? (
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs">
              <SoftLink href={`${localizedHref(locale, "/domeinen")}#register`}>
                <Globe className="me-1 h-3.5 w-3.5" />
                {t("actionDomainRegister")}
              </SoftLink>
            </Button>
          ) : null}
          {actions.includes("domain_transfer") ? (
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs">
              <SoftLink href={`${localizedHref(locale, "/domeinen")}#transfer`}>
                <RefreshCw className="me-1 h-3.5 w-3.5" />
                {t("actionDomainTransfer")}
              </SoftLink>
            </Button>
          ) : null}
          {actions.includes("domain_renew") ? (
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs">
              <SoftLink href={localizedHref(locale, "/my-domains")}>
                <Globe className="me-1 h-3.5 w-3.5" />
                {t("actionDomainRenew")}
              </SoftLink>
            </Button>
          ) : null}
          {actions.includes("book_appointment") ? (
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg text-xs">
              <SoftLink href={localizedHref(locale, "/afspraak")}>
                <Calendar className="me-1 h-3.5 w-3.5" />
                {t("actionBook")}
              </SoftLink>
            </Button>
          ) : null}
          {actions.includes("open_ticket") && onOpenTicket ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-lg text-xs"
              onClick={onOpenTicket}
            >
              <Ticket className="me-1 h-3.5 w-3.5" />
              {t("actionTicket")}
            </Button>
          ) : null}
          {actions.includes("contact") ? (
            <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
              <SoftLink href={localizedHref(locale, "/contact")}>
                <Mail className="me-1 h-3.5 w-3.5" />
                {t("actionContact")}
              </SoftLink>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
