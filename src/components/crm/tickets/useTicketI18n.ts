"use client";

import { useTranslations } from "next-intl";
import {
  TICKET_DEPARTMENTS,
  TICKET_PRIORITIES,
  TICKET_SOURCES,
  TICKET_STATUSES,
  TICKET_TYPES,
  ticketOptionKey,
} from "@/lib/crm/tickets";

type CrmT = ReturnType<typeof useTranslations<"crm">>;

function safeT(t: CrmT, key: string, fallback: string) {
  try {
    // next-intl returns the key itself when missing depending on config;
    // prefer explicit has() when available.
    const anyT = t as CrmT & { has?: (key: string) => boolean };
    if (typeof anyT.has === "function" && !anyT.has(key)) return fallback;
    const value = t(key as never);
    if (!value || value === key) return fallback;
    return value;
  } catch {
    return fallback;
  }
}

export function useTicketI18n() {
  const t = useTranslations("crm");

  return {
    status: (value: string) =>
      safeT(t, `ticketStatus_${value}`, value.replaceAll("_", " ")),
    priority: (value: string) =>
      safeT(t, `ticketPriority_${value}`, value),
    department: (value: string) =>
      safeT(t, `ticketDept_${ticketOptionKey(value)}`, value),
    type: (value: string) =>
      safeT(t, `ticketType_${ticketOptionKey(value)}`, value),
    source: (value: string) =>
      safeT(t, `ticketSource_${value}`, value),
    statuses: TICKET_STATUSES.map((value) => ({
      value,
      label: safeT(t, `ticketStatus_${value}`, value.replaceAll("_", " ")),
    })),
    priorities: TICKET_PRIORITIES.map((value) => ({
      value,
      label: safeT(t, `ticketPriority_${value}`, value),
    })),
    departments: TICKET_DEPARTMENTS.map((value) => ({
      value,
      label: safeT(t, `ticketDept_${ticketOptionKey(value)}`, value),
    })),
    types: TICKET_TYPES.map((value) => ({
      value,
      label: safeT(t, `ticketType_${ticketOptionKey(value)}`, value),
    })),
    sources: TICKET_SOURCES.map((value) => ({
      value,
      label: safeT(t, `ticketSource_${value}`, value),
    })),
  };
}
