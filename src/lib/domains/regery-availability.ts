/**
 * Regery domain availability (partner API) + RDAP fallback.
 *
 * Namecheap cannot check Regery-only / manual TLDs — those must use this path.
 * Auth: https://api.regery.com with Authorization: API_KEY:API_SECRET
 * Docs: POST /v1/domains/availability (no mixing TLDs in one request)
 */

import type { DomainCheckResult } from "@/lib/domains/namecheap";

export function isRegeryApiConfigured(): boolean {
  return Boolean(
    process.env.REGERY_API_KEY?.trim() && process.env.REGERY_API_SECRET?.trim(),
  );
}

function emptyCheck(domain: string, available: boolean, error?: string): DomainCheckResult {
  return {
    domain: domain.toLowerCase(),
    available,
    isPremium: false,
    premiumRegistrationUsd: 0,
    premiumRenewalUsd: 0,
    premiumTransferUsd: 0,
    icannFeeUsd: 0,
    eapFeeUsd: 0,
    error,
  };
}

type RegeryAvailabilityRow = {
  domain?: string;
  result?: string;
  premium?: boolean | null;
  source?: string;
};

function tldOf(domain: string): string {
  const parts = domain.toLowerCase().split(".");
  return parts.length >= 2 ? parts.slice(1).join(".") : "";
}

