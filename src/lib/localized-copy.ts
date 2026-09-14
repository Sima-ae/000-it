import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  LOCALIZED_COPY_TTL_MS,
  getCatalogOverlaySync,
  getLocalizedCopySync,
  getUiMessageOverlaySync,
  localizedCopyCacheAge,
  localizedCopyRowKey,
  rememberLocalizedCopy,
  replaceLocalizedCopyCache,
  type LocalizedKind,
} from "@/lib/localized-copy-cache";

export type { CatalogOverlay, LocalizedKind } from "@/lib/localized-copy-cache";
export {
  getCatalogOverlaySync,
  getLocalizedCopySync,
  getUiMessageOverlaySync,
  rememberLocalizedCopy,
};

export function hashSource(value: unknown): string {
  return createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

export async function hydrateLocalizedCopy(locale: string) {
  if (locale === "nl" || locale === "en") return;
  if (localizedCopyCacheAge(locale) < LOCALIZED_COPY_TTL_MS) return;

  try {
    const rows = await prisma.localizedCopy.findMany({ where: { locale } });
    const map = new Map<string, unknown>();
    for (const row of rows) {
      map.set(localizedCopyRowKey(row.kind, row.itemKey), row.payload);
    }
    replaceLocalizedCopyCache(locale, map);
  } catch (error) {
    console.warn(
      "[localized-copy] hydrate failed",
      locale,
      error instanceof Error ? error.message : error,
    );
    if (localizedCopyCacheAge(locale) === Number.POSITIVE_INFINITY) {
      replaceLocalizedCopyCache(locale, new Map());
    }
  }
}

export async function upsertLocalizedCopy(input: {
  kind: LocalizedKind;
  itemKey: string;
  locale: string;
  payload: unknown;
  sourceHash: string;
}) {
  const row = await prisma.localizedCopy.upsert({
    where: {
      kind_itemKey_locale: {
        kind: input.kind,
        itemKey: input.itemKey,
        locale: input.locale,
      },
    },
    create: {
      kind: input.kind,
      itemKey: input.itemKey,
      locale: input.locale,
      payload: input.payload as Prisma.InputJsonValue,
      sourceHash: input.sourceHash,
    },
    update: {
      payload: input.payload as Prisma.InputJsonValue,
      sourceHash: input.sourceHash,
    },
  });
  rememberLocalizedCopy(input.kind, input.itemKey, input.locale, input.payload);
  return row;
}

export async function findLocalizedHash(
  kind: LocalizedKind,
  itemKey: string,
  locale: string,
): Promise<string | null> {
  const row = await prisma.localizedCopy.findUnique({
    where: {
      kind_itemKey_locale: { kind, itemKey, locale },
    },
    select: { sourceHash: true },
  });
  return row?.sourceHash ?? null;
}
