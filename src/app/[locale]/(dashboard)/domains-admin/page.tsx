"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
  renewBasePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
  offerPriceInCents: number | null;
  isActive: boolean;
  sellPriceInCents: number;
  effectiveSellPriceInCents: number;
  renewSellPriceInCents: number;
};

type Draft = {
  offer: string;
  active: boolean;
};

function parseOfferCents(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const euros = Number(trimmed);
  if (!Number.isFinite(euros) || euros <= 0) return null;
  return Math.round(euros * 100);
}

export default function DomainsAdminPage() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTld, setNewTld] = useState("");
  const [newBuy, setNewBuy] = useState("10");
  const [newRenew, setNewRenew] = useState("10");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [tldSearch, setTldSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["domains-admin-products"],
    queryFn: async () => {
      const res = await fetch("/api/domains/admin/products");
      if (!res.ok) throw new Error("Failed to load TLDs");
      return (await res.json()) as Product[];
    },
  });

  function draftFor(p: Product): Draft {
    return (
      drafts[p.tld] || {
        offer:
          p.offerPriceInCents != null && p.offerPriceInCents > 0
            ? String(centsToEurosNumber(p.offerPriceInCents))
            : "",
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
        markupFixedCents: 0,
        markupPercent: p.markupPercent,
        offerPriceInCents: parseOfferCents(d.offer),
        isActive: d.active,
      }),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success(`.${tld} updated`);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[tld];
      return next;
    });
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
      const buyCents = Math.max(
        1,
        Math.round(Number(newBuy.replace(",", ".")) * 100),
      );
      const renewRaw = newRenew.trim().replace(",", ".");
      const renewCents = renewRaw
        ? Math.max(0, Math.round(Number(renewRaw) * 100) || 0)
        : buyCents;
      const res = await fetch("/api/domains/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tld,
          basePriceInCents: buyCents,
          renewBasePriceInCents: renewCents,
          markupFixedCents: 0,
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

  const query = tldSearch.trim().toLowerCase().replace(/^\.+/, "");
  const visibleProducts = !query
    ? products
    : products
        .filter((p) => {
          const value = p.tld.toLowerCase();
          return (
            value === query ||
            value.startsWith(query) ||
            value.includes(`.${query}`)
          );
        })
        .sort((a, b) => {
          const rank = (tld: string) => {
            const value = tld.toLowerCase();
            if (value === query) return 0;
            if (value.startsWith(query)) return 1;
            return 2;
          };
          const diff = rank(a.tld) - rank(b.tld);
          return diff !== 0 ? diff : a.tld.localeCompare(b.tld);
        });

  async function syncPrices() {
    setSyncing(true);
    try {
      const res = await fetch("/api/domains/admin/sync", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(
        `Synced ${data.updated ?? 0} updated, ${data.created ?? 0} new TLDs`,
      );
      void qc.invalidateQueries({ queryKey: ["domains-admin-products"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Domains catalog
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Supplier buy prices sync nightly. Sell price = buy + tiered % of buy
          (fixed markup is always €0). Offer € overrides the sell price when set
          (leave empty for no offer).
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 px-4 py-2">
          <CardTitle className="text-sm">Add TLD</CardTitle>
          <Button
            size="sm"
            onClick={() => void syncPrices()}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : "Sync prices now"}
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                TLD
              </label>
              <Input
                className="h-8 w-24"
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
                className="h-8 w-20"
                value={newBuy}
                onChange={(e) => setNewBuy(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Renew buy €
              </label>
              <Input
                className="h-8 w-24"
                value={newRenew}
                onChange={(e) => setNewRenew(e.target.value)}
                placeholder="same as buy"
              />
            </div>
            <Button
              size="sm"
              className="h-8"
              onClick={() => void addTld()}
              disabled={adding}
            >
              {adding ? "Adding…" : "Add TLD"}
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Margin % is automatic from buy price (e.g. ≤ €2 → 40%, ≤ €5 → 35%,
            ≤ €10 → 30%, …). Fixed markup is always €0. Use Buy € / Renew buy €
            for manual TLDs; run Sync to refresh catalog prices from the
            supplier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 px-4 py-2">
          <div className="min-w-0">
            <CardTitle className="text-sm">TLD margins</CardTitle>
            {!isLoading ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {query
                  ? `${visibleProducts.length} of ${products.length}`
                  : `${products.length} TLDs`}
              </p>
            ) : null}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={tldSearch}
              onChange={(e) => setTldSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder="Search TLD, e.g. .nl"
              className="h-8 pl-8"
              aria-label="Search TLDs"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto px-4 pb-3 pt-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <table className="w-full min-w-200 border-collapse text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">TLD</th>
                  <th className="py-2 pr-3">Buy</th>
                  <th className="py-2 pr-3">Renew buy</th>
                  <th className="py-2 pr-3">Fixed €</th>
                  <th className="py-2 pr-3">% (auto)</th>
                  <th className="py-2 pr-3">Sell</th>
                  <th className="py-2 pr-3">Offer €</th>
                  <th className="py-2 pr-3">Renew sell</th>
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No TLDs match “{tldSearch.trim()}”
                    </td>
                  </tr>
                ) : null}
                {visibleProducts.map((p) => {
                  const d = draftFor(p);
                  const draftOfferCents = parseOfferCents(d.offer);
                  const onOffer =
                    draftOfferCents != null &&
                    draftOfferCents > 0 &&
                    draftOfferCents < p.sellPriceInCents;
                  return (
                    <tr key={p.id}>
                      <td className="py-2 pr-3 font-semibold">.{p.tld}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        €{centsToEurosNumber(p.basePriceInCents).toFixed(2)}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        €
                        {centsToEurosNumber(p.renewBasePriceInCents || 0).toFixed(
                          2,
                        )}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">€0.00</td>
                      <td className="py-2 pr-3 tabular-nums text-muted-foreground">
                        {p.markupPercent}%
                      </td>
                      <td className="py-2 pr-3">
                        {onOffer ? (
                          <span className="inline-flex flex-wrap items-baseline gap-x-2">
                            <span className="text-muted-foreground line-through decoration-2">
                              €{centsToEurosNumber(p.sellPriceInCents).toFixed(2)}
                            </span>
                            <span className="text-base font-semibold text-primary">
                              €
                              {centsToEurosNumber(draftOfferCents).toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span className="font-semibold text-primary">
                            €{centsToEurosNumber(p.sellPriceInCents).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          className="h-8 w-24"
                          placeholder="—"
                          value={d.offer}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.tld]: { ...d, offer: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        €
                        {centsToEurosNumber(p.renewSellPriceInCents || 0).toFixed(
                          2,
                        )}
                      </td>
                      <td className="py-2 pr-3">
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
                      <td className="py-2 text-right">
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