async function checkRegeryBatchSameTld(
  domains: string[],
): Promise<DomainCheckResult[]> {
  const key = process.env.REGERY_API_KEY!.trim();
  const secret = process.env.REGERY_API_SECRET!.trim();
  const res = await fetch("https://api.regery.com/v1/domains/availability", {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `${key}:${secret}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; TripleZeroIT-DomainCheck/1.0)",
    },
    body: JSON.stringify({ domains }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `REGERY_AVAILABILITY_HTTP_${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
    );
  }

  const data = (await res.json()) as unknown;
  const list = Array.isArray(data)
    ? (data as RegeryAvailabilityRow[])
    : Array.isArray((data as { results?: unknown })?.results)
      ? ((data as { results: RegeryAvailabilityRow[] }).results)
      : null;
  if (!list) {
    throw new Error("REGERY_AVAILABILITY_BAD_PAYLOAD");
  }

  const byDomain = new Map<string, DomainCheckResult>();
  for (const row of list) {
    const domain = String(row.domain || "").toLowerCase();
    if (!domain) continue;
    const result = String(row.result || "").toLowerCase();
    const available = result === "available";
    const error =
      result === "error" ||
      result === "notsupported" ||
      result === "ratelimit" ||
      result === "restricted"
        ? result
        : undefined;
    byDomain.set(domain, {
      ...emptyCheck(domain, available && !error, error),
      isPremium: Boolean(row.premium),
    });
  }

  return domains.map(
    (d) =>
      byDomain.get(d.toLowerCase()) ??
      emptyCheck(d, false, "REGERY_NO_RESULT"),
  );
}

/**
 * Check availability via Regery partner API.
 * Groups by TLD (API forbids mixing TLDs in one request).
 */
export async function checkDomainsRegery(
  domains: string[],
): Promise<DomainCheckResult[]> {
  if (!isRegeryApiConfigured()) {
    throw new Error("REGERY_NOT_CONFIGURED");
  }
  const list = [
    ...new Set(domains.map((d) => d.toLowerCase().trim()).filter(Boolean)),
  ];
  if (!list.length) return [];

  const byTld = new Map<string, string[]>();
  for (const domain of list) {
    const tld = tldOf(domain);
    if (!tld) continue;
    const bucket = byTld.get(tld) || [];
    bucket.push(domain);
    byTld.set(tld, bucket);
  }

  const out: DomainCheckResult[] = [];
  const groups = [...byTld.values()];
  const concurrency = Math.min(4, groups.length);
  let cursor = 0;

  async function worker() {
    while (cursor < groups.length) {
      const idx = cursor++;
      const group = groups[idx]!;
      try {
        // Chunk oversized same-TLD batches
        for (let i = 0; i < group.length; i += 20) {
          const chunk = group.slice(i, i + 20);
          out.push(...(await checkRegeryBatchSameTld(chunk)));
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "REGERY_CHECK_FAILED";
        for (const domain of group) {
          out.push(emptyCheck(domain, false, msg));
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

/**
 * RDAP availability heuristic (no partner credentials).
 * 404 / not found → available; 200 with domain object → taken.
 */
export async function checkDomainRdap(domain: string): Promise<DomainCheckResult> {
  const d = domain.toLowerCase().trim();
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        Accept: "application/rdap+json, application/json",
        "User-Agent": "Mozilla/5.0 (compatible; TripleZeroIT-DomainCheck/1.0)",
      },
    });

    if (res.status === 404 || res.status === 400) {
      return emptyCheck(d, true);
    }
    if (res.status === 200) {
      const body = (await res.json().catch(() => null)) as {
        errorCode?: string;
        title?: string;
        ldhName?: string;
        handle?: string;
      } | null;
      // Some RDAP servers return 200 with an error object for unknown names
      if (
        body &&
        (body.errorCode === "404" ||
          /not found|notfound/i.test(String(body.title || "")))
      ) {
        return emptyCheck(d, true);
      }
      if (body && (body.ldhName || body.handle)) {
        return emptyCheck(d, false);
      }
      // Ambiguous 200 — fall through to DNS
    }
  } catch {
    // fall through to DNS
  }

  return checkDomainDns(d);
}

async function checkDomainDns(domain: string): Promise<DomainCheckResult> {
  try {
    const dns = await import("node:dns/promises");
    const resolver = new dns.Resolver();
    resolver.setServers(["1.1.1.1", "8.8.8.8"]);

    const nx = (err: unknown) => {
      const code = (err as NodeJS.ErrnoException)?.code;
      return code === "ENOTFOUND" || code === "ENODATA";
    };

    try {
      const ns = await resolver.resolveNs(domain);
      if (ns.length) return emptyCheck(domain, false);
    } catch (err) {
      if (!nx(err) && (err as NodeJS.ErrnoException)?.code !== "ESERVFAIL") {
        // keep trying other record types
      }
    }

    try {
      await resolver.resolve4(domain);
      return emptyCheck(domain, false);
    } catch (err) {
      if (!nx(err)) {
        /* continue */
      }
    }

    try {
      await resolver.resolveSoa(domain);
      return emptyCheck(domain, false);
    } catch (err) {
      if (nx(err)) return emptyCheck(domain, true);
    }

    // No authoritative records found → treat as available for catalog search
    return emptyCheck(domain, true);
  } catch (error) {
    return emptyCheck(
      domain,
      false,
      error instanceof Error ? error.message : "DNS_CHECK_FAILED",
    );
  }
}

/** Check many domains via RDAP (+ DNS fallback), with modest concurrency. */
export async function checkDomainsRdap(
  domains: string[],
): Promise<DomainCheckResult[]> {
  const list = [
    ...new Set(domains.map((d) => d.toLowerCase().trim()).filter(Boolean)),
  ];
  if (!list.length) return [];

  const out: DomainCheckResult[] = new Array(list.length);
  const concurrency = Math.min(6, list.length);
  let cursor = 0;

  async function worker() {
    while (cursor < list.length) {
      const idx = cursor++;
      const domain = list[idx]!;
      out[idx] = await checkDomainRdap(domain);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

/**
 * Preferred availability path for Regery / manual catalog TLDs:
 * Regery API when configured, otherwise RDAP/DNS.
 */
export async function checkDomainsForManualTlds(
  domains: string[],
): Promise<DomainCheckResult[]> {
  if (!domains.length) return [];
  if (isRegeryApiConfigured()) {
    const rows = await checkDomainsRegery(domains);
    // Re-check rows that failed API with RDAP so we don't mark everything unavailable
    const needFallback = rows.filter(
      (r) =>
        r.error &&
        !r.available &&
        (r.error.startsWith("REGERY_") ||
          r.error === "error" ||
          r.error === "ratelimit"),
    );
    if (!needFallback.length) return rows;
    const fallback = await checkDomainsRdap(needFallback.map((r) => r.domain));
    const byDomain = new Map(fallback.map((r) => [r.domain, r] as const));
    return rows.map((r) => byDomain.get(r.domain) ?? r);
  }
  return checkDomainsRdap(domains);
}
