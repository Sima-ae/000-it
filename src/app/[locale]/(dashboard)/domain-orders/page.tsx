"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { centsToEurosNumber } from "@/lib/shop/admin";

type DomainOrder = {
  id: string;
  orderNumber: string;
  domainName: string;
  years: number;
  status: "PENDING" | "PAID" | "REGISTERED" | "FAILED";
  totalPriceInCents: number;
  email: string;
  locale: string;
  registrantJson: string;
  namecheapResponse: string | null;
  createdAt: string;
};

const STATUSES = ["ALL", "PENDING", "PAID", "REGISTERED", "FAILED"] as const;

export default function DomainOrdersPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["domain-orders", status],
    queryFn: async () => {
      const qs =
        status === "ALL" ? "" : `?status=${encodeURIComponent(status)}`;
      const res = await fetch(`/api/domains/admin/orders${qs}`);
      if (!res.ok) throw new Error("Failed to load domain orders");
      return (await res.json()) as DomainOrder[];
    },
  });

  async function retry(orderId: string) {
    const res = await fetch("/api/domains/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "retry" }),
    });
    if (!res.ok) {
      toast.error("Retry failed");
      return;
    }
    toast.success("Retry completed");
    void qc.invalidateQueries({ queryKey: ["domain-orders"] });
  }

  const active = orders.find((o) => o.id === openId) || null;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Domain orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registrations paid via Stripe and fulfilled at Namecheap. Separate
          from service and hosting orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !orders.length ? (
            <p className="text-sm text-muted-foreground">No domain orders yet.</p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Order</th>
                  <th className="py-2 pr-3">Domain</th>
                  <th className="py-2 pr-3">Customer</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-3 font-mono text-xs">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 pr-3 font-medium">{o.domainName}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{o.email}</td>
                    <td className="py-3 pr-3">
                      €{centsToEurosNumber(o.totalPriceInCents).toFixed(2)}
                    </td>
                    <td className="py-3 pr-3">
                      <Badge
                        variant={
                          o.status === "REGISTERED"
                            ? "success"
                            : o.status === "FAILED"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenId(o.id)}
                      >
                        View
                      </Button>
                      {(o.status === "FAILED" || o.status === "PAID") && (
                        <Button size="sm" onClick={() => void retry(o.id)}>
                          Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {active ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {active.domainName} · {active.orderNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Years:</span>{" "}
              {active.years}
            </p>
            <pre className="overflow-x-auto rounded-xl bg-muted/40 p-3 text-xs">
              {JSON.stringify(JSON.parse(active.registrantJson || "{}"), null, 2)}
            </pre>
            {active.namecheapResponse ? (
              <pre className="max-h-64 overflow-auto rounded-xl bg-muted/40 p-3 text-xs whitespace-pre-wrap">
                {active.namecheapResponse}
              </pre>
            ) : null}
            <Button variant="outline" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
