"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { CrmShell } from "@/components/crm/CrmShell";
import { SoftLink } from "@/components/shared/SoftLink";
import { localizedHref } from "@/i18n/pathnames";
import { Card, CardContent } from "@/components/ui/card";

type Item = {
  id: string;
  name: string;
  boardId: string;
  boardName: string;
  groupName: string;
  updatedAt: string;
};

export default function MyWorkPage() {
  const t = useTranslations("crm");
  const locale = useLocale();
  const { data, isLoading } = useQuery({
    queryKey: ["crm-my-work"],
    queryFn: async () => {
      const res = await fetch("/api/crm/my-work");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ items: Item[] }>;
    },
  });

  return (
    <CrmShell title={t("myWork")} subtitle={t("myWorkSubtitle")}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : (
        <div className="space-y-2">
          {(data?.items || []).map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div>
                  <SoftLink
                    href={localizedHref(locale, `/crm/boards/${item.boardId}?item=${item.id}`)}
                    className="font-medium hover:underline"
                  >
                    {item.name}
                  </SoftLink>
                  <p className="text-xs text-muted-foreground">
                    {item.boardName} · {item.groupName}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
          {!data?.items?.length ? (
            <p className="text-sm text-muted-foreground">{t("opsNoMyWork")}</p>
          ) : null}
        </div>
      )}
    </CrmShell>
  );
}
