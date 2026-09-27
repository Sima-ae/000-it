import { parseStringPromise } from "xml2js";

function env(name: string) {
  return (process.env[name] || "").trim();
}

export function isNamecheapConfigured() {
  // Client IP may be "auto" (detect outbound public IP) — only user + key are required.
  return Boolean(env("NAMECHEAP_USER") && env("NAMECHEAP_API_KEY"));
}

/** Env var names that are missing (never returns secret values). */
export function namecheapMissingEnv(): string[] {
  const missing: string[] = [];
  if (!env("NAMECHEAP_USER")) missing.push("NAMECHEAP_USER");
  if (!env("NAMECHEAP_API_KEY")) missing.push("NAMECHEAP_API_KEY");
  return missing;
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

function parseCheckRows(parsed: Record<string, unknown>): DomainCheckResult[] {
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as { DomainCheckResult?: unknown } | undefined;
  const raw = cmd?.DomainCheckResult;
  const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return {
      domain: String(r.Domain || "").toLowerCase(),
      available: String(r.Available).toLowerCase() === "true",
      error: r.ErrorNo && String(r.ErrorNo) !== "0" ? String(r.ErrorNo) : undefined,
    };
  });
}

async function checkDomainList(
  list: string[],
): Promise<{ ok: boolean; results: DomainCheckResult[]; error?: string }> {
  const params = await baseParams("namecheap.domains.check");
  params.set("DomainList", list.join(","));
  const { parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      results: [],
      error: friendlyNamecheapError(apiErrors(parsed) || "Namecheap check failed"),
    };
  }
  return { ok: true, results: parseCheckRows(parsed) };
}

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

  // Prefer one batch call; if Namecheap rejects a TLD in the batch, check in
  // small parallel chunks so one bad TLD does not serialize the whole list.
  const batch = await checkDomainList(list);
  if (batch.ok) return batch.results;

  const chunkSize = 3;
  const chunks: string[][] = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    chunks.push(list.slice(i, i + chunkSize));
  }

  const out: DomainCheckResult[] = [];
  const concurrency = Math.min(3, chunks.length);
  let cursor = 0;

  async function worker() {
    while (cursor < chunks.length) {
      const idx = cursor++;
      const chunk = chunks[idx]!;
      const res = await checkDomainList(chunk);
      if (res.ok) {
        out.push(...res.results);
        continue;
      }
      // Chunk failed — resolve domains individually in parallel
      const singles = await Promise.all(
        chunk.map(async (domain) => {
          const one = await checkDomainList([domain]);
          if (one.ok && one.results[0]) return one.results[0];
          return {
            domain,
            available: false,
            error: one.error || "TLD_CHECK_FAILED",
          } satisfies DomainCheckResult;
        }),
      );
      out.push(...singles);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

export type PricingRow = { tld: string; priceUsd: number };

function year1Usd(pricesRaw: unknown): number {
  const prices = Array.isArray(pricesRaw)
    ? pricesRaw
    : pricesRaw
      ? [pricesRaw]
      : [];
  const year1 = prices.find((pr) => {
    const row = pr as { Duration?: string; DurationType?: string };
    return (
      String(row.Duration) === "1" &&
      String(row.DurationType || "YEAR").toUpperCase() === "YEAR"
    );
  }) as { Price?: string; YourPrice?: string } | undefined;
  const pick =
    year1 ??
    (prices[0] as { Price?: string; YourPrice?: string } | undefined);
  const priceUsd = parseFloat(String(pick?.YourPrice ?? pick?.Price ?? "0"));
  return Number.isFinite(priceUsd) && priceUsd > 0 ? priceUsd : 0;
}

function productsFromCategory(category: unknown): PricingRow[] {
  const products = (category as { Product?: unknown } | undefined)?.Product;
  const list = Array.isArray(products) ? products : products ? [products] : [];
  const out: PricingRow[] = [];
  for (const prod of list) {
    const p = prod as { Name?: string; Price?: unknown };
    const tld = String(p.Name || "").toLowerCase();
    if (!tld) continue;
    const priceUsd = year1Usd(p.Price);
    if (priceUsd <= 0) continue;
    out.push({ tld, priceUsd });
  }
  return out;
}

/** Register + renew 1-year USD prices from a single Namecheap pricing call. */
export async function getDomainPricingCatalog(): Promise<{
  register: PricingRow[];
  renew: PricingRow[];
}> {
  if (!isNamecheapConfigured()) {
    throw new Error("NAMECHEAP_NOT_CONFIGURED");
  }
  const params = await baseParams("namecheap.users.getPricing");
  params.set("ProductType", "DOMAIN");
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

  const byName = (name: string) =>
    categories.find(
      (c) =>
        String((c as { Name?: string }).Name || "").toLowerCase() === name,
    );

  return {
    register: productsFromCategory(byName("register") || categories[0]),
    renew: productsFromCategory(byName("renew")),
  };
}

/** @deprecated Prefer getDomainPricingCatalog().register */
export async function getRegisterPricing(): Promise<PricingRow[]> {
  const catalog = await getDomainPricingCatalog();
  return catalog.register;
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

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw == null) return [];
  return [raw as T];
}

function splitSldTld(domainName: string): { sld: string; tld: string } {
  const parts = domainName.toLowerCase().trim().split(".");
  if (parts.length < 2) return { sld: domainName, tld: "" };
  return { sld: parts[0] || "", tld: parts.slice(1).join(".") };
}

export type NamecheapDomainInfo = {
  domainName: string;
  id?: string;
  expires?: string;
  isExpired?: boolean;
  autoRenew?: boolean;
  isLocked?: boolean;
  whoisGuard?: boolean;
};

export async function listDomains(page = 1, pageSize = 100): Promise<{
  ok: boolean;
  domains: NamecheapDomainInfo[];
  error?: string;
  xml: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.getList");
  params.set("Page", String(page));
  params.set("PageSize", String(Math.min(100, Math.max(1, pageSize))));
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      domains: [],
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "getList failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as { DomainGetListResult?: { Domain?: unknown } };
  const rows = asArray<Record<string, string>>(cmd?.DomainGetListResult?.Domain);
  const domains = rows.map((r) => ({
    domainName: String(r.Name || r.Domain || "").toLowerCase(),
    id: r.ID ? String(r.ID) : undefined,
    expires: r.Expires ? String(r.Expires) : undefined,
    isExpired: String(r.IsExpired || "").toLowerCase() === "true",
    autoRenew: String(r.AutoRenew || "").toLowerCase() === "true",
    isLocked: String(r.IsLocked || "").toLowerCase() === "true",
    whoisGuard:
      String(r.WhoisGuard || r.Whoisguard || "")
        .toLowerCase()
        .includes("enabled") ||
      String(r.WhoisGuard || "").toLowerCase() === "true",
  }));
  return { ok: true, domains, xml };
}

export async function getDomainInfo(domainName: string): Promise<{
  ok: boolean;
  info?: NamecheapDomainInfo;
  error?: string;
  xml: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.getInfo");
  params.set("DomainName", domainName.toLowerCase());
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "getInfo failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainGetInfoResult?: Record<string, unknown>;
  };
  const r = cmd?.DomainGetInfoResult || {};
  const domainAttrs = r as {
    DomainName?: string;
    ID?: string;
    Status?: string;
    DomainDetails?: { ExpiredDate?: string; NumYears?: string };
    Locked?: string;
    Whoisguard?: { Enabled?: string };
  };
  return {
    ok: true,
    xml,
    info: {
      domainName: String(domainAttrs.DomainName || domainName).toLowerCase(),
      id: domainAttrs.ID ? String(domainAttrs.ID) : undefined,
      expires: domainAttrs.DomainDetails?.ExpiredDate
        ? String(domainAttrs.DomainDetails.ExpiredDate)
        : undefined,
      isLocked: String(domainAttrs.Locked || "").toLowerCase() === "true",
      whoisGuard:
        String(domainAttrs.Whoisguard?.Enabled || "").toLowerCase() === "true",
    },
  };
}

