"use client";

import { Suspense, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckoutInvoiceBackup } from "@/components/shop/CheckoutInvoiceBackup";
import { CrmShell } from "@/components/crm/CrmShell";
import { isStaffRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type OwnedDomain = {
  id: string;
  domainName: string;
  tld: string;
  status: string;
  expiresAt: string | null;
  autoRenewEnabled: boolean;
  registrarLocked: boolean;
  whoisGuardEnabled: boolean;
  lastSyncedAt: string | null;
};

type DnsHost = {
  name: string;
  type: string;
  address: string;
  mxPref?: string;
  ttl?: string;
};

type Tab =
  | "overview"
  | "dns"
  | "nameservers"
  | "forwarding"
  | "dnssec"
  | "privacy"
  | "redirects";

type SortKey = "domain" | "status" | "expires" | "lock" | "privacy";
type SortDir = "asc" | "desc";
type ExpiryFilter = "all" | "30" | "90" | "expired" | "none";
type TriFilter = "all" | "yes" | "no";

function daysUntil(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const t = new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-primary" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-primary" />
  );
}

export default function MyDomainsPage() {
  const t = useTranslations("myDomains");
  const locale = useLocale();
  const { data: session } = useSession();
  const staff = isStaffRole(session?.user?.role);
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [active, setActive] = useState<OwnedDomain | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [hosts, setHosts] = useState<DnsHost[]>([]);
  const [nameservers, setNameservers] = useState("");
  const [forwards, setForwards] = useState<
    Array<{ mailbox: string; forwardTo: string }>
  >([]);
  const [dnssecForm, setDnssecForm] = useState({
    keyTag: "",
    algorithm: "13",
    digestType: "2",
    digest: "",
  });
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [lockFilter, setLockFilter] = useState<TriFilter>("all");
  const [privacyFilter, setPrivacyFilter] = useState<TriFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("expires");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["my-domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains/mine");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as OwnedDomain[];
    },
  });

  const statusOptions = useMemo(() => {
    const set = new Set(domains.map((d) => d.status).filter(Boolean));
    return ["all", ...[...set].sort()];
  }, [domains]);

  const visibleDomains = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^\.+/, "");
    let rows = domains.filter((d) => {
      if (q && !d.domainName.toLowerCase().includes(q) && !d.tld.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (lockFilter === "yes" && !d.registrarLocked) return false;
      if (lockFilter === "no" && d.registrarLocked) return false;
      if (privacyFilter === "yes" && !d.whoisGuardEnabled) return false;
      if (privacyFilter === "no" && d.whoisGuardEnabled) return false;
      const days = daysUntil(d.expiresAt);
      if (expiryFilter === "expired" && !(days != null && days < 0)) return false;
      if (expiryFilter === "30" && !(days != null && days >= 0 && days <= 30)) return false;
      if (expiryFilter === "90" && !(days != null && days >= 0 && days <= 90)) return false;
      if (expiryFilter === "none" && d.expiresAt) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sortKey === "domain") {
        return a.domainName.localeCompare(b.domainName) * dir;
      }
      if (sortKey === "status") {
        return a.status.localeCompare(b.status) * dir;
      }
      if (sortKey === "lock") {
        return (Number(a.registrarLocked) - Number(b.registrarLocked)) * dir;
      }
      if (sortKey === "privacy") {
        return (Number(a.whoisGuardEnabled) - Number(b.whoisGuardEnabled)) * dir;
      }
      // expires — nulls last
      const ta = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      const tb = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      if (ta === tb) return a.domainName.localeCompare(b.domainName);
      return (ta - tb) * dir;
    });
    return rows;
  }, [
    domains,
    search,
    statusFilter,
    expiryFilter,
    lockFilter,
    privacyFilter,
    sortKey,
    sortDir,
  ]);

  const tabs = useMemo(
    () =>
      [
        ["overview", t("tabOverview")],
        ["dns", t("tabDns")],
        ["nameservers", t("tabNs")],
        ["forwarding", t("tabForwarding")],
        ["dnssec", t("tabDnssec")],
        ["privacy", t("tabPrivacy")],
        ["redirects", t("tabRedirects")],
      ] as const,
    [t],
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "expires" ? "asc" : "asc");
    }
  }

  async function syncAll() {
    setBusy(true);
    try {
      const res = await fetch("/api/domains/mine", { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || t("syncFailed"));
        return;
      }
      toast.success(t("syncOk"));
      void qc.invalidateQueries({ queryKey: ["my-domains"] });
    } finally {
      setBusy(false);
    }
  }

  async function bulk(action: string) {
    if (!selected.length) {
      toast.error(t("selectFirst"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/domains/mine/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainNames: selected, action }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(j.error || t("bulkFailed"));
        return;
      }
      toast.success(t("bulkOk"));
      void qc.invalidateQueries({ queryKey: ["my-domains"] });
    } finally {
      setBusy(false);
    }
  }

  async function openDomain(d: OwnedDomain) {
    setActive(d);
    setTab("overview");
    setHosts([]);
    setNameservers("");
    setForwards([]);
  }

  async function loadTab(next: Tab) {
    if (!active) return;
    setTab(next);
    const enc = encodeURIComponent(active.domainName);
    try {
      if (next === "dns" || next === "redirects") {
        const res = await fetch(`/api/domains/mine/${enc}/dns`);
        const j = await res.json();
        if (res.ok) {
          const list = (j.hosts || []) as DnsHost[];
          setHosts(
            next === "redirects"
              ? list.filter((h) =>
                  ["URL", "URL301", "FRAME"].includes(h.type.toUpperCase()),
                )
              : list,
          );
        } else toast.error(j.error || t("loadFailed"));
      }
      if (next === "nameservers") {
        const res = await fetch(`/api/domains/mine/${enc}/nameservers`);
        const j = await res.json();
        if (res.ok) setNameservers((j.nameservers || []).join("\n"));
        else toast.error(j.error || t("loadFailed"));
      }
      if (next === "forwarding") {
        const res = await fetch(`/api/domains/mine/${enc}/email-forwarding`);
        const j = await res.json();
        if (res.ok) setForwards(j.forwards || []);
        else toast.error(j.error || t("loadFailed"));
      }
      if (next === "dnssec") {
        const res = await fetch(`/api/domains/mine/${enc}/dnssec`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          toast.error(j.error || t("loadFailed"));
        }
      }
    } catch {
      toast.error(t("loadFailed"));
    }
  }

  async function saveDns() {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/dns`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hosts }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else toast.success(t("saveOk"));
    } finally {
      setBusy(false);
    }
  }

  async function saveNs(mode: "default" | "custom") {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/nameservers`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            nameservers: nameservers
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean),
          }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else toast.success(t("saveOk"));
    } finally {
      setBusy(false);
    }
  }

  async function saveForwards() {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/email-forwarding`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ forwards }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else toast.success(t("saveOk"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock(locked: boolean) {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/lock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locked }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else {
        toast.success(t("saveOk"));
        void qc.invalidateQueries({ queryKey: ["my-domains"] });
        setActive({ ...active, registrarLocked: locked });
      }
    } finally {
      setBusy(false);
    }
  }

  async function togglePrivacy(enabled: boolean) {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/whois-guard`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else {
        toast.success(t("saveOk"));
        void qc.invalidateQueries({ queryKey: ["my-domains"] });
        setActive({ ...active, whoisGuardEnabled: enabled });
      }
    } finally {
      setBusy(false);
    }
  }

  async function renew(d: OwnedDomain) {
    setBusy(true);
    try {
      const res = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainName: d.domainName,
          years: 1,
          locale,
          orderType: "RENEWAL",
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.url) {
        toast.error(j.error || t("renewFailed"));
        return;
      }
      window.location.href = j.url as string;
    } finally {
      setBusy(false);
    }
  }

  async function addDnssec() {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/domains/mine/${encodeURIComponent(active.domainName)}/dnssec`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", record: dnssecForm }),
        },
      );
      const j = await res.json().catch(() => ({}));
      if (!res.ok) toast.error(j.error || t("saveFailed"));
      else toast.success(t("saveOk"));
    } finally {
      setBusy(false);
    }
  }

  function toggleSelect(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  function SortHeader({
    label,
    column,
  }: {
    label: string;
    column: SortKey;
  }) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-1 font-medium text-muted-foreground transition hover:text-foreground"
        onClick={() => toggleSort(column)}
      >
        {label}
        <SortIcon active={sortKey === column} dir={sortDir} />
      </button>
    );
  }

  return (
    <CrmShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex flex-wrap gap-2">
          {staff ? (
            <Button variant="outline" disabled={busy} onClick={() => void syncAll()}>
              {t("sync")}
            </Button>
          ) : null}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void bulk("lock")}
          >
            {t("bulkLock")}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void bulk("unlock")}
          >
            {t("bulkUnlock")}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void bulk("privacy_on")}
          >
            {t("bulkPrivacyOn")}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void bulk("sync")}
          >
            {t("bulkSync")}
          </Button>
        </div>
      }
    >
      <Suspense fallback={null}>
        <CheckoutInvoiceBackup />
      </Suspense>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">{t("listTitle")}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("filterResultCount", {
                shown: visibleDomains.length,
                total: domains.length,
              })}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-9 rounded-xl pl-8"
              aria-label={t("searchPlaceholder")}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-xl border border-border bg-background px-3 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t("filterStatus")}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? t("filterAllStatuses") : s}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-xl border border-border bg-background px-3 text-xs"
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value as ExpiryFilter)}
              aria-label={t("filterExpiry")}
            >
              <option value="all">{t("filterExpiryAll")}</option>
              <option value="30">{t("filterExpiry30")}</option>
              <option value="90">{t("filterExpiry90")}</option>
              <option value="expired">{t("filterExpiryExpired")}</option>
              <option value="none">{t("filterExpiryUnknown")}</option>
            </select>
            <select
              className="h-9 rounded-xl border border-border bg-background px-3 text-xs"
              value={lockFilter}
              onChange={(e) => setLockFilter(e.target.value as TriFilter)}
              aria-label={t("filterLock")}
            >
              <option value="all">{t("filterLockAll")}</option>
              <option value="yes">{t("filterLockOn")}</option>
              <option value="no">{t("filterLockOff")}</option>
            </select>
            <select
              className="h-9 rounded-xl border border-border bg-background px-3 text-xs"
              value={privacyFilter}
              onChange={(e) => setPrivacyFilter(e.target.value as TriFilter)}
              aria-label={t("filterPrivacy")}
            >
              <option value="all">{t("filterPrivacyAll")}</option>
              <option value="yes">{t("filterPrivacyOn")}</option>
              <option value="no">{t("filterPrivacyOff")}</option>
            </select>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 rounded-xl"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setExpiryFilter("all");
                setLockFilter("all");
                setPrivacyFilter("all");
                setSortKey("expires");
                setSortDir("asc");
              }}
            >
              {t("filterReset")}
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : !domains.length ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : !visibleDomains.length ? (
            <p className="text-sm text-muted-foreground">{t("filterEmpty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 border-collapse text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="w-8 py-2 pr-2" />
                    <th className="py-2 pr-3">
                      <SortHeader label={t("colDomain")} column="domain" />
                    </th>
                    <th className="py-2 pr-3">
                      <SortHeader label={t("colStatus")} column="status" />
                    </th>
                    <th className="py-2 pr-3">
                      <SortHeader label={t("colExpires")} column="expires" />
                    </th>
                    <th className="py-2 pr-3">
                      <SortHeader label={t("colLock")} column="lock" />
                    </th>
                    <th className="py-2 pr-3">
                      <SortHeader label={t("colPrivacy")} column="privacy" />
                    </th>
                    <th className="py-2 pr-3">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDomains.map((d) => {
                    const days = daysUntil(d.expiresAt);
                    const expiringSoon =
                      days != null && days >= 0 && days <= 30;
                    const expired = days != null && days < 0;
                    return (
                      <tr key={d.id} className="border-b border-border/60">
                        <td className="py-2 pr-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(d.domainName)}
                            onChange={() => toggleSelect(d.domainName)}
                          />
                        </td>
                        <td className="py-2 pr-3 font-medium">{d.domainName}</td>
                        <td className="py-2 pr-3">
                          <Badge variant="outline">{d.status}</Badge>
                        </td>
                        <td
                          className={cn(
                            "py-2 pr-3",
                            expired
                              ? "font-medium text-destructive"
                              : expiringSoon
                                ? "font-medium text-orange-600 dark:text-orange-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {d.expiresAt
                            ? new Date(d.expiresAt).toLocaleDateString(locale)
                            : "—"}
                        </td>
                        <td className="py-2 pr-3">
                          {d.registrarLocked ? t("yes") : t("no")}
                        </td>
                        <td className="py-2 pr-3">
                          {d.whoisGuardEnabled ? t("yes") : t("no")}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void openDomain(d)}
                            >
                              {t("manage")}
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full"
                              disabled={busy}
                              onClick={() => void renew(d)}
                            >
                              {t("renew")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="w-[min(96vw,44rem)] gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-4 pr-14 md:px-6">
            <DialogTitle className="text-xl md:text-2xl">
              {active?.domainName}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("manageDialogHint")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/10 px-4 py-3 md:px-5">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => void loadTab(id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  tab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/70 bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto px-5 py-4 md:px-6">
            {tab === "overview" && active ? (
              <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      [t("colStatus"), active.status],
                      [
                        t("colExpires"),
                        active.expiresAt
                          ? new Date(active.expiresAt).toLocaleString(locale)
                          : "—",
                      ],
                      [
                        t("colLock"),
                        active.registrarLocked ? t("yes") : t("no"),
                      ],
                      [
                        t("colPrivacy"),
                        active.whoisGuardEnabled ? t("yes") : t("no"),
                      ],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border/50 bg-background/80 px-3 py-2.5"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => void renew(active)}
                >
                  {t("renew")}
                </Button>
              </section>
            ) : null}

            {(tab === "dns" || tab === "redirects") && (
              <section className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
                {hosts.map((h, i) => (
                  <div
                    key={i}
                    className="grid gap-2 rounded-xl border border-border/50 bg-background p-3 sm:grid-cols-4"
                  >
                    <Input
                      className="rounded-xl"
                      value={h.name}
                      onChange={(e) => {
                        const next = [...hosts];
                        next[i] = { ...h, name: e.target.value };
                        setHosts(next);
                      }}
                      placeholder="Name"
                    />
                    <Input
                      className="rounded-xl"
                      value={h.type}
                      onChange={(e) => {
                        const next = [...hosts];
                        next[i] = { ...h, type: e.target.value };
                        setHosts(next);
                      }}
                      placeholder="Type"
                    />
                    <Input
                      className="rounded-xl sm:col-span-2"
                      value={h.address}
                      onChange={(e) => {
                        const next = [...hosts];
                        next[i] = { ...h, address: e.target.value };
                        setHosts(next);
                      }}
                      placeholder="Address / URL"
                    />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      setHosts((prev) => [
                        ...prev,
                        {
                          name: "@",
                          type: tab === "redirects" ? "URL" : "A",
                          address: "",
                          ttl: "1800",
                        },
                      ])
                    }
                  >
                    {t("addRecord")}
                  </Button>
                  <Button
                    className="rounded-full"
                    disabled={busy}
                    onClick={() => void saveDns()}
                  >
                    {t("save")}
                  </Button>
                </div>
              </section>
            )}

            {tab === "nameservers" && (
              <section className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                  {t("nsHint")}
                </Label>
                <textarea
                  className="min-h-30 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  value={nameservers}
                  onChange={(e) => setNameservers(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={busy}
                    onClick={() => void saveNs("default")}
                  >
                    {t("useDefaultNs")}
                  </Button>
                  <Button
                    className="rounded-full"
                    disabled={busy}
                    onClick={() => void saveNs("custom")}
                  >
                    {t("saveCustomNs")}
                  </Button>
                </div>
              </section>
            )}

            {tab === "forwarding" && (
              <section className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
                {forwards.map((f, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-2">
                    <Input
                      className="rounded-xl"
                      value={f.mailbox}
                      onChange={(e) => {
                        const next = [...forwards];
                        next[i] = { ...f, mailbox: e.target.value };
                        setForwards(next);
                      }}
                      placeholder="mailbox"
                    />
                    <Input
                      className="rounded-xl"
                      value={f.forwardTo}
                      onChange={(e) => {
                        const next = [...forwards];
                        next[i] = { ...f, forwardTo: e.target.value };
                        setForwards(next);
                      }}
                      placeholder="forward@example.com"
                    />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() =>
                      setForwards((p) => [...p, { mailbox: "", forwardTo: "" }])
                    }
                  >
                    {t("addForward")}
                  </Button>
                  <Button
                    className="rounded-full"
                    disabled={busy}
                    onClick={() => void saveForwards()}
                  >
                    {t("save")}
                  </Button>
                </div>
              </section>
            )}

            {tab === "dnssec" && (
              <section className="space-y-3 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <p className="text-sm text-muted-foreground">{t("dnssecHint")}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["keyTag", "Key tag"],
                      ["algorithm", "Algorithm"],
                      ["digestType", "Digest type"],
                      ["digest", "Digest"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <Label className="text-xs font-medium tracking-wide text-muted-foreground">
                        {label}
                      </Label>
                      <Input
                        className="rounded-xl bg-background"
                        value={dnssecForm[key]}
                        onChange={(e) =>
                          setDnssecForm((p) => ({ ...p, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => void addDnssec()}
                >
                  {t("addDnssec")}
                </Button>
              </section>
            )}

            {tab === "privacy" && active ? (
              <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("colLock")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={busy}
                      variant={active.registrarLocked ? "default" : "outline"}
                      onClick={() => void toggleLock(true)}
                    >
                      {t("lockOn")}
                    </Button>
                    <Button
                      className="rounded-full"
                      disabled={busy}
                      variant={!active.registrarLocked ? "default" : "outline"}
                      onClick={() => void toggleLock(false)}
                    >
                      {t("lockOff")}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("colPrivacy")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={busy}
                      variant={active.whoisGuardEnabled ? "default" : "outline"}
                      onClick={() => void togglePrivacy(true)}
                    >
                      {t("privacyOn")}
                    </Button>
                    <Button
                      className="rounded-full"
                      disabled={busy}
                      variant={!active.whoisGuardEnabled ? "default" : "outline"}
                      onClick={() => void togglePrivacy(false)}
                    >
                      {t("privacyOff")}
                    </Button>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
