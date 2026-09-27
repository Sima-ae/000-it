"use client";

import { useTranslations } from "next-intl";

type AnyT = {
  (key: string): string;
  has?: (key: string) => boolean;
};

function safeT(t: AnyT, key: string, fallback: string) {
  try {
    if (typeof t.has === "function" && !t.has(key)) return fallback;
    const value = t(key);
    if (!value || value === key) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

function humanize(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Localized status/enum labels for manager + client dashboards.
 * Uses crm / dashboard / myDomains message namespaces.
 */
export function useStatusI18n() {
  const crm = useTranslations("crm") as unknown as AnyT;
  const dash = useTranslations("dashboard") as unknown as AnyT;
  const domains = useTranslations("myDomains") as unknown as AnyT;

  return {
    ticketStatus: (v: string) => safeT(crm, `ticketStatus_${v}`, humanize(v)),
    ticketSource: (v: string) => safeT(crm, `ticketSource_${v}`, humanize(v)),
    ticketPriority: (v: string) => safeT(crm, `ticketPriority_${v}`, humanize(v)),
    clientStatus: (v: string) => safeT(crm, `clientStatus_${v}`, humanize(v)),
    leadStatus: (v: string) => safeT(crm, `leadStatus_${v}`, humanize(v)),
    taskStatus: (v: string) => safeT(crm, `taskStatus_${v}`, humanize(v)),
    taskPriority: (v: string) =>
      safeT(crm, `ticketPriority_${v}`, safeT(crm, `taskPriority_${v}`, humanize(v))),
    projectStatus: (v: string) => safeT(dash, `projectStatus_${v}`, humanize(v)),
    agentStatus: (v: string) => safeT(dash, `agentStatus_${v}`, humanize(v)),
    domainStatus: (v: string) => safeT(domains, `status_${v}`, humanize(v)),
    orderType: (v: string) => safeT(dash, `orderType_${v}`, humanize(v)),
  };
}
