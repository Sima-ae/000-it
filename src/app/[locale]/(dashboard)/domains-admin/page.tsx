"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { centsToEurosNumber } from "@/lib/shop/admin";
import { isSuperAdmin } from "@/lib/roles";
import {
  markupPercentForBuyPriceCents,
  sellPriceCents,
  renewSellPriceCents,
} from "@/lib/domains/pricing";
import { isPremiumTld } from "@/lib/domains/tld-categories";
import { PremiumBadge } from "@/components/domains/PremiumBadge";

type Product = {
  id: string;
  tld: string;
  basePriceInCents: number;
  renewBasePriceInCents: number;
  markupFixedCents: number;
  markupPercent: number;
  offerPriceInCents: number | null;
  manualPricing?: boolean;
  isActive: boolean;
  sellPriceInCents: number;
  effectiveSellPriceInCents: number;
  renewSellPriceInCents: number;
};

type Draft = {
  buy: string;
  renew: string;
  offer: string;
  manual: boolean;
  active: boolean;
};

function parseOfferCents(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const euros = Number(trimmed);
  if (!Number.isFinite(euros) || euros <= 0) return null;
  return Math.round(euros * 100);
}

function parseBuyCents(raw: string): number | null {
  const euros = Number(raw.trim().replace(",", "."));
  if (!Number.isFinite(euros) || euros <= 0) return null;
  return Math.max(1, Math.round(euros * 100));
}

