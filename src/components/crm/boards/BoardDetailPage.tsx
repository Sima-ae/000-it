"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CalendarDays,
  Columns3,
  GanttChart,
  LayoutGrid,
  Plus,
  Table2,
} from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Cell = { id: string; columnId: string; value: unknown };
type Column = {
  id: string;
  title: string;
  type: string;
  settings: unknown;
  sortOrder: number;
};
type Item = {
  id: string;
  name: string;
  groupId: string;
  sortOrder: number;
  cells: Cell[];
  subitems: { id: string; name: string; status: string | null }[];
  updates: { id: string; body: string; createdAt: string; user: { name: string | null; email: string } }[];
};
type Group = {
  id: string;
  name: string;
  color: string | null;
  collapsed: boolean;
  items: Item[];
};
type Staff = { id: string; name: string | null; email: string };
type Board = {
  id: string;
  name: string;
  description: string | null;
  columns: Column[];
  groups: Group[];
  views: { id: string; name: string; type: string }[];
  members: { id: string; role: string; user: Staff }[];
};

function cellValue(item: Item, columnId: string) {
  return item.cells.find((c) => c.columnId === columnId)?.value;
}

function statusLabel(settings: unknown, value: unknown) {
  const labels =
    settings && typeof settings === "object" && "labels" in (settings as object)
      ? ((settings as { labels: { id: string; label: string; color: string }[] }).labels || [])
      : [];
  const id =
    value && typeof value === "object" && value !== null && "id" in value
      ? String((value as { id: string }).id)
      : String(value || "");
  const found = labels.find((l) => l.id === id);
  return found || { id: id || "unset", label: id || "—", color: "#c4c4c4" };
}