export async function renewDomain(input: {
  domainName: string;
  years: number;
}): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.renew");
  params.set("DomainName", input.domainName.toLowerCase());
  params.set("Years", String(Math.max(1, Math.min(10, input.years || 1))));
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "renew failed"),
  };
}

export async function createTransfer(input: {
  domainName: string;
  years: number;
  authCode: string;
}): Promise<{ ok: boolean; xml: string; error?: string; transferId?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.transfer.create");
  params.set("DomainName", input.domainName.toLowerCase());
  params.set("Years", String(Math.max(1, Math.min(10, input.years || 1))));
  params.set("EPPCode", input.authCode);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "transfer create failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainTransferCreateResult?: { Transfer?: string; ID?: string };
  };
  const transferId =
    cmd?.DomainTransferCreateResult?.Transfer ||
    cmd?.DomainTransferCreateResult?.ID;
  return { ok: true, xml, transferId: transferId ? String(transferId) : undefined };
}

export async function getTransferStatus(transferId: string): Promise<{
  ok: boolean;
  status?: string;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.transfer.getStatus");
  params.set("TransferID", transferId);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "transfer status failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainTransferGetStatusResult?: { Status?: string; StatusID?: string };
  };
  return {
    ok: true,
    xml,
    status: String(
      cmd?.DomainTransferGetStatusResult?.Status ||
        cmd?.DomainTransferGetStatusResult?.StatusID ||
        "",
    ),
  };
}

