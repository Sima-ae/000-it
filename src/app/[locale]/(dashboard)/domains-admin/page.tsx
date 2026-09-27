"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { centsToEurosNumber } from "@/lib/shop/admin";

type Product = {
  id: string;
  tld: string;
  basePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
  isActive: boolean;
  sellPriceInCents: number;
};

export default function DomainsAdminPage() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTld, setNewTld] = useState("");
  const [newBuy, setNewBuy] = useState("10");
  const [newFixed, setNewFixed] = useState("5");
  const [newPercent, setNewPercent] = useState("0");
  const [drafts, setDrafts] = useState<
    Record<string, { fixed: string; percent: string; active: boolean }>
  >({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["domains-admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/domains/admin/products");
      if (!res.ok) throw new Error("Failed to load TLDs");
      return (await res.json()) as Product[];
    },
  });

  function draftFor(p: Product) {
    return (
      drafts[p.tld] || {
        fixed: String(centsToEurosNumber(p.markupFixedCents)),
        percent: String(p.markupPercent),
        active: p.isActive,
      }
    );
  }

  async function saveTld(tld: string) {
    const p = products.find((x) => x.tld === tld);
    if (!p) return;
    const d = draftFor(p);
    const res = await fetch("/api/domains/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tld,
        markupFixedCents: Math.round(Number(d.fixed.replace(",", ".")) * 100),
        markupPercent: Number(d.percent.replace(",", ".")),
        isActive: d.active,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success(`.${tld} updated`);
    void qc.invalidateQueries({ queryKey: ["domains-admin-products"] });
  }

  async function addTld() {
    const tld = newTld.trim().toLowerCase().replace(/^\./, "");
    if (!/^[a-z0-9-]{2,30}$/.test(tld)) {
      toast.error("Enter a valid TLD (e.g. shop or com)");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/domains/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tld,
          basePriceInCents: Math.max(
            1,
            Math.round(Number(newBuy.replace(",", ".")) * 100),
          ),
          markupFixedCents: Math.max(
            0,
            Math.round(Number(newFixed.replace(",", ".")) * 100),
          ),
          markupPercent: Math.max(0, Number(newPercent.replace(",", ".")) || 0),
          isActive: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not add TLD");
      }
      toast.success(`.${tld} added`);
      setNewTld("");
      void qc.invalidateQueries({ queryKey: ["domains-admin-products"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Add failed");
    } finally {
      setAdding(false);
    }
  }

  async function syncPrices() {
    setSyncing(true);
    try {
      const res = await fetch("/api/cron/domain-prices", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`Synced ${data.updated ?? 0} TLDs`);
      void qc.invalidateQueries({ queryKey: ["domains-admin-products"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Domains catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Namecheap buy prices sync nightly. Set markups for the public sell
            price (incl. VAT). Fixed € is a flat markup; % is of the buy price.
          </p>
        </div>
        <Button onClick={() => void syncPrices()} disabled={syncing}>
          {syncing ? "Syncing…" : "Sync prices now"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add TLD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                TLD
              </label>
              <Input
                className="h-9 w-28"
                placeholder="shop"
                value={newTld}
                onChange={(e) => setNewTld(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Buy €
              </label>
              <Input
                className="h-9 w-24"
                value={newBuy}
                onChange={(e) => setNewBuy(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Fixed €
              </label>
              <Input
                className="h-9 w-24"
                value={newFixed}
                onChange={(e) => setNewFixed(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                %
              </label>
              <Input
                className="h-9 w-20"
                value={newPercent}
                onChange={(e) => setNewPercent(e.target.value)}
              />
            </div>
            <Button onClick={() => void addTld()} disabled={adding}>
              {adding ? "Adding…" : "Add TLD"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            After adding, run Sync to refresh the buy price from Namecheap when
            that TLD is in their pricing feed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">TLD margins</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <table className="w-full min-w-160 border-collapse text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">TLD</th>
                  <th className="py-2 pr-3">Buy</th>
                  <th className="py-2 pr-3">Fixed €</th>
                  <th className="py-2 pr-3">%</th>
                  <th className="py-2 pr-3">Sell</th>
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const d = draftFor(p);
                  return (
                    <tr key={p.id}>
                      <td className="py-3 pr-3 font-semibold">.{p.tld}</td>
                      <td className="py-3 pr-3 text-muted-foreground">
                        €{centsToEurosNumber(p.basePriceInCents).toFixed(2)}
                      </td>
                      <td className="py-3 pr-3">
                        <Input
                          className="h-8 w-20"
                          value={d.fixed}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.tld]: { ...d, fixed: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <Input
                          className="h-8 w-20"
                          value={d.percent}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.tld]: { ...d, percent: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="py-3 pr-3 font-semibold text-primary">
                        €{centsToEurosNumber(p.sellPriceInCents).toFixed(2)}
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          className="text-xs underline"
                          onClick={() =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.tld]: { ...d, active: !d.active },
                            }))
                          }
                        >
                          <Badge variant={d.active ? "default" : "secondary"}>
                            {d.active ? "On" : "Off"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" onClick={() => void saveTld(p.tld)}>
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
