"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Plus } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";
import {
  pruneExpiredMaintenances,
  type DayStatus,
  type StatusComponentView,
  type StatusPagePayload,
  type StatusSeverity,
} from "@/lib/statuspage/hostinger";

const POLL_MS = 20_000;

function statusLabel(
  status: StatusSeverity,
  t: ReturnType<typeof useTranslations<"statuspage">>,
) {
  switch (status) {
    case "operational":
      return t("operational");
    case "degraded_performance":
      return t("degraded");
    case "partial_outage":
      return t("partialOutage");
    case "major_outage":
      return t("majorOutage");
    case "under_maintenance":
      return t("maintenance");
    default:
      return t("unknown");
  }
}

function statusColor(status: StatusSeverity) {
  switch (status) {
    case "operational":
      return "text-emerald-600";
    case "degraded_performance":
      return "text-amber-500";
    case "partial_outage":
      return "text-orange-500";
    case "major_outage":
      return "text-red-600";
    case "under_maintenance":
      return "text-blue-600";
    default:
      return "text-muted-foreground";
  }
}

function dayColor(day: DayStatus) {
  switch (day) {
    case "operational":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-400";
    case "partial":
      return "bg-orange-500";
    case "major":
      return "bg-red-500";
    case "maintenance":
      return "bg-blue-400";
    default:
      return "bg-muted-foreground/25";
  }
}

function formatUtcRange(from: string, until: string, locale: string) {
  try {
    const a = new Date(from);
    const b = new Date(until);
    const dateFmt = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    const timeFmt = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
    return `${dateFmt.format(a)} ${timeFmt.format(a)}–${timeFmt.format(b)} UTC`;
  } catch {
    return `${from} – ${until}`;
  }
}

function formatPosted(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function UptimeBar({
  days,
  uptimePercent,
  t,
}: {
  days: DayStatus[];
  uptimePercent: number;
  t: ReturnType<typeof useTranslations<"statuspage">>;
}) {
  return (
    <div className="mt-2.5">
      <div className="flex h-8 items-stretch gap-px overflow-hidden rounded-[2px]">
        {days.map((day, i) => (
          <span
            key={`${i}-${day}`}
            className={cn("min-w-0 flex-1 rounded-[1px]", dayColor(day))}
            title={day}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <span>{t("daysAgo", { days: 90 })}</span>
        <span className="font-medium text-foreground/80">
          {t("uptimePercent", { value: uptimePercent.toFixed(uptimePercent % 1 ? 2 : 0) })}
        </span>
        <span>{t("today")}</span>
      </div>
    </div>
  );
}

function StatusRow({
  item,
  t,
  depth = 0,
  defaultOpen = false,
}: {
  item: StatusComponentView;
  t: ReturnType<typeof useTranslations<"statuspage">>;
  depth?: number;
  defaultOpen?: boolean;
}) {
  const hasChildren = item.children.length > 0;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(depth === 0 && "border-b border-border/70 py-4")}>
      <div className={cn(depth > 0 && "border-t border-border/40 py-3 pl-4")}>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2">
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-sm font-medium text-foreground md:text-[15px]">
              {item.name}
            </span>
          </span>
          <span className={cn("shrink-0 text-sm font-medium", statusColor(item.status))}>
            {statusLabel(item.status, t)}
          </span>
        </button>
        {open ? (
          <UptimeBar days={item.days} uptimePercent={item.uptimePercent} t={t} />
        ) : null}
      </div>
      {hasChildren && open
        ? item.children.map((child) => (
            <StatusRow key={child.id} item={child} t={t} depth={depth + 1} />
          ))
        : null}
    </div>
  );
}

export function StatusPageView({ initial }: { initial: StatusPagePayload }) {
  const t = useTranslations("statuspage");
  const [data, setData] = useState(() => ({
    ...initial,
    maintenances: pruneExpiredMaintenances(initial.maintenances),
  }));

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/status", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setData((prev) => ({
          ...prev,
          maintenances: pruneExpiredMaintenances(prev.maintenances),
        }));
        return;
      }
      const json = (await res.json()) as StatusPagePayload;
      if (json.sourceOk) {
        setData({
          ...json,
          maintenances: pruneExpiredMaintenances(json.maintenances),
        });
        return;
      }
      // Source failed — never invent green status; prune stale windows only.
      setData((prev) => ({
        ...prev,
        maintenances: pruneExpiredMaintenances(prev.maintenances),
      }));
    } catch {
      setData((prev) => ({
        ...prev,
        maintenances: pruneExpiredMaintenances(prev.maintenances),
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  const sourceDown = !data.sourceOk && data.components.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-5 md:px-6 md:pb-24 md:pt-10">
      <Reveal from="up" duration={0.4}>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-accent md:text-4xl">
            {t("title")}
          </h1>
          {sourceDown ? (
            <p className="mt-3 text-base font-medium text-muted-foreground">
              {t("unavailable")}
            </p>
          ) : (
            <p
              className={cn(
                "mt-3 text-base font-medium",
                statusColor(
                  data.indicator === "none" || data.indicator === "minor"
                    ? data.indicator === "none"
                      ? "operational"
                      : "degraded_performance"
                    : data.indicator === "major" || data.indicator === "critical"
                      ? "major_outage"
                      : "partial_outage",
                ),
              )}
            >
              {data.description || t("unavailable")}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {t("uptimeHint")}{" "}
            <span className="text-foreground/70">{t("liveSync")}</span>
          </p>
        </div>
      </Reveal>

      <div className="mt-10 rounded-2xl border border-border/70 bg-background px-4 sm:px-5">
        {data.components.map((item) => (
          <StatusRow
            key={item.id}
            item={item}
            t={t}
            defaultOpen={/^core services$/i.test(item.name)}
          />
        ))}
        {!data.components.length ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("unavailable")}
          </p>
        ) : null}
      </div>

      <section className="mt-14">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {t("scheduledMaintenance")}
          </h2>
        </Reveal>
        <div className="mt-5 space-y-4">
          {data.maintenances.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noMaintenance")}</p>
          ) : (
            data.maintenances.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border/70 bg-background p-4 sm:p-5"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {item.name}
                  </h3>
                  <p className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                    {t("scheduledFor", {
                      when: formatUtcRange(
                        item.scheduledFor,
                        item.scheduledUntil,
                        locale,
                      ),
                    })}
                  </p>
                </div>
                {item.body ? (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                ) : null}
                <p className="mt-3 text-[11px] text-muted-foreground/80">
                  {t("postedOn", { when: formatPosted(item.postedAt, locale) })}{" "}
                  UTC
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
