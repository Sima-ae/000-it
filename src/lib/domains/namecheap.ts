import { parseStringPromise } from "xml2js";

function env(name: string) {
  return (process.env[name] || "").trim();
}

export function isNamecheapConfigured() {
  return Boolean(
    env("NAMECHEAP_USER") && env("NAMECHEAP_API_KEY") && env("NAMECHEAP_CLIENT_IP"),
  );
}

function apiBase() {
  return env("NAMECHEAP_SANDBOX") === "1"
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response";
}

function baseParams(command: string): URLSearchParams {
  const user = env("NAMECHEAP_USER");
  const key = env("NAMECHEAP_API_KEY");
  const ip = env("NAMECHEAP_CLIENT_IP");
  const params = new URLSearchParams({
    ApiUser: user,
    ApiKey: key,
    UserName: user,
    ClientIp: ip,
    Command: command,
  });
  return params;
}

async function callNamecheap(params: URLSearchParams) {
  const url = `${apiBase()}?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store", method: "GET" });
  const xml = await res.text();
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });
  return { xml, parsed };
}

function apiStatus(parsed: Record<string, unknown>): string {
  const root = parsed.ApiResponse as Record<string, unknown> | undefined;
  return String(root?.Status || "");
}

function apiErrors(parsed: Record<string, unknown>): string {
  const root = parsed.ApiResponse as Record<string, unknown> | undefined;
  const errors = root?.Errors;
  if (!errors) return "";
  return typeof errors === "string" ? errors : JSON.stringify(errors);
}

export type DomainCheckResult = {
  domain: string;
  available: boolean;
  error?: string;
};

export async function checkDomains(
  domains: string[],
): Promise<DomainCheckResult[]> {
  if (!isNamecheapConfigured()) {
    throw new Error("NAMECHEAP_NOT_CONFIGURED");
  }
  const list = [...new Set(domains.map((d) => d.toLowerCase().trim()).filter(Boolean))];
  if (!list.length) return [];

  const params = baseParams("namecheap.domains.check");
  params.set("DomainList", list.join(","));
  const { parsed } = await callNamecheap(params);

  if (apiStatus(parsed) !== "OK") {
    throw new Error(apiErrors(parsed) || "Namecheap check failed");
  }

  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as { DomainCheckResult?: unknown } | undefined;
  const raw = cmd?.DomainCheckResult;
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return rows.map((row) => {
    const r = row as Record<string, string>;
    return {
      domain: String(r.Domain || "").toLowerCase(),
      available: String(r.Available).toLowerCase() === "true",
      error: r.ErrorNo ? String(r.ErrorNo) : undefined,
    };
  });
}

export type PricingRow = { tld: string; priceUsd: number };

export async function getRegisterPricing(): Promise<PricingRow[]> {
  if (!isNamecheapConfigured()) {
    throw new Error("NAMECHEAP_NOT_CONFIGURED");
  }
  const params = baseParams("namecheap.users.getPricing");
  params.set("ProductType", "DOMAIN");
  params.set("ProductCategory", "REGISTER");
  const { parsed } = await callNamecheap(params);

  if (apiStatus(parsed) !== "OK") {
    throw new Error(apiErrors(parsed) || "Namecheap pricing failed");
  }

  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    UserGetPricingResult?: {
      ProductType?: {
        ProductCategory?: { Product?: unknown };
      };
    };
  };
  const products = cmd?.UserGetPricingResult?.ProductType?.ProductCategory?.Product;
  const list = Array.isArray(products) ? products : products ? [products] : [];
  const out: PricingRow[] = [];

  for (const prod of list) {
    const p = prod as { Name?: string; Price?: unknown };
    const tld = String(p.Name || "").toLowerCase();
    if (!tld) continue;
    const prices = Array.isArray(p.Price) ? p.Price : p.Price ? [p.Price] : [];
    const year1 = prices.find((pr) => {
      const row = pr as { Duration?: string; DurationType?: string };
      return String(row.Duration) === "1" && String(row.DurationType || "YEAR").toUpperCase() === "YEAR";
    }) as { Price?: string } | undefined;
    const priceUsd = parseFloat(String(year1?.Price ?? (prices[0] as { Price?: string })?.Price ?? "0"));
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) continue;
    out.push({ tld, priceUsd });
  }
  return out;
}

export type RegistrantContact = {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  organization?: string;
};

function contactParams(prefix: string, c: RegistrantContact): Record<string, string> {
  return {
    [`${prefix}FirstName`]: c.firstName,
    [`${prefix}LastName`]: c.lastName,
    [`${prefix}Address1`]: c.address1,
    [`${prefix}City`]: c.city,
    [`${prefix}StateProvince`]: c.stateProvince || "NA",
    [`${prefix}PostalCode`]: c.postalCode,
    [`${prefix}Country`]: c.country,
    [`${prefix}Phone`]: c.phone,
    [`${prefix}EmailAddress`]: c.email,
    ...(c.organization
      ? { [`${prefix}OrganizationName`]: c.organization }
      : {}),
  };
}

export async function createDomain(input: {
  domainName: string;
  years: number;
  registrant: RegistrantContact;
}): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) {
    throw new Error("NAMECHEAP_NOT_CONFIGURED");
  }
  const params = baseParams("namecheap.domains.create");
  params.set("DomainName", input.domainName.toLowerCase());
  params.set("Years", String(Math.max(1, Math.min(10, input.years || 1))));
  for (const [k, v] of Object.entries(contactParams("Registrant", input.registrant))) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(contactParams("Tech", input.registrant))) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(contactParams("Admin", input.registrant))) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(contactParams("AuxBilling", input.registrant))) {
    params.set(k, v);
  }

  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") {
    return { ok: true, xml };
  }
  return { ok: false, xml, error: apiErrors(parsed) || "Namecheap create failed" };
}
