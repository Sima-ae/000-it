/**
 * Regery public domain price catalog (EUR).
 * Source: https://regery.com/api/v1/rg/contracts/GetDomains1YrPriceInfoByCurrency
 *
 * Used ONLY for DomainProduct rows with manualPricing=true.
 * Never apply these prices to Namecheap-synced TLDs.
 */

export type RegeryPriceRow = {
  tld: string;
  registerCents: number;
  renewCents: number;
  transferCents: number;
  restoreCents: number;
};

type RegeryApiPrice = {
  Start?: number | null;
  Final?: number | null;
};

type RegeryApiProduct = {
  Product?: string;
  System?: string;
  Currency?: number | string;
  PricePurchase?: RegeryApiPrice | null;
  PriceRenew?: RegeryApiPrice | null;
  PriceTransfer?: RegeryApiPrice | null;
  PriceRestore?: RegeryApiPrice | null;
};

function finalCents(price: RegeryApiPrice | null | undefined): number {
  if (!price) return 0;
  const raw = price.Final;
  if (raw == null) return 0;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function isValidTldName(tld: string): boolean {
  return (
    tld.length >= 2 &&
    tld.length <= 63 &&
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(
      tld,
    )
  );
}

/** Fetch live Regery 1-year domain prices in EUR. */
export async function fetchRegeryDomainPrices(): Promise<RegeryPriceRow[]> {
  const urls = [
    "https://regery.com/api/v1/rg/contracts/GetDomains1YrPriceInfoByCurrency?currency=Eur",
    "https://regery.com/api/v1/rg/contracts/GetDomains1YrPriceInfoByCurrency?currency=Eur&serviceDomain=regery.com",
    "https://regery.com/api/v1/rg/contracts/getdomains1yrpriceinfobycurrency?currency=2&serviceDomain=regery.com",
  ];

  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (compatible; TripleZeroIT-DomainPriceSync/1.0)",
        },
      });
      if (!res.ok) {
        lastError = new Error(`REGERY_PRICES_HTTP_${res.status}`);
        continue;
      }
      const data = (await res.json()) as unknown;
      const rows = parseRegeryPayload(data);
      if (rows.length >= 100) return rows;
      lastError = new Error(
        `REGERY_PRICES_TOO_FEW — got ${rows.length} priced TLDs from ${url}`,
      );
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("REGERY_PRICES_FETCH_FAILED");
}

function parseRegeryPayload(data: unknown): RegeryPriceRow[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray((data as { products?: unknown })?.products)
      ? ((data as { products: unknown[] }).products as unknown[])
      : Array.isArray((data as { Products?: unknown })?.Products)
        ? ((data as { Products: unknown[] }).Products as unknown[])
        : null;
  if (!list) return [];

  const out: RegeryPriceRow[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const row = item as RegeryApiProduct & {
      product?: string;
      system?: string;
      pricePurchase?: RegeryApiPrice | null;
      priceRenew?: RegeryApiPrice | null;
      priceTransfer?: RegeryApiPrice | null;
      priceRestore?: RegeryApiPrice | null;
    };
    const tld = String(
      row.System || row.Product || row.system || row.product || "",
    )
      .toLowerCase()
      .replace(/^\./, "");
    if (!isValidTldName(tld) || seen.has(tld)) continue;
    seen.add(tld);
    const registerCents = finalCents(row.PricePurchase ?? row.pricePurchase);
    if (registerCents <= 0) continue;
    const renewCents =
      finalCents(row.PriceRenew ?? row.priceRenew) || registerCents;
    out.push({
      tld,
      registerCents,
      renewCents,
      transferCents: finalCents(row.PriceTransfer ?? row.priceTransfer),
      restoreCents: finalCents(row.PriceRestore ?? row.priceRestore),
    });
  }
  return out;
}
