/** Live status mirrored from Hostinger's public Atlassian Statuspage, rebranded. */

const HOSTINGER_STATUS_ORIGIN = "https://statuspage.hostinger.com";

export type StatusSeverity =
  | "operational"
  | "degraded_performance"
  | "partial_outage"
  | "major_outage"
  | "under_maintenance"
  | "unknown";

export type DayStatus = "operational" | "degraded" | "partial" | "major" | "maintenance" | "nodata";

export type StatusComponentView = {
  id: string;
  name: string;
  status: StatusSeverity;
  description?: string | null;
  group: boolean;
  children: StatusComponentView[];
  days: DayStatus[];
  uptimePercent: number;
};

export type StatusMaintenanceView = {
  id: string;
  name: string;
  status: string;
  scheduledFor: string;
  scheduledUntil: string;
  body: string;
  postedAt: string;
};

export type StatusPagePayload = {
  fetchedAt: string;
  pageName: string;
  indicator: string;
  description: string;
  components: StatusComponentView[];
  maintenances: StatusMaintenanceView[];
  sourceOk: boolean;
};

type RawComponent = {
  id: string;
  name: string;
  status: string;
  description?: string | null;
  group?: boolean;
  group_id?: string | null;
  position?: number;
  only_show_if_degraded?: boolean;
  showcase?: boolean;
  components?: string[];
};

type RawIncident = {
  id: string;
  name: string;
  status: string;
  impact: string;
  created_at: string;
  resolved_at?: string | null;
  started_at?: string | null;
  components?: Array<{ id: string; name: string }>;
};

type RawMaintenanceUpdate = {
  body?: string;
  created_at?: string;
  status?: string;
};

type RawMaintenance = {
  id: string;
  name: string;
  status: string;
  scheduled_for: string;
  scheduled_until: string;
  created_at?: string;
  incident_updates?: RawMaintenanceUpdate[];
};

const DAYS = 90;
const MAX_MAINTENANCES = 24;

/** Strip vendor branding; keep clean product names for the active site brand. */
export function rebrandStatusName(name: string): string {
  const original = name.trim();
  if (/^Hostinger Email$/i.test(original)) return "Email";
  if (/^Hostinger Mail$/i.test(original)) return "Mail";
  if (/^Titan Email$/i.test(original)) return "Email";
  let out = original.replace(/\bHostinger\b/gi, "").replace(/\s{2,}/g, " ").trim();
  out = out.replace(/^Titan\s+/i, "");
  return out || original;
}

function rebrandText(text: string, brandName: string) {
  return text
    .replace(/\bHostinger\b/gi, brandName)
    .replace(/\bhPanel\b/g, "client portal")
    .replace(/\bTitan Email\b/gi, "Email");
}

function normalizeStatus(raw: string | undefined): StatusSeverity {
  switch ((raw || "").toLowerCase()) {
    case "operational":
      return "operational";
    case "degraded_performance":
      return "degraded_performance";
    case "partial_outage":
      return "partial_outage";
    case "major_outage":
      return "major_outage";
    case "under_maintenance":
      return "under_maintenance";
    default:
      return "unknown";
  }
}

