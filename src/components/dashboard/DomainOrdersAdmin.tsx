"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { centsToEurosNumber } from "@/lib/shop/admin";
import { PremiumBadge } from "@/components/domains/PremiumBadge";
import { cn } from "@/lib/utils";

type DomainOrder = {
  id: string;
  orderNumber: string;
  domainName: string;
  years: number;
  orderType?: "REGISTRATION" | "RENEWAL" | "TRANSFER";
  status: "PENDING" | "PAID" | "REGISTERED" | "FAILED";
  totalPriceInCents: number;
  isPremium?: boolean;
  email: string;
  locale: string;
  registrantJson: string;
  namecheapResponse: string | null;
  createdAt: string;
};

const STATUSES = ["ALL", "PENDING", "PAID", "REGISTERED", "FAILED"] as const;
const TYPES = ["ALL", "REGISTRATION", "RENEWAL", "TRANSFER"] as const;

function statusVariant(status: DomainOrder["status"]) {
  if (status === "REGISTERED") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  if (status === "PAID") return "accent" as const;
  return "secondary" as const;
}

export function DomainOrdersAdmin({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const t = useTranslations("domainOrdersAdmin");
  const tDash = useTranslations("dashboard");
  const locale = useLocale();
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [orderType, setOrderType] = useState<(typeof TYPES)[number]>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["domain-orders", status, orderType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (orderType !== "ALL") params.set("orderType", orderType);
      const qs = params.toString() ? `?${params}` : "";
      const res = await fetch(`/api/domains/admin/orders${qs}`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as DomainOrder[];
    },
    refetchInterval: 30_000,
  });

  async function retry(orderId: string) {
    setRetrying(orderId);
    try {
      const res = await fetch("/api/domains/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "retry" }),
      });
      if (!res.ok) {
        toast.error(t("retryFailed"));
        return;
      }
      toast.success(t("retryOk"));
      void qc.invalidateQueries({ queryKey: ["domain-orders"] });
    } finally {
      setRetrying(null);
    }
  }

  const active = orders.find((o) => o.id === openId) || null;

  function typeLabel(type?: string) {
    switch (type) {
      case "RENEWAL":
        return t("typeRENEWAL");
      case "TRANSFER":
        return t("typeTRANSFER");
      case "REGISTRATION":
      default:
        return t("typeREGISTRATION");
    }
  }

  function statusLabel(s: string) {
    switch (s) {
      case "PENDING":
        return t("statusPENDING");
      case "PAID":
        return t("statusPAID");
      case "REGISTERED":
        return t("statusREGISTERED");
      case "FAILED":
        return t("statusFAILED");
      default:
        return s;
    }
  }

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {tDash("domainOrders")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setStatus(s)}
          >
            {s === "ALL" ? t("filterAll") : statusLabel(s)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={orderType === s ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setOrderType(s)}
          >
            {s === "ALL" ? t("filterAllTypes") : typeLabel(s)}
          </Button>
        ))}
      </div>

      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : !orders.length ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <table className="w-full min-w-180 border-collapse text-start text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pe-3">{t("colOrder")}</th>
                  <th className="py-2 pe-3">{t("colType")}</th>
                  <th className="py-2 pe-3">{t("colDomain")}</th>
                  <th className="py-2 pe-3">{t("colCustomer")}</th>
                  <th className="py-2 pe-3">{t("colTotal")}</th>
                  <th className="py-2 pe-3">{t("colStatus")}</th>
                  <th className="py-2 text-end">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pe-3 font-mono text-xs">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 pe-3 text-xs">
                      {typeLabel(o.orderType)}
                    </td>
                    <td className="py-3 pe-3">
                      <span className="inline-flex flex-wrap items-center gap-1.5 font-medium">
                        {o.domainName}
                        {o.isPremium ? <PremiumBadge /> : null}
                      </span>
                    </td>
                    <td className="py-3 pe-3 text-muted-foreground">{o.email}</td>
                    <td className="py-3 pe-3 font-semibold tabular-nums">
                      €{centsToEurosNumber(o.totalPriceInCents).toFixed(2)}
                      {o.isPremium ? (
                        <span className="mt-0.5 block text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          {t("premiumPrice")}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pe-3">
                      <Badge variant={statusVariant(o.status)}>
                        {statusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-end">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => setOpenId(o.id)}
                        >
                          <Eye className="me-1 h-3.5 w-3.5" />
                          {t("view")}
                        </Button>
                        {(o.status === "FAILED" || o.status === "PAID") && (
                          <Button
                            size="sm"
                            className="rounded-xl"
                            disabled={retrying === o.id}
                            onClick={() => void retry(o.id)}
                          >
                            <RotateCcw className="me-1 h-3.5 w-3.5" />
                            {t("retry")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="w-[min(96vw,40rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-5 py-4 pe-14">
            <DialogTitle className="inline-flex flex-wrap items-center gap-2 text-xl">
              {active?.domainName}
              {active?.isPremium ? <PremiumBadge /> : null}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {active?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {active ? (
            <div className="max-h-[min(70vh,560px)] space-y-3 overflow-y-auto px-5 py-4 text-sm">
              <p>
                <span className="text-muted-foreground">{t("colTotal")}: </span>
                <span className="font-semibold tabular-nums">
                  €{centsToEurosNumber(active.totalPriceInCents).toFixed(2)}
                </span>
                {active.isPremium ? (
                  <span className="ms-2 text-violet-700 dark:text-violet-300">
                    ({t("premiumPrice")})
                  </span>
                ) : null}
              </p>
              <p>
                <span className="text-muted-foreground">{t("years")}: </span>
                {active.years}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colType")}: </span>
                {typeLabel(active.orderType)}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colStatus")}: </span>
                {statusLabel(active.status)}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colCustomer")}: </span>
                {active.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(active.createdAt).toLocaleString(locale)}
              </p>
              <pre className="overflow-x-auto rounded-xl bg-muted/40 p-3 text-xs">
                {JSON.stringify(
                  JSON.parse(active.registrantJson || "{}"),
                  null,
                  2,
                )}
              </pre>
              {active.namecheapResponse ? (
                <pre
                  className={cn(
                    "max-h-64 overflow-auto rounded-xl bg-muted/40 p-3 text-xs whitespace-pre-wrap",
                  )}
                >
                  {active.namecheapResponse}
                </pre>
              ) : null}
            </div>
          ) : null}
          <DialogFooter className="border-t border-border/60 px-5 py-4">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpenId(null)}
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
