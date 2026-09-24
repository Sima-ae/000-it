import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AppointmentBooking } from "@/components/marketing/AppointmentBooking";
import { Reveal } from "@/components/marketing/Reveal";
import { serviceCatalog } from "@/content/fixweb/catalog";
import { brandingFallbackForServiceSlug } from "@/lib/branding-images";
import { getServiceCardMeta } from "@/lib/fixweb-content";
import { buildStaticPageMetadata } from "@/lib/seo";
import {
  getShopProductBySlug,
  loadShopCatalogFromDb,
  shopHasDiscount,
  shopUnitPriceInclCents,
} from "@/lib/shop/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildStaticPageMetadata(locale, "/afspraak");
}

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await loadShopCatalogFromDb();

  const servicePreviews = Object.fromEntries(
    await Promise.all(
      serviceCatalog.map(async (item) => {
        const shop = getShopProductBySlug(item.slug);
        const card = await getServiceCardMeta(item.slug, locale);
        const hasPrice =
          Boolean(shop) &&
          shop!.published !== false &&
          shop!.priceInclCents > 0;
        const unitCents = hasPrice ? shopUnitPriceInclCents(shop!) : null;
        const listCents =
          hasPrice && shopHasDiscount(shop!) ? shop!.priceInclCents : null;
        const perMonth =
          hasPrice &&
          ((shop!.checkoutMonths != null && shop!.checkoutMonths > 1) ||
            shop!.billingInterval === "monthly");

        return [
          item.slug,
          {
            image:
              card?.image ||
              shop?.image ||
              brandingFallbackForServiceSlug(item.slug, item.group) ||
              null,
            price: unitCents != null ? unitCents / 100 : null,
            listPrice: listCents != null ? listCents / 100 : null,
            perMonth,
          },
        ];
      }),
    ),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
      <Reveal>
        <AppointmentBooking servicePreviews={servicePreviews} />
      </Reveal>
    </div>
  );
}