function impactToDay(impact: string): DayStatus {
  switch ((impact || "").toLowerCase()) {
    case "maintenance":
      return "maintenance";
    case "minor":
      return "degraded";
    case "major":
      return "major";
    case "critical":
      return "major";
    default:
      return "partial";
  }
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseIso(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function sortedUpdates(updates: RawMaintenanceUpdate[] | undefined) {
  return [...(updates || [])].sort(
    (a, b) => (parseIso(a.created_at) ?? 0) - (parseIso(b.created_at) ?? 0),
  );
}

/** Newest non-empty update body; falls back to earliest. */
function latestUpdateBody(updates: RawMaintenanceUpdate[] | undefined): string {
  const sorted = sortedUpdates(updates);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const body = (sorted[i]?.body || "").trim();
    if (body) return body;
  }
  return "";
}

function earliestPostedAt(m: RawMaintenance): string {
  const sorted = sortedUpdates(m.incident_updates);
  return sorted[0]?.created_at || m.created_at || m.scheduled_for;
}

/**
 * Keep only live / still-relevant maintenance windows from Hostinger.
 * Drop completed/cancelled and scheduled items whose window has already ended.
 * Keep in_progress / verifying even if scheduled_until has passed (overrun).
 */
export function isLiveMaintenance(
  m: Pick<RawMaintenance, "status" | "scheduled_until">,
  nowMs = Date.now(),
): boolean {
  const status = (m.status || "").toLowerCase();
  if (status === "completed" || status === "cancelled") return false;
  if (status === "in_progress" || status === "verifying") return true;
  if (status === "scheduled") {
    const until = parseIso(m.scheduled_until);
    return until !== null && until > nowMs;
  }
  return false;
}

function mapMaintenance(
  m: RawMaintenance,
  brandName: string,
): StatusMaintenanceView {
  return {
    id: m.id,
    name: rebrandStatusName(m.name),
    status: m.status,
    scheduledFor: m.scheduled_for,
    scheduledUntil: m.scheduled_until,
    body: rebrandText(latestUpdateBody(m.incident_updates), brandName),
    postedAt: earliestPostedAt(m),
  };
}

/** Drop client-side items that finished after the last successful poll. */
export function pruneExpiredMaintenances(
  items: StatusMaintenanceView[],
  nowMs = Date.now(),
): StatusMaintenanceView[] {
  return items.filter((m) =>
    isLiveMaintenance(
      { status: m.status, scheduled_until: m.scheduledUntil },
      nowMs,
    ),
  );
}

function buildDayMaps(incidents: RawIncident[]) {
  const byComponent = new Map<string, Map<string, DayStatus>>();
  const global = new Map<string, DayStatus>();
  const rank: Record<DayStatus, number> = {
    operational: 0,
    nodata: 0,
    maintenance: 1,
    degraded: 2,
    partial: 3,
    major: 4,
  };

  function worsen(map: Map<string, DayStatus>, key: string, next: DayStatus) {
    const prev = map.get(key) || "operational";
    if (rank[next] > rank[prev]) map.set(key, next);
  }

  const now = Date.now();

  for (const incident of incidents) {
    const start = new Date(incident.started_at || incident.created_at);
    if (Number.isNaN(start.getTime())) continue;

    const resolved = parseIso(incident.resolved_at);
    const open =
      !resolved &&
      !["resolved", "postmortem", "completed"].includes(
        (incident.status || "").toLowerCase(),
      );
    const endMs = open ? now : (resolved ?? parseIso(incident.created_at) ?? now);
    const end = new Date(endMs);

    const dayImpact = impactToDay(incident.impact);
    if (incident.impact === "none" && dayImpact !== "maintenance") continue;

    const cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const last = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );
    while (cursor <= last) {
      const key = dayKey(cursor);
      worsen(global, key, dayImpact);
      for (const comp of incident.components || []) {
        if (!comp?.id) continue;
        if (!byComponent.has(comp.id)) byComponent.set(comp.id, new Map());
        worsen(byComponent.get(comp.id)!, key, dayImpact);
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return { byComponent, global };
}

function daysForComponent(
  id: string,
  maps: ReturnType<typeof buildDayMaps>,
  childIds: string[],
): { days: DayStatus[]; uptimePercent: number } {
  const today = new Date();
  const days: DayStatus[] = [];
  let ok = 0;
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    let status: DayStatus = maps.byComponent.get(id)?.get(key) || "operational";
    for (const childId of childIds) {
      const child = maps.byComponent.get(childId)?.get(key);
      if (!child) continue;
      const rank: Record<DayStatus, number> = {
        operational: 0,
        nodata: 0,
        maintenance: 1,
        degraded: 2,
        partial: 3,
        major: 4,
      };
      if (rank[child] > rank[status]) status = child;
    }
    days.push(status);
    if (status === "operational" || status === "nodata" || status === "maintenance") {
      ok += 1;
    }
  }
  const uptimePercent = Math.round((ok / DAYS) * 10000) / 100;
  return { days, uptimePercent };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${HOSTINGER_STATUS_ORIGIN}${path}`, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Status source ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export async function loadStatusPagePayload(
  brandName = "TripleZero iT",
): Promise<StatusPagePayload> {
  try {
    const [summary, upcoming, active, incidentsPayload] = await Promise.all([
      fetchJson<{
        page: { name: string };
        status: { indicator: string; description: string };
        components: RawComponent[];
      }>("/api/v2/summary.json"),
      fetchJson<{ scheduled_maintenances: RawMaintenance[] }>(
        "/api/v2/scheduled-maintenances/upcoming.json",
      ),
      fetchJson<{ scheduled_maintenances: RawMaintenance[] }>(
        "/api/v2/scheduled-maintenances/active.json",
      ).catch(() => ({ scheduled_maintenances: [] as RawMaintenance[] })),
      fetchJson<{ incidents: RawIncident[] }>("/api/v2/incidents.json"),
    ]);

    const components = summary.components || [];
    const byId = new Map(components.map((c) => [c.id, c]));
    const dayMaps = buildDayMaps(incidentsPayload.incidents || []);

    const groups = components
      .filter((c) => c.group)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const standalone = components.filter(
      (c) =>
        !c.group &&
        !c.group_id &&
        !c.only_show_if_degraded &&
        (c.showcase || /^ecommerce$/i.test(c.name)),
    );

    function toView(raw: RawComponent, childIds: string[] = []): StatusComponentView {
      const { days, uptimePercent } = daysForComponent(raw.id, dayMaps, childIds);
      return {
        id: raw.id,
        name: rebrandStatusName(raw.name),
        status: normalizeStatus(raw.status),
        description: raw.description ? rebrandText(raw.description, brandName) : null,
        group: Boolean(raw.group),
        children: [],
        days,
        uptimePercent,
      };
    }

    const topLevel: StatusComponentView[] = [];

    for (const group of groups) {
      const childIds = group.components || [];
      const view = toView(group, childIds);
      view.children = childIds
        .map((id) => byId.get(id))
        .filter((c): c is RawComponent => Boolean(c))
        .filter((c) => !c.only_show_if_degraded || c.status !== "operational")
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((c) => toView(c));
      topLevel.push(view);
    }

    for (const item of standalone.sort((a, b) => (a.position || 0) - (b.position || 0))) {
      const view = toView(item);
      if (/^ecommerce$/i.test(item.name)) {
        const idx = topLevel.findIndex((c) => /datacenters/i.test(c.name));
        if (idx >= 0) topLevel.splice(idx + 1, 0, view);
        else topLevel.push(view);
      } else {
        topLevel.push(view);
      }
    }

    const nowMs = Date.now();
    const merged = new Map<string, RawMaintenance>();
    for (const m of [
      ...(upcoming.scheduled_maintenances || []),
      ...(active.scheduled_maintenances || []),
    ]) {
      if (!m?.id) continue;
      merged.set(m.id, m);
    }

    const maintenances = [...merged.values()]
      .filter((m) => isLiveMaintenance(m, nowMs))
      .sort(
        (a, b) =>
          (parseIso(a.scheduled_for) ?? 0) - (parseIso(b.scheduled_for) ?? 0),
      )
      .slice(0, MAX_MAINTENANCES)
      .map((m) => mapMaintenance(m, brandName));

    return {
      fetchedAt: new Date().toISOString(),
      pageName: brandName,
      indicator: summary.status?.indicator || "none",
      description: rebrandText(
        summary.status?.description || "All Systems Operational",
        brandName,
      ),
      components: topLevel,
      maintenances,
      sourceOk: true,
    };
  } catch (error) {
    console.error("[statuspage]", error);
    return {
      fetchedAt: new Date().toISOString(),
      pageName: brandName,
      indicator: "none",
      description: "",
      components: [],
      maintenances: [],
      sourceOk: false,
    };
  }
}
