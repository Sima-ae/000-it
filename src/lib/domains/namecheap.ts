import { parseStringPromise } from "xml2js";

function env(name: string) {
  return (process.env[name] || "").trim();
}

export function isNamecheapConfigured() {
  // Client IP may be "auto" (detect outbound public IP) — only user + key are required.
  return Boolean(env("NAMECHEAP_USER") && env("NAMECHEAP_API_KEY"));
}

function apiBase() {
  return env("NAMECHEAP_SANDBOX") === "1"
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response";
}

let cachedAutoIp: { ip: string; at: number } | null = null;
const AUTO_IP_TTL_MS = 10 * 60 * 1000;

async function detectPublicIp(): Promise<string> {
  const now = Date.now();
  if (cachedAutoIp && now - cachedAutoIp.at < AUTO_IP_TTL_MS) {
    return cachedAutoIp.ip;
  }
  const res = await fetch("https://api.ipify.org?format=json", {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Could not detect public IP (HTTP ${res.status})`);
  const data = (await res.json()) as { ip?: string };
  const ip = (data.ip || "").trim();
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    throw new Error("Could not detect a valid public IPv4");
  }
  cachedAutoIp = { ip, at: now };
  return ip;
}

/** Explicit IP, or "auto"/empty → detect the machine's outbound public IP. */
export async function resolveNamecheapClientIp(): Promise<string> {
  const configured = env("NAMECHEAP_CLIENT_IP");
  if (configured && configured.toLowerCase() !== "auto") return configured;
  return detectPublicIp();
}

async function baseParams(command: string): Promise<URLSearchParams> {
  const user = env("NAMECHEAP_USER");
  const key = env("NAMECHEAP_API_KEY");
  const ip = await resolveNamecheapClientIp();
  return new URLSearchParams({
    ApiUser: user,
    ApiKey: key,
    UserName: user,
    ClientIp: ip,
    Command: command,
  });
}

async function fetchNamecheapXml(url: string): Promise<string> {
  const proxy = env("NAMECHEAP_SSH_PROXY");
  if (!proxy) {
    const res = await fetch(url, { cache: "no-store", method: "GET" });
    return res.text();
  }

  // Local/dev: run the API call from the VPS so Namecheap sees the whitelisted IP.
  // Quote the URL for the remote shell so `&` in query strings is not interpreted.
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);
  const key =
    env("NAMECHEAP_SSH_KEY") ||
    `${process.env.HOME || ""}/.ssh/auto_leads_deploy`;
  const safeUrl = url.replace(/'/g, `'\\''`);
  const remote = `curl -sS --max-time 45 '${safeUrl}'`;
  const { stdout, stderr } = await execFileAsync(
    "ssh",
    [
      "-i",
      key,
      "-o",
      "BatchMode=yes",
      "-o",
      "IdentitiesOnly=yes",
      "-o",
      "StrictHostKeyChecking=accept-new",
      "-o",
      "ConnectTimeout=12",
      proxy,
      remote,
    ],
    { maxBuffer: 32 * 1024 * 1024, timeout: 90_000 },
  );
  const xml = String(stdout || "");
  if (!xml.trim()) {
    throw new Error(
      `Namecheap SSH proxy returned empty response${stderr ? `: ${stderr}` : ""}`,
    );
  }
  return xml;
}

async function callNamecheap(params: URLSearchParams) {
  const url = `${apiBase()}?${params.toString()}`;
  const xml = await fetchNamecheapXml(url);
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
  const errors = root?.Errors as
    | { Error?: unknown }
    | string
    | undefined;
  if (!errors) return "";
  if (typeof errors === "string") return errors;
  const err = errors.Error;
  const rows = Array.isArray(err) ? err : err ? [err] : [];
  const texts = rows.map((row) => {
    if (typeof row === "string") return row;
    if (row && typeof row === "object") {
      const o = row as { _?: string; Number?: string };
      const msg = String(o._ || "").trim();
      const num = o.Number ? ` (#${o.Number})` : "";
      return msg ? `${msg}${num}` : JSON.stringify(row);
    }
    return String(row);
  });
  return texts.filter(Boolean).join("; ") || JSON.stringify(errors);
}

function friendlyNamecheapError(raw: string): string {
  const m = raw.match(/Invalid request IP:\s*([0-9.]+)/i);
  if (m) {
    return (
      `Namecheap blocked this server IP (${m[1]}). ` +
      `Add it under Namecheap → Profile → Tools → API Access (whitelist), ` +
      `and set NAMECHEAP_CLIENT_IP to that IP (or auto).`
    );
  }
  return raw;
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
  const list = [
    ...new Set(domains.map((d) => d.toLowerCase().trim()).filter(Boolean)),
  ];
  if (!list.length) return [];

  const params = await baseParams("namecheap.domains.check");
  params.set("DomainList", list.join(","));
  const { parsed } = await callNamecheap(params);

  if (apiStatus(parsed) !== "OK") {
    throw new Error(
      friendlyNamecheapError(apiErrors(parsed) || "Namecheap check failed"),
    );
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
  const params = await baseParams("namecheap.users.getPricing");
  params.set("ProductType", "DOMAIN");
  params.set("ProductCategory", "REGISTER");
  const { parsed } = await callNamecheap(params);

  if (apiStatus(parsed) !== "OK") {
    throw new Error(
      friendlyNamecheapError(apiErrors(parsed) || "Namecheap pricing failed"),
    );
  }

  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    UserGetPricingResult?: {
      ProductType?: {
        ProductCategory?: unknown;
      };
    };
  };
  const categoriesRaw =
    cmd?.UserGetPricingResult?.ProductType?.ProductCategory;
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw
      ? [categoriesRaw]
      : [];
  const registerCat =
    categories.find(
      (c) =>
        String((c as { Name?: string }).Name || "").toLowerCase() ===
        "register",
    ) || categories[0];
  const products = (registerCat as { Product?: unknown } | undefined)?.Product;
  const list = Array.isArray(products) ? products : products ? [products] : [];
  const out: PricingRow[] = [];

  for (const prod of list) {
    const p = prod as { Name?: string; Price?: unknown };
    const tld = String(p.Name || "").toLowerCase();
    if (!tld) continue;
    const prices = Array.isArray(p.Price) ? p.Price : p.Price ? [p.Price] : [];
    // Prefer YourPrice (account rate), then Price
    const year1 = prices.find((pr) => {
      const row = pr as { Duration?: string; DurationType?: string };
      return (
        String(row.Duration) === "1" &&
        String(row.DurationType || "YEAR").toUpperCase() === "YEAR"
      );
    }) as
      | { Price?: string; YourPrice?: string }
      | undefined;
    const pick = year1 ?? (prices[0] as
      | { Price?: string; YourPrice?: string }
      | undefined);
    const priceUsd = parseFloat(
      String(pick?.YourPrice ?? pick?.Price ?? "0"),
    );
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

function contactParams(
  prefix: string,
  c: RegistrantContact,
): Record<string, string> {
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
  const params = await baseParams("namecheap.domains.create");
  params.set("DomainName", input.domainName.toLowerCase());
  params.set("Years", String(Math.max(1, Math.min(10, input.years || 1))));
  for (const [k, v] of Object.entries(
    contactParams("Registrant", input.registrant),
  )) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(
    contactParams("Tech", input.registrant),
  )) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(
    contactParams("Admin", input.registrant),
  )) {
    params.set(k, v);
  }
  for (const [k, v] of Object.entries(
    contactParams("AuxBilling", input.registrant),
  )) {
    params.set(k, v);
  }

  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") {
    return { ok: true, xml };
  }
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(
      apiErrors(parsed) || "Namecheap create failed",
    ),
  };
}