export type DnsHostRecord = {
  hostId?: string;
  name: string;
  type: string;
  address: string;
  mxPref?: string;
  ttl?: string;
};

export async function getDnsHosts(domainName: string): Promise<{
  ok: boolean;
  hosts: DnsHostRecord[];
  emailType?: string;
  isUsingOurDns?: boolean;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.getHosts");
  params.set("SLD", sld);
  params.set("TLD", tld);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      hosts: [],
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "getHosts failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainDNSGetHostsResult?: {
      host?: unknown;
      Host?: unknown;
      EmailType?: string;
      IsUsingOurDNS?: string;
    };
  };
  const result = cmd?.DomainDNSGetHostsResult;
  const raw = result?.host ?? result?.Host;
  const hosts = asArray<Record<string, string>>(raw).map((h) => ({
    hostId: h.HostId || h.HostID,
    name: String(h.Name || "@"),
    type: String(h.Type || "A"),
    address: String(h.Address || ""),
    mxPref: h.MXPref || h.mxPref,
    ttl: h.TTL || h.ttl,
  }));
  return {
    ok: true,
    hosts,
    xml,
    emailType: result?.EmailType,
    isUsingOurDns:
      String(result?.IsUsingOurDNS || "").toLowerCase() === "true",
  };
}

export async function setDnsHosts(
  domainName: string,
  hosts: DnsHostRecord[],
  emailType = "FWD",
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.setHosts");
  params.set("SLD", sld);
  params.set("TLD", tld);
  params.set("EmailType", emailType);
  hosts.forEach((h, i) => {
    const n = i + 1;
    params.set(`HostName${n}`, h.name || "@");
    params.set(`RecordType${n}`, h.type || "A");
    params.set(`Address${n}`, h.address);
    if (h.mxPref) params.set(`MXPref${n}`, h.mxPref);
    params.set(`TTL${n}`, h.ttl || "1800");
  });
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "setHosts failed"),
  };
}

export async function setDefaultNameservers(domainName: string): Promise<{
  ok: boolean;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.setDefault");
  params.set("SLD", sld);
  params.set("TLD", tld);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "setDefault NS failed"),
  };
}

export async function setCustomNameservers(
  domainName: string,
  nameservers: string[],
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.setCustom");
  params.set("SLD", sld);
  params.set("TLD", tld);
  params.set(
    "Nameservers",
    nameservers
      .map((n) => n.trim())
      .filter(Boolean)
      .join(","),
  );
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "setCustom NS failed"),
  };
}

export async function getListNameservers(domainName: string): Promise<{
  ok: boolean;
  nameservers: string[];
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.getList");
  params.set("SLD", sld);
  params.set("TLD", tld);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      nameservers: [],
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "dns.getList failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainDNSGetListResult?: {
      Nameserver?: unknown;
      IsUsingOurDNS?: string;
    };
  };
  const ns = asArray<string | Record<string, string>>(
    cmd?.DomainDNSGetListResult?.Nameserver,
  ).map((n) => (typeof n === "string" ? n : String(n._ || n.Name || "")));
  return { ok: true, nameservers: ns.filter(Boolean), xml };
}

export type EmailForward = { mailbox: string; forwardTo: string };

export async function getEmailForwarding(domainName: string): Promise<{
  ok: boolean;
  forwards: EmailForward[];
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dns.getEmailForwarding");
  params.set("DomainName", `${sld}.${tld}`);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      forwards: [],
      xml,
      error: friendlyNamecheapError(
        apiErrors(parsed) || "getEmailForwarding failed",
      ),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainDNSGetEmailForwardingResult?: { Forward?: unknown };
  };
  const forwards = asArray<Record<string, string>>(
    cmd?.DomainDNSGetEmailForwardingResult?.Forward,
  ).map((f) => ({
    mailbox: String(f.mailbox || f.Mailbox || ""),
    forwardTo: String(f.forwardto || f.ForwardTo || f._ || ""),
  }));
  return { ok: true, forwards, xml };
}

export async function setEmailForwarding(
  domainName: string,
  forwards: EmailForward[],
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.dns.setEmailForwarding");
  params.set("DomainName", domainName.toLowerCase());
  forwards.forEach((f, i) => {
    const n = i + 1;
    params.set(`MailBox${n}`, f.mailbox);
    params.set(`ForwardTo${n}`, f.forwardTo);
  });
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(
      apiErrors(parsed) || "setEmailForwarding failed",
    ),
  };
}