function parseRenewCents(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const euros = Number(trimmed);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

function euroInputFromCents(cents: number) {
  return String(centsToEurosNumber(cents));
}

export default function DomainsAdminPage() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const superAdmin = isSuperAdmin(session?.user?.role);
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
        buy: euroInputFromCents(p.basePriceInCents),
        renew: euroInputFromCents(p.renewBasePriceInCents || 0),
        offer:
          p.offerPriceInCents != null && p.offerPriceInCents > 0
            ? euroInputFromCents(p.offerPriceInCents)
            : "",
        manual: Boolean(p.manualPricing),
        active: p.isActive,
      }
    );
  }

  function previewSell(p: Product, d: Draft) {
    const buy = parseBuyCents(d.buy) ?? p.basePriceInCents;
    const renew = parseRenewCents(d.renew);
    const renewBase =
      renew != null ? renew : p.renewBasePriceInCents || 0;
    const list = sellPriceCents({ basePriceInCents: buy });
    const renewSell = renewSellPriceCents({ renewBasePriceInCents: renewBase });
    const pct = markupPercentForBuyPriceCents(buy);
    return { list, renewSell, pct, buy };
  }

  async function saveTld(tld: string) {
    const p = products.find((x) => x.tld === tld);
    if (!p) return;
    const d = draftFor(p);

    const payload: Record<string, unknown> = {
      tld,
      offerPriceInCents: parseOfferCents(d.offer),
      isActive: d.active,
    };

    if (superAdmin) {
      const buyCents = parseBuyCents(d.buy);
      if (buyCents == null) {
        toast.error("Buy price must be greater than €0");
        return;
      }
      const renewCents = parseRenewCents(d.renew);
      payload.basePriceInCents = buyCents;
      payload.renewBasePriceInCents =
        renewCents != null ? renewCents : buyCents;
      payload.manualPricing = d.manual;
    }

    const res = await fetch("/api/domains/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error || "Save failed");
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
    if (!superAdmin) {
      toast.error("Only SUPER_ADMIN can add TLDs");
      return;
    }
    const tld = newTld.trim().toLowerCase().replace(/^\./, "");
    if (!/^[a-z0-9-]{2,30}$/.test(tld)) {
      toast.error("Enter a valid TLD (e.g. shop or com)");
      return;
    }
    setAdding(true);
    try {
      const buyCents = parseBuyCents(newBuy);
      if (buyCents == null) {
        toast.error("Buy price must be greater than €0");
        return;
      }
      const renewParsed = parseRenewCents(newRenew);
      const renewCents = renewParsed != null ? renewParsed : buyCents;
      const res = await fetch("/api/domains/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tld,
          basePriceInCents: buyCents,
          renewBasePriceInCents: renewCents,
          manualPricing: true,
          isActive: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not add TLD");
      }
      toast.success(`.${tld} added (manual pricing)`);
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
          Supplier buy prices sync nightly. Sell = buy + tiered % (fixed €0).
          SUPER_ADMIN can set buy/renew for TLDs the supplier does not price
          (e.g. .be) — those rows are marked Manual and skipped by sync.
        </p>
      </div>

      {superAdmin ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 px-4 py-2">
            <CardTitle className="text-sm">Add TLD (manual)</CardTitle>
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
                  placeholder="be"
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
              Manual TLDs lock buy/renew against supplier sync. Margin % is
              automatic from buy price.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void syncPrices()}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : "Sync prices now"}
          </Button>
        </div>
      )}

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
              placeholder="Search TLD, e.g. .be"
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
            <table className="w-full min-w-220 border-collapse text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">TLD</th>
                  <th className="py-2 pr-3">Buy €</th>
                  <th className="py-2 pr-3">Renew buy €</th>
                  <th className="py-2 pr-3">% (auto)</th>
                  <th className="py-2 pr-3">Sell</th>
                  <th className="py-2 pr-3">Offer €</th>
                  <th className="py-2 pr-3">Renew sell</th>
                  {superAdmin ? <th className="py-2 pr-3">Manual</th> : null}
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={superAdmin ? 10 : 9}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No TLDs match “{tldSearch.trim()}”
                    </td>
                  </tr>
                ) : null}
                {visibleProducts.map((p) => {
                  const d = draftFor(p);
                  const preview = previewSell(p, d);
                  const draftOfferCents = parseOfferCents(d.offer);
                  const onOffer =
                    draftOfferCents != null &&
                    draftOfferCents > 0 &&
                    draftOfferCents < preview.list;
                  const buyMissing = p.basePriceInCents < 1;
                  const premiumTld = isPremiumTld(preview.list);
                  return (
                    <tr
                      key={p.id}
                      className={
                        buyMissing
                          ? "bg-destructive/5"
                          : premiumTld
                            ? "bg-violet-500/5"
                            : undefined
                      }
                    >
                      <td className="py-2 pr-3 font-semibold">
                        <span className="inline-flex flex-wrap items-center gap-1.5">
                          .{p.tld}
                          {premiumTld ? <PremiumBadge label="Premium TLD" /> : null}
                        </span>
                        {buyMissing ? (
                          <span className="mt-0.5 block text-[10px] font-normal text-destructive">
                            missing buy price
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">
                        {superAdmin ? (
                          <Input
                            className="h-8 w-24"
                            value={d.buy}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [p.tld]: {
                                  ...d,
                                  buy: e.target.value,
                                  manual: true,
                                },
                              }))
                            }
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            €{centsToEurosNumber(p.basePriceInCents).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {superAdmin ? (
                          <Input
                            className="h-8 w-24"
                            value={d.renew}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [p.tld]: {
                                  ...d,
                                  renew: e.target.value,
                                  manual: true,
                                },
                              }))
                            }
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            €
                            {centsToEurosNumber(
                              p.renewBasePriceInCents || 0,
                            ).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-muted-foreground">
                        {preview.pct}%
                      </td>
                      <td className="py-2 pr-3">
                        {onOffer ? (
                          <span className="inline-flex flex-wrap items-baseline gap-x-2">
                            <span className="text-muted-foreground line-through decoration-2">
                              €{centsToEurosNumber(preview.list).toFixed(2)}
                            </span>
                            <span className="text-base font-semibold text-primary">
                              €
                              {centsToEurosNumber(draftOfferCents).toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span className="font-semibold text-primary">
                            €{centsToEurosNumber(preview.list).toFixed(2)}
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
                        €{centsToEurosNumber(preview.renewSell || 0).toFixed(2)}
                      </td>
                      {superAdmin ? (
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            className="text-xs underline"
                            title="When on, supplier sync will not overwrite buy/renew"
                            onClick={() =>
                              setDrafts((prev) => ({
                                ...prev,
                                [p.tld]: { ...d, manual: !d.manual },
                              }))
                            }
                          >
                            <Badge variant={d.manual ? "default" : "secondary"}>
                              {d.manual ? "Manual" : "Sync"}
                            </Badge>
                          </button>
                        </td>
                      ) : null}
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