export function BoardDetailPage({ boardId }: { boardId: string }) {
  const t = useTranslations("crm");
  const locale = useLocale();
  const qc = useQueryClient();
  const [viewType, setViewType] = useState<"TABLE" | "KANBAN" | "CALENDAR" | "TIMELINE">("TABLE");
  const [search, setSearch] = useState("");
  const [personFilter, setPersonFilter] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [updateBody, setUpdateBody] = useState("");
  const [addColOpen, setAddColOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColType, setNewColType] = useState("TEXT");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-board", boardId],
    queryFn: async () => {
      const res = await fetch(`/api/crm/boards/${boardId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ board: Board; staff: Staff[]; canEdit: boolean }>;
    },
  });

  const board = data?.board;
  const staff = data?.staff || [];
  const canEdit = data?.canEdit ?? false;

  const filteredGroups = useMemo(() => {
    if (!board) return [];
    return board.groups.map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (personFilter) {
          const peopleCols = board.columns.filter((c) => c.type === "PEOPLE");
          const match = peopleCols.some((col) => {
            const v = cellValue(item, col.id) as { userIds?: string[] } | string[] | null;
            if (!v) return false;
            const ids = Array.isArray(v) ? v : v.userIds || [];
            return ids.includes(personFilter);
          });
          if (!match) return false;
        }
        return true;
      }),
    }));
  }, [board, search, personFilter]);

  const selectedItem = useMemo(() => {
    if (!board || !selectedItemId) return null;
    for (const g of board.groups) {
      const item = g.items.find((i) => i.id === selectedItemId);
      if (item) return item;
    }
    return null;
  }, [board, selectedItemId]);

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["crm-board", boardId] });
  }

  async function addItem(groupId: string) {
    const name = (newItemName[groupId] || "").trim();
    if (!name) return;
    const res = await fetch(`/api/crm/boards/${boardId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, name }),
    });
    if (!res.ok) {
      toast.error(t("actionFailed"));
      return;
    }
    setNewItemName((s) => ({ ...s, [groupId]: "" }));
    await refresh();
  }

  async function addGroup() {
    const name = window.prompt(t("opsNewGroup"));
    if (!name?.trim()) return;
    const res = await fetch(`/api/crm/boards/${boardId}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else await refresh();
  }

  async function upsertCell(itemId: string, columnId: string, value: unknown) {
    const res = await fetch(`/api/crm/items/${itemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsertCell", columnId, value }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else await refresh();
  }

  async function renameItem(itemId: string, name: string) {
    const res = await fetch(`/api/crm/boards/${boardId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, name }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else await refresh();
  }

  async function addUpdate() {
    if (!selectedItemId || !updateBody.trim()) return;
    const res = await fetch(`/api/crm/items/${selectedItemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addUpdate", body: updateBody.trim() }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      setUpdateBody("");
      await refresh();
    }
  }

  async function addSubitem() {
    if (!selectedItemId) return;
    const name = window.prompt(t("opsNewSubitem"));
    if (!name?.trim()) return;
    const res = await fetch(`/api/crm/items/${selectedItemId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addSubitem", name: name.trim() }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else await refresh();
  }

  async function addColumn() {
    const res = await fetch(`/api/crm/boards/${boardId}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newColTitle || "Column", type: newColType }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      setAddColOpen(false);
      setNewColTitle("");
      await refresh();
    }
  }

  async function moveItemGroup(itemId: string, groupId: string) {
    const res = await fetch(`/api/crm/boards/${boardId}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, groupId }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else await refresh();
  }

  function renderCellEditor(item: Item, col: Column) {
    const raw = cellValue(item, col.id);
    if (col.type === "STATUS") {
      const labels =
        col.settings && typeof col.settings === "object" && "labels" in (col.settings as object)
          ? ((col.settings as { labels: { id: string; label: string; color: string }[] }).labels || [])
          : [];
      const current = statusLabel(col.settings, raw);
      return (
        <select
          className="h-8 w-full rounded-md border bg-background px-1 text-xs"
          style={{ borderColor: current.color }}
          disabled={!canEdit}
          value={current.id}
          onChange={(e) => {
            const lab = labels.find((l) => l.id === e.target.value);
            void upsertCell(item.id, col.id, lab ? { id: lab.id, label: lab.label, color: lab.color } : { id: e.target.value });
          }}
        >
          <option value="">—</option>
          {labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      );
    }
    if (col.type === "PEOPLE") {
      const ids = Array.isArray(raw)
        ? (raw as string[])
        : raw && typeof raw === "object" && "userIds" in (raw as object)
          ? ((raw as { userIds: string[] }).userIds || [])
          : [];
      return (
        <select
          className="h-8 w-full rounded-md border bg-background px-1 text-xs"
          disabled={!canEdit}
          value={ids[0] || ""}
          onChange={(e) =>
            void upsertCell(item.id, col.id, e.target.value ? { userIds: [e.target.value] } : { userIds: [] })
          }
        >
          <option value="">—</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name || s.email}
            </option>
          ))}
        </select>
      );
    }
    if (col.type === "DATE") {
      const val =
        typeof raw === "string"
          ? raw.slice(0, 10)
          : raw && typeof raw === "object" && raw !== null && "date" in raw
            ? String((raw as { date: string }).date).slice(0, 10)
            : "";
      return (
        <Input
          type="date"
          className="h-8 text-xs"
          disabled={!canEdit}
          value={val}
          onChange={(e) => void upsertCell(item.id, col.id, e.target.value ? { date: e.target.value } : null)}
        />
      );
    }
    if (col.type === "WEBSITE") {
      const val = typeof raw === "string" ? raw : (raw as { value?: string } | null)?.value || "";
      return (
        <select
          className="h-8 w-full rounded-md border bg-background px-1 text-xs"
          disabled={!canEdit}
          value={val}
          onChange={(e) => void upsertCell(item.id, col.id, e.target.value || null)}
        >
          <option value="">—</option>
          <option value="TRIPLEZERO">000-it.com</option>
          <option value="EXTRAHOSTING">extrahosting.eu</option>
        </select>
      );
    }
    if (col.type === "CHECKBOX") {
      const checked = Boolean(raw === true || (raw as { checked?: boolean })?.checked);
      return (
        <input
          type="checkbox"
          disabled={!canEdit}
          checked={checked}
          onChange={(e) => void upsertCell(item.id, col.id, { checked: e.target.checked })}
        />
      );
    }
    if (col.type === "DROPDOWN") {
      const options =
        col.settings && typeof col.settings === "object" && "options" in (col.settings as object)
          ? ((col.settings as { options: string[] }).options || [])
          : [];
      const val = typeof raw === "string" ? raw : (raw as { value?: string } | null)?.value || "";
      return (
        <select
          className="h-8 w-full rounded-md border bg-background px-1 text-xs"
          disabled={!canEdit}
          value={val}
          onChange={(e) => void upsertCell(item.id, col.id, e.target.value || null)}
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (col.type === "NUMBER" || col.type === "RATING") {
      const val =
        typeof raw === "number" ? raw : Number((raw as { value?: number } | null)?.value ?? "") || "";
      return (
        <Input
          type="number"
          className="h-8 text-xs"
          disabled={!canEdit}
          value={val}
          onChange={(e) =>
            void upsertCell(item.id, col.id, e.target.value === "" ? null : Number(e.target.value))
          }
        />
      );
    }
    const text =
      typeof raw === "string"
        ? raw
        : raw && typeof raw === "object" && raw !== null && "text" in raw
          ? String((raw as { text: string }).text)
          : raw
            ? String(raw)
            : "";
    return (
      <Input
        className="h-8 text-xs"
        disabled={!canEdit}
        defaultValue={text}
        key={`${item.id}-${col.id}-${text}`}
        onBlur={(e) => {
          if (e.target.value !== text) void upsertCell(item.id, col.id, e.target.value);
        }}
      />
    );
  }

  const statusColumn = board?.columns.find((c) => c.type === "STATUS");
  const dateColumn = board?.columns.find((c) => c.type === "DATE" || c.type === "TIMELINE");

  return (
    <CrmShell
      title={board?.name || t("boards")}
      subtitle={board?.description || t("boardsSubtitle")}
      actions={
        <div className="flex flex-wrap gap-2">
          <SoftLink href={localizedHref(locale, "/crm/boards")}>
            <Button variant="outline">{t("back")}</Button>
          </SoftLink>
          {canEdit ? (
            <>
              <Button variant="outline" onClick={() => setAddColOpen(true)}>
                <Columns3 className="mr-1 h-4 w-4" />
                {t("opsAddColumn")}
              </Button>
              <Button variant="outline" onClick={() => void addGroup()}>
                <Plus className="mr-1 h-4 w-4" />
                {t("opsAddGroup")}
              </Button>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const uid = e.target.value;
                  e.target.value = "";
                  if (!uid) return;
                  void fetch(`/api/crm/boards/${boardId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "addMember", userId: uid, role: "EDITOR" }),
                  }).then((res) => {
                    if (!res.ok) toast.error(t("actionFailed"));
                    else {
                      toast.success(t("opsMemberAdded"));
                      void refresh();
                    }
                  });
                }}
              >
                <option value="">{t("opsAddMember")}</option>
                {staff
                  .filter((s) => !(board?.members || []).some((m) => m.user.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.email}
                    </option>
                  ))}
              </select>
            </>
          ) : null}
        </div>
      }
    >
      {isLoading || !board ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["TABLE", Table2, t("opsViewTable")],
                ["KANBAN", LayoutGrid, t("opsViewKanban")],
                ["CALENDAR", CalendarDays, t("opsViewCalendar")],
                ["TIMELINE", GanttChart, t("opsViewTimeline")],
              ] as const
            ).map(([type, Icon, label]) => (
              <Button
                key={type}
                size="sm"
                variant={viewType === type ? "default" : "outline"}
                onClick={() => setViewType(type)}
              >
                <Icon className="mr-1 h-3.5 w-3.5" />
                {label}
              </Button>
            ))}
            <Input
              className="ml-auto max-w-xs"
              placeholder={t("opsSearchItems")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
            >
              <option value="">{t("opsAllPeople")}</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.email}
                </option>
              ))}
            </select>
          </div>

          {viewType === "TABLE" ? (
            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-2xl border">
                  <div
                    className="flex items-center gap-2 border-b px-4 py-2 text-sm font-semibold"
                    style={{ borderLeftWidth: 4, borderLeftColor: group.color || "#579bfc" }}
                  >
                    {group.name}
                    <Badge variant="secondary">{group.items.length}</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-200 text-left text-sm">
                      <thead className="bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">{t("opsItem")}</th>
                          {board.columns.map((col) => (
                            <th key={col.id} className="px-3 py-2 font-medium">
                              {col.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-muted/20">
                            <td className="px-3 py-1.5">
                              <button
                                type="button"
                                className="text-left font-medium hover:underline"
                                onClick={() => setSelectedItemId(item.id)}
                              >
                                {item.name}
                              </button>
                            </td>
                            {board.columns.map((col) => (
                              <td key={col.id} className="px-2 py-1.5">
                                {renderCellEditor(item, col)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {canEdit ? (
                          <tr className="border-t bg-muted/10">
                            <td className="px-3 py-2" colSpan={board.columns.length + 1}>
                              <div className="flex max-w-md gap-2">
                                <Input
                                  placeholder={t("opsAddItem")}
                                  value={newItemName[group.id] || ""}
                                  onChange={(e) =>
                                    setNewItemName((s) => ({ ...s, [group.id]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") void addItem(group.id);
                                  }}
                                />
                                <Button size="sm" onClick={() => void addItem(group.id)}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {viewType === "KANBAN" && statusColumn ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {(
                (
                  statusColumn.settings as { labels?: { id: string; label: string; color: string }[] } | null
                )?.labels || [{ id: "unset", label: "—", color: "#c4c4c4" }]
              ).map((label) => {
                const items = filteredGroups.flatMap((g) =>
                  g.items.filter((item) => statusLabel(statusColumn.settings, cellValue(item, statusColumn.id)).id === label.id),
                );
                return (
                  <div key={label.id} className="w-72 shrink-0 rounded-2xl border bg-muted/20">
                    <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: label.color }} />
                      {label.label}
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <div className="space-y-2 p-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full rounded-xl border bg-background p-3 text-left text-sm shadow-sm hover:border-primary/40"
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {viewType === "KANBAN" && !statusColumn ? (
            <p className="text-sm text-muted-foreground">{t("opsNeedStatusColumn")}</p>
          ) : null}

          {viewType === "CALENDAR" ? (
            <div className="space-y-2 rounded-2xl border p-4">
              {!dateColumn ? (
                <p className="text-sm text-muted-foreground">{t("opsNeedDateColumn")}</p>
              ) : (
                filteredGroups
                  .flatMap((g) => g.items)
                  .map((item) => {
                    const raw = cellValue(item, dateColumn.id);
                    const date =
                      typeof raw === "string"
                        ? raw.slice(0, 10)
                        : raw && typeof raw === "object" && raw !== null && "date" in raw
                          ? String((raw as { date: string }).date).slice(0, 10)
                          : t("opsNoDate");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-muted/30"
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{date}</span>
                      </button>
                    );
                  })
              )}
            </div>
          ) : null}

          {viewType === "TIMELINE" ? (
            <div className="space-y-3 rounded-2xl border p-4">
              {filteredGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.name}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm",
                          "hover:bg-muted/30",
                        )}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <div
                          className="h-2 flex-1 rounded-full bg-primary/20"
                          style={{ maxWidth: `${Math.min(100, 30 + idx * 12)}%` }}
                        />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <Dialog open={Boolean(selectedItem)} onOpenChange={(o) => !o && setSelectedItemId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("opsItemPanel")}</DialogTitle>
          </DialogHeader>
          {selectedItem ? (
            <div className="space-y-4">
              <Input
                defaultValue={selectedItem.name}
                disabled={!canEdit}
                onBlur={(e) => {
                  if (e.target.value.trim() && e.target.value !== selectedItem.name) {
                    void renameItem(selectedItem.id, e.target.value.trim());
                  }
                }}
              />
              {board ? (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">{t("opsMoveGroup")}</label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                    disabled={!canEdit}
                    value={selectedItem.groupId}
                    onChange={(e) => void moveItemGroup(selectedItem.id, e.target.value)}
                  >
                    {board.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">{t("opsSubitems")}</p>
                  {canEdit ? (
                    <Button size="sm" variant="outline" onClick={() => void addSubitem()}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                <ul className="space-y-1 text-sm">
                  {selectedItem.subitems.map((s) => (
                    <li key={s.id} className="rounded-md border px-2 py-1">
                      {s.name}
                    </li>
                  ))}
                  {!selectedItem.subitems.length ? (
                    <li className="text-muted-foreground">{t("opsNoSubitems")}</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">{t("opsUpdates")}</p>
                <div className="mb-2 space-y-2">
                  {(selectedItem.updates || []).map((u) => (
                    <div key={u.id} className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {u.user.name || u.user.email} · {new Date(u.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{u.body}</p>
                    </div>
                  ))}
                </div>
                {canEdit ? (
                  <div className="space-y-2">
                    <Textarea
                      value={updateBody}
                      onChange={(e) => setUpdateBody(e.target.value)}
                      placeholder={t("opsWriteUpdate")}
                    />
                    <Button size="sm" onClick={() => void addUpdate()}>
                      {t("send")}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={addColOpen} onOpenChange={setAddColOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("opsAddColumn")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("opsColumnTitle")}
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
            />
            <select
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={newColType}
              onChange={(e) => setNewColType(e.target.value)}
            >
              {[
                "STATUS", "PEOPLE", "DATE", "TIMELINE", "NUMBER", "TEXT", "LONG_TEXT",
                "DROPDOWN", "CHECKBOX", "TAGS", "LINK", "EMAIL", "PHONE", "FILE",
                "RATING", "WEBSITE", "ACTIVITY_TYPE",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button onClick={() => void addColumn()}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
