"use client";

import { Suspense, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckoutInvoiceBackup } from "@/components/shop/CheckoutInvoiceBackup";

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

export default function MyDomainsPage() {
  const t = useTranslations("myDomains");
  const locale = useLocale();
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

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["my-domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains/mine");
      if (!res.ok) throw new Error("Failed");
      return (await res.json()) as OwnedDomain[];
    },
  });

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

  return (
    <div className="space-y-6 p-6 md:p-8">
      <Suspense fallback={null}>
        <CheckoutInvoiceBackup />
      </Suspense>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void syncAll()}>
            {t("sync")}
          </Button>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : !domains.length ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : (
            <table className="w-full min-w-180 border-collapse text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-2 pr-2 w-8" />
                  <th className="py-2 pr-3">{t("colDomain")}</th>
                  <th className="py-2 pr-3">{t("colStatus")}</th>
                  <th className="py-2 pr-3">{t("colExpires")}</th>
                  <th className="py-2 pr-3">{t("colLock")}</th>
                  <th className="py-2 pr-3">{t("colPrivacy")}</th>
                  <th className="py-2 pr-3">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
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
                    <td className="py-2 pr-3 text-muted-foreground">
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
                          onClick={() => void openDomain(d)}
                        >
                          {t("manage")}
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => void renew(d)}
                        >
                          {t("renew")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{active?.domainName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.map(([id, label]) => (
              <Button
                key={id}
                size="sm"
                variant={tab === id ? "default" : "outline"}
                onClick={() => void loadTab(id)}
              >
                {label}
              </Button>
            ))}
          </div>

          {tab === "overview" && active && (
            <div className="space-y-3 pt-3 text-sm">
              <p>
                <span className="text-muted-foreground">{t("colStatus")}: </span>
                {active.status}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colExpires")}: </span>
                {active.expiresAt
                  ? new Date(active.expiresAt).toLocaleString(locale)
                  : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colLock")}: </span>
                {active.registrarLocked ? t("yes") : t("no")}
              </p>
              <p>
                <span className="text-muted-foreground">{t("colPrivacy")}: </span>
                {active.whoisGuardEnabled ? t("yes") : t("no")}
              </p>
              <Button disabled={busy} onClick={() => void renew(active)}>
                {t("renew")}
              </Button>
            </div>
          )}

          {(tab === "dns" || tab === "redirects") && (
            <div className="space-y-3 pt-3">
              {hosts.map((h, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-4"
                >
                  <Input
                    value={h.name}
                    onChange={(e) => {
                      const next = [...hosts];
                      next[i] = { ...h, name: e.target.value };
                      setHosts(next);
                    }}
                    placeholder="Name"
                  />
                  <Input
                    value={h.type}
                    onChange={(e) => {
                      const next = [...hosts];
                      next[i] = { ...h, type: e.target.value };
                      setHosts(next);
                    }}
                    placeholder="Type"
                  />
                  <Input
                    className="sm:col-span-2"
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
                <Button disabled={busy} onClick={() => void saveDns()}>
                  {t("save")}
                </Button>
              </div>
            </div>
          )}

          {tab === "nameservers" && (
            <div className="space-y-3 pt-3">
              <Label>{t("nsHint")}</Label>
              <textarea
                className="min-h-30 w-full rounded-md border border-border bg-background p-3 text-sm"
                value={nameservers}
                onChange={(e) => setNameservers(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void saveNs("default")}
                >
                  {t("useDefaultNs")}
                </Button>
                <Button disabled={busy} onClick={() => void saveNs("custom")}>
                  {t("saveCustomNs")}
                </Button>
              </div>
            </div>
          )}

          {tab === "forwarding" && (
            <div className="space-y-3 pt-3">
              {forwards.map((f, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={f.mailbox}
                    onChange={(e) => {
                      const next = [...forwards];
                      next[i] = { ...f, mailbox: e.target.value };
                      setForwards(next);
                    }}
                    placeholder="mailbox"
                  />
                  <Input
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
                  onClick={() =>
                    setForwards((p) => [...p, { mailbox: "", forwardTo: "" }])
                  }
                >
                  {t("addForward")}
                </Button>
                <Button disabled={busy} onClick={() => void saveForwards()}>
                  {t("save")}
                </Button>
              </div>
            </div>
          )}

          {tab === "dnssec" && (
            <div className="space-y-3 pt-3">
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
                  <div key={key}>
                    <Label>{label}</Label>
                    <Input
                      value={dnssecForm[key]}
                      onChange={(e) =>
                        setDnssecForm((p) => ({ ...p, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <Button disabled={busy} onClick={() => void addDnssec()}>
                {t("addDnssec")}
              </Button>
            </div>
          )}

          {tab === "privacy" && active && (
            <div className="space-y-3 pt-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy}
                  variant={active.registrarLocked ? "default" : "outline"}
                  onClick={() => void toggleLock(true)}
                >
                  {t("lockOn")}
                </Button>
                <Button
                  disabled={busy}
                  variant={!active.registrarLocked ? "default" : "outline"}
                  onClick={() => void toggleLock(false)}
                >
                  {t("lockOff")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy}
                  variant={active.whoisGuardEnabled ? "default" : "outline"}
                  onClick={() => void togglePrivacy(true)}
                >
                  {t("privacyOn")}
                </Button>
                <Button
                  disabled={busy}
                  variant={!active.whoisGuardEnabled ? "default" : "outline"}
                  onClick={() => void togglePrivacy(false)}
                >
                  {t("privacyOff")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
