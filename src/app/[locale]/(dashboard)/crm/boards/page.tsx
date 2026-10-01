"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Copy, Trash2 } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type BoardRow = {
  id: string;
  name: string;
  description: string | null;
  templateKey: string | null;
  website: string | null;
  _count: { items: number; groups: number };
  workspace: { id: string; name: string };
};

type Template = { key: string; name: string; description: string };

export default function CrmBoardsPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["crm-boards"],
    queryFn: async () => {
      const res = await fetch("/api/crm/boards");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ boards: BoardRow[]; templates: Template[] }>;
    },
  });

  async function createBoard() {
    setCreating(true);
    try {
      const res = await fetch("/api/crm/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          templateKey: templateKey || undefined,
        }),
      });
      if (!res.ok) throw new Error("fail");
      const board = await res.json();
      toast.success(t("opsBoardCreated"));
      setOpen(false);
      setName("");
      setTemplateKey("");
      await qc.invalidateQueries({ queryKey: ["crm-boards"] });
      window.location.href = localizedHref(locale, `/crm/boards/${board.id}`);
    } catch {
      toast.error(t("actionFailed"));
    } finally {
      setCreating(false);
    }
  }

  async function duplicate(id: string) {
    const res = await fetch(`/api/crm/boards/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(t("opsBoardDuplicated"));
      qc.invalidateQueries({ queryKey: ["crm-boards"] });
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("opsConfirmDeleteBoard"))) return;
    const res = await fetch(`/api/crm/boards?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) toast.error(t("actionFailed"));
    else {
      toast.success(t("opsBoardDeleted"));
      qc.invalidateQueries({ queryKey: ["crm-boards"] });
    }
  }

  return (
    <CrmShell
      title={t("boards")}
      subtitle={t("boardsSubtitle")}
      actions={
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t("opsNewBoard")}
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.boards || []).map((board) => (
            <Card key={board.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      <SoftLink
                        href={localizedHref(locale, `/crm/boards/${board.id}`)}
                        className="hover:underline"
                      >
                        {board.name}
                      </SoftLink>
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{board.workspace.name}</p>
                  </div>
                  {board.templateKey ? <Badge variant="secondary">{board.templateKey}</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {board.description || t("opsNoDescription")}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>
                    {board._count.items} {t("opsItems")}
                  </span>
                  <span>·</span>
                  <span>
                    {board._count.groups} {t("opsGroups")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <SoftLink href={localizedHref(locale, `/crm/boards/${board.id}`)}>
                    <Button size="sm">{t("opsOpenBoard")}</Button>
                  </SoftLink>
                  <Button size="sm" variant="outline" onClick={() => void duplicate(board.id)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void remove(board.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!data?.boards?.length ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {t("opsNoBoards")}
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("opsNewBoard")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t("opsBoardName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={templateKey}
              onChange={(e) => setTemplateKey(e.target.value)}
            >
              <option value="">{t("opsBlankBoard")}</option>
              {(data?.templates || []).map((tpl) => (
                <option key={tpl.key} value={tpl.key}>
                  {tpl.name}
                </option>
              ))}
            </select>
            {templateKey ? (
              <p className="text-xs text-muted-foreground">
                {data?.templates.find((x) => x.key === templateKey)?.description}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button disabled={creating} onClick={() => void createBoard()}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CrmShell>
  );
}
