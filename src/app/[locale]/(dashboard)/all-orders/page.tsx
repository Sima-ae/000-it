"use client";

import { Suspense } from "react";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Globe, Server, ShoppingBag } from "lucide-react";
import { ShopOrdersAdmin } from "@/components/dashboard/ShopOrdersAdmin";
import { DomainOrdersAdmin } from "@/components/dashboard/DomainOrdersAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { formatShopEuro } from "@/lib/shop/vat";
import { centsToEurosNumber } from "@/lib/shop/admin";
import { cn } from "@/lib/utils";

type TabId = "services" | "hosting" | "domains";

type ShopOrder = {
  status: string;
  totalIncl: number;
};

type DomainOrder = {
  status: string;
  totalPriceInCents: number;
};

const TABS: { id: TabId; icon: typeof ShoppingBag }[] = [
  { id: "services", icon: ShoppingBag },
  { id: "domains", icon: Globe },
  { id: "hosting", icon: Server },
];

function parseTab(raw: string | null): TabId {
  if (raw === "hosting" || raw === "domains" || raw === "services") return raw;
  return "services";
}

function AllOrdersContent() {
  const t = useTranslations("allOrders");
  const tDash = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const { data: serviceOrders = [] } = useQuery({
    queryKey: ["shop-orders", "SERVICE"],
    queryFn: async () => {
      const res = await fetch("/api/shop/orders?lineOfBusiness=SERVICE");
      if (!res.ok) return [] as ShopOrder[];
      return (await res.json()) as ShopOrder[];
    },
  });

  const { data: hostingOrders = [] } = useQuery({
    queryKey: ["shop-orders", "HOSTING"],
    queryFn: async () => {
      const res = await fetch("/api/shop/orders?lineOfBusiness=HOSTING");
      if (!res.ok) return [] as ShopOrder[];
      return (await res.json()) as ShopOrder[];
    },
  });

  const { data: domainOrders = [] } = useQuery({
    queryKey: ["domain-orders-summary"],
    queryFn: async () => {
      const res = await fetch("/api/domains/admin/orders");
      if (!res.ok) return [] as DomainOrder[];
      return (await res.json()) as DomainOrder[];
    },
  });

  const summary = useMemo(() => {
    const shopPaid = [...serviceOrders, ...hostingOrders].filter(
      (o) => o.status === "PAID",
    );
    const shopPending = [...serviceOrders, ...hostingOrders].filter(
      (o) => o.status === "PENDING",
    );
    const domainPaid = domainOrders.filter(
      (o) => o.status === "PAID" || o.status === "REGISTERED",
    );
    const domainPending = domainOrders.filter((o) => o.status === "PENDING");
    const shopRevenue = shopPaid.reduce((s, o) => s + (o.totalIncl || 0), 0);
    const domainRevenue = domainPaid.reduce(
      (s, o) => s + centsToEurosNumber(o.totalPriceInCents || 0),
      0,
    );
    return {
      total:
        serviceOrders.length + hostingOrders.length + domainOrders.length,
      services: serviceOrders.length,
      hosting: hostingOrders.length,
      domains: domainOrders.length,
      pending: shopPending.length + domainPending.length,
      paid: shopPaid.length + domainPaid.length,
      revenue: shopRevenue + domainRevenue,
    };
  }, [serviceOrders, hostingOrders, domainOrders]);

  function setTab(next: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const tabLabel = (id: TabId) => {
    if (id === "services") return t("tabServices");
    if (id === "hosting") return t("tabHosting");
    return t("tabDomains");
  };

  const tabCount = (id: TabId) => {
    if (id === "services") return summary.services;
    if (id === "hosting") return summary.hosting;
    return summary.domains;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-primary">
            <ClipboardList className="h-3.5 w-3.5" />
            {tDash("allOrders")}
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: t("statTotal"), value: String(summary.total) },
          { label: t("statServices"), value: String(summary.services) },
          { label: t("statHosting"), value: String(summary.hosting) },
          { label: t("statDomains"), value: String(summary.domains) },
          { label: t("statPending"), value: String(summary.pending) },
          {
            label: t("statRevenue"),
            value: formatShopEuro(summary.revenue, locale),
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/70">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border/70 bg-muted/20 p-1.5">
        {TABS.map(({ id, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition md:text-sm",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tabLabel(id)}
              <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">
                {tabCount(id)}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {tab === "services" ? (
          <ShopOrdersAdmin lineOfBusiness="SERVICE" embedded />
        ) : null}
        {tab === "hosting" ? (
          <ShopOrdersAdmin lineOfBusiness="HOSTING" embedded />
        ) : null}
        {tab === "domains" ? <DomainOrdersAdmin embedded /> : null}
      </div>
    </div>
  );
}

export default function AllOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AllOrdersContent />
    </Suspense>
  );
}