export async function getRegistrarLock(domainName: string): Promise<{
  ok: boolean;
  locked?: boolean;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.getRegistrarLock");
  params.set("DomainName", domainName.toLowerCase());
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "getRegistrarLock failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as {
    DomainGetRegistrarLockResult?: { RegistrarLockStatus?: string };
  };
  const status = String(
    cmd?.DomainGetRegistrarLockResult?.RegistrarLockStatus || "",
  ).toLowerCase();
  return { ok: true, locked: status === "true", xml };
}

export async function setRegistrarLock(
  domainName: string,
  lock: boolean,
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.domains.setRegistrarLock");
  params.set("DomainName", domainName.toLowerCase());
  params.set("LockAction", lock ? "LOCK" : "UNLOCK");
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "setRegistrarLock failed"),
  };
}

export async function getDnssecList(domainName: string): Promise<{
  ok: boolean;
  records: Array<Record<string, string>>;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dnssec.getList");
  params.set("SLD", sld);
  params.set("TLD", tld);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      records: [],
      xml,
      error: friendlyNamecheapError(apiErrors(parsed) || "dnssec.getList failed"),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as { DomainDNSSECGetListResult?: { DNSSEC?: unknown } };
  const records = asArray<Record<string, string>>(
    cmd?.DomainDNSSECGetListResult?.DNSSEC,
  ).map((r) => ({
    keyTag: String(r.KeyTag || ""),
    algorithm: String(r.Algorithm || ""),
    digestType: String(r.DigestType || ""),
    digest: String(r.Digest || ""),
  }));
  return { ok: true, records, xml };
}

export async function createDnssec(
  domainName: string,
  input: {
    keyTag: string;
    algorithm: string;
    digestType: string;
    digest: string;
  },
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dnssec.create");
  params.set("SLD", sld);
  params.set("TLD", tld);
  params.set("KeyTag", input.keyTag);
  params.set("Algorithm", input.algorithm);
  params.set("DigestType", input.digestType);
  params.set("Digest", input.digest);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "dnssec.create failed"),
  };
}

export async function deleteDnssec(
  domainName: string,
  input: {
    keyTag: string;
    algorithm: string;
    digestType: string;
    digest: string;
  },
): Promise<{ ok: boolean; xml: string; error?: string }> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const { sld, tld } = splitSldTld(domainName);
  const params = await baseParams("namecheap.domains.dnssec.delete");
  params.set("SLD", sld);
  params.set("TLD", tld);
  params.set("KeyTag", input.keyTag);
  params.set("Algorithm", input.algorithm);
  params.set("DigestType", input.digestType);
  params.set("Digest", input.digest);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "dnssec.delete failed"),
  };
}

/** Enable WhoisGuard for a domain (requires existing WhoisGuard id or allownull). */
export async function enableWhoisGuard(whoisGuardId: string): Promise<{
  ok: boolean;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.whoisguard.enable");
  params.set("WhoisguardID", whoisGuardId);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(apiErrors(parsed) || "whoisguard.enable failed"),
  };
}

export async function disableWhoisGuard(whoisGuardId: string): Promise<{
  ok: boolean;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.whoisguard.disable");
  params.set("WhoisguardID", whoisGuardId);
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) === "OK") return { ok: true, xml };
  return {
    ok: false,
    xml,
    error: friendlyNamecheapError(
      apiErrors(parsed) || "whoisguard.disable failed",
    ),
  };
}

export async function getWhoisGuardList(): Promise<{
  ok: boolean;
  items: Array<{ id: string; domainName: string; enabled: boolean }>;
  xml: string;
  error?: string;
}> {
  if (!isNamecheapConfigured()) throw new Error("NAMECHEAP_NOT_CONFIGURED");
  const params = await baseParams("namecheap.whoisguard.getList");
  params.set("PageSize", "100");
  const { xml, parsed } = await callNamecheap(params);
  if (apiStatus(parsed) !== "OK") {
    return {
      ok: false,
      items: [],
      xml,
      error: friendlyNamecheapError(
        apiErrors(parsed) || "whoisguard.getList failed",
      ),
    };
  }
  const cmd = (parsed.ApiResponse as { CommandResponse?: unknown })
    ?.CommandResponse as { WhoisguardGetListResult?: { Whoisguard?: unknown } };
  const items = asArray<Record<string, string>>(
    cmd?.WhoisguardGetListResult?.Whoisguard,
  ).map((w) => ({
    id: String(w.ID || w.Id || ""),
    domainName: String(w.DomainName || "").toLowerCase(),
    enabled: String(w.Status || "").toLowerCase() === "enabled",
  }));
  return { ok: true, items, xml };
}

