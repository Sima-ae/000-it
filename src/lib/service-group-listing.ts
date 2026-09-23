import {
  serviceCatalog,
  type ServiceGroupId,
  type ServiceNavItem,
} from "@/content/fixweb/catalog";
import {
  catalogServiceSummary,
  catalogServiceTitle,
} from "@/content/fixweb/catalog-title";
import { getServiceCardMeta } from "@/lib/fixweb-content";

export type ServiceGroupCard = {
  item: ServiceNavItem;
  title: string;
  summary: string;
  price?: number | null;
  listPrice?: number | null;
  image?: string | null;
};

export async function listServiceGroupCards(
  locale: string,
  groupId: ServiceGroupId,
  opts?: { includeCustomHref?: boolean },
): Promise<ServiceGroupCard[]> {
  const includeCustomHref = opts?.includeCustomHref !== false;
  const items = serviceCatalog.filter((item) => {
    if (item.group !== groupId) return false;
    if (!includeCustomHref && item.href) return false;
    return true;
  });

  const cards = await Promise.all(
    items.map(async (item) => {
      const content = await getServiceCardMeta(item.slug, locale);
      const title = catalogServiceTitle(item.slug, locale, item.title);
      const summary =
        content?.subtitle ||
        catalogServiceSummary(item.slug, locale, item.summary || "") ||
        "";
      return {
        item,
        title,
        summary,
        price: content?.price ?? undefined,
        listPrice:
          content && "listPrice" in content
            ? ((content.listPrice as number | null | undefined) ?? undefined)
            : undefined,
        image: content?.image ?? undefined,
        hasBody: Boolean(content?.hasBody || item.href || summary),
      };
    }),
  );

  return cards
    .filter((card) => card.hasBody)
    .map(({ hasBody: _hasBody, ...card }) => card);
}
