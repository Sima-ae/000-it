"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useStatusI18n } from "@/hooks/useStatusI18n";
import { useQuery } from "@tanstack/react-query";
import { Download, Globe, Server, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { CrmShell } from "@/components/crm/CrmShell";
import { SoftLink } from "@/components/shared/SoftLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedHref } from "@/i18n/pathnames";
import { formatShopEuro } from "@/lib/shop/vat";
import { cn } from "@/lib/utils";

type ShopItem = {
  id: string;
  name: string;
  quantity: number;
  unitPriceIncl: number;
  productId: string;
};

type ShopOrder = {
  id: string;
  orderNumber: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  lineOfBusiness: "SERVICE" | "HOSTING";
  totalIncl: number;
  currency: string;
  createdAt: string;
  items: ShopItem[];
};

type DomainOrder = {
  id: string;
  orderNumber: string;
  domainName: string;
  years: number;
  orderType: string;
  status: "PENDING" | "PAID" | "REGISTERED" | "FAILED";
  totalPriceInCents: number;
  createdAt: string;
};

type PortalOrders = {
  shopOrders: ShopOrder[];
  domainOrders: DomainOrder[];
  counts: { services: number; hosting: number; domains: number; paid: number };
};

type Tab = "services" | "hosting" | "domains";

function statusClass(status: string) {
  switch (status) {
    case "PAID":
    case "REGISTERED":
      return "border-transparent bg-accent/15 text-accent";
    case "PENDING":
      return "border-transparent bg-orange-500/15 text-orange-600";
    case "FAILED":
    case "CANCELLED":
      return "border-transparent bg-destructive/15 text-destructive";
    default:
      return "";
  }
}

function orderStatusLabel(
  t: (
    key:
      | "orderStatus_PENDING"
      | "orderStatus_PAID"
      | "orderStatus_FAILED"
      | "orderStatus_CANCELLED"
      | "orderStatus_REGISTERED",
  ) => string,
  status: string,
) {
  switch (status) {
    case "PENDING":
      return t("orderStatus_PENDING");
    case "PAID":
      return t("orderStatus_PAID");
    case "FAILED":
      return t("orderStatus_FAILED");
    case "CANCELLED":
      return t("orderStatus_CANCELLED");
    case "REGISTERED":
      return t("orderStatus_REGISTERED");
    default:
      return status.replaceAll("_", " ");
  }
}

function canDownloadShop(status: ShopOrder["status"]) {
  return status === "PAID";
}

function canDownloadDomain(status: DomainOrder["status"]) {
  return status !== "PENDING";
}

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

async function downloadInvoice(id: string, type: "shop" | "domain") {
  const res = await fetch(`/api/portal/orders/${id}/invoice?type=${type}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Download failed");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] || `invoice-${id}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function MyOrdersPage() {
  const t = useTranslations("dashboard");
  const status = useStatusI18n();
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("services");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["portal-orders"],
    queryFn: async () => {
      const res = await fetch("/api/portal/orders");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as PortalOrders;
    },
  });

  const serviceOrders = useMemo(
    () => (data?.shopOrders || []).filter((o) => o.lineOfBusiness === "SERVICE"),
    [data],
  );
  const hostingOrders = useMemo(
    () => (data?.shopOrders || []).filter((o) => o.lineOfBusiness === "HOSTING"),
    [data],
  );
  const domainOrders = data?.domainOrders || [];

  const tabs: { id: Tab; label: string; count: number; icon: typeof ShoppingBag }[] = [
    {
      id: "services",
      label: t("portalServices"),
      count: data?.counts.services ?? serviceOrders.length,
      icon: ShoppingBag,
    },
    {
      id: "hosting",
      label: t("portalHosting"),
      count: data?.counts.hosting ?? hostingOrders.length,
      icon: Server,
    },
    {
      id: "domains",
      label: t("portalDomains"),
      count: data?.counts.domains ?? domainOrders.length,
      icon: Globe,
    },
  ];

  async function onDownload(id: string, type: "shop" | "domain") {
    setDownloading(id);
    try {
      await downloadInvoice(id, type);
      toast.success(t("pdfDownloaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("pdfDownloadFailed"));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <CrmShell title={t("myOrders")} subtitle={t("myOrdersSubtitle")}>
      <p className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {t("ordersCrmInvoicesHint")}{" "}
        <SoftLink
          href={localizedHref(locale, "/crm/invoices")}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          {t("invoices")}
        </SoftLink>
        .
      </p>

      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-muted/20 p-1.5">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-background hover:text-foreground md:text-sm",
                active && "bg-background text-foreground shadow-sm",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
              <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loadingOrders")}</p>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
            <p className="text-sm text-muted-foreground">{t("ordersLoadFailed")}</p>
            <Button onClick={() => void refetch()} disabled={isFetching}>
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      ) : tab === "domains" ? (
        <div className="space-y-3">
          {!domainOrders.length ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                {t("emptyOrders")}
              </CardContent>
            </Card>
          ) : (
            domainOrders.map((order) => (
              <Card key={order.id} className="border-border/80 bg-card/60">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {order.orderNumber}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.domainName} · {status.orderType(order.orderType)} ·{" "}
                      {order.years} {order.years === 1 ? t("year") : t("years")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusClass(order.status)} variant="outline">
                      {orderStatusLabel(t, order.status)}
                    </Badge>
                    <p className="font-display text-lg font-semibold tabular-nums">
                      {formatShopEuro(order.totalPriceInCents / 100, locale)}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-end pt-0">
                  {canDownloadDomain(order.status) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloading === order.id}
                      onClick={() => void onDownload(order.id, "domain")}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      {downloading === order.id ? "…" : t("downloadPdf")}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(tab === "services" ? serviceOrders : hostingOrders).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                {t("emptyOrders")}
              </CardContent>
            </Card>
          ) : (
            (tab === "services" ? serviceOrders : hostingOrders).map((order) => (
              <Card key={order.id} className="border-border/80 bg-card/60">
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {order.orderNumber}
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusClass(order.status)} variant="outline">
                      {orderStatusLabel(t, order.status)}
                    </Badge>
                    <p className="font-display text-lg font-semibold tabular-nums">
                      {formatShopEuro(order.totalIncl, locale)}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {formatShopEuro(item.unitPriceIncl * item.quantity, locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end">
                    {canDownloadShop(order.status) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloading === order.id}
                        onClick={() => void onDownload(order.id, "shop")}
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        {downloading === order.id ? "…" : t("downloadPdf")}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </CrmShell>
  );
}
