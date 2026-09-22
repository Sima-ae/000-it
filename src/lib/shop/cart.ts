import { centsToEuros, splitInclusiveVatCents, VAT_RATE } from "@/lib/shop/vat";
import {
  getShopProductById,
  shopChargeInclCents,
  type ShopProduct,
} from "@/lib/shop/catalog";

export type ResolvedCartLine = {
  product: ShopProduct;
  quantity: number;
  /** Charged unit price (e.g. monthly × 12 for yearly hosting). */
  unitInclCents: number;
  lineInclCents: number;
  lineExclCents: number;
  lineVatCents: number;
};

export type CartTotals = {
  lines: ResolvedCartLine[];
  subtotalExclCents: number;
  vatCents: number;
  totalInclCents: number;
  vatRate: number;
};

export function resolveCartItems(
  items: Array<{ productId: string; quantity: number }>,
): CartTotals {
  const lines: ResolvedCartLine[] = [];

  for (const item of items) {
    const product = getShopProductById(item.productId);
    if (!product) continue;
    const quantity = Math.max(1, Math.floor(item.quantity || 1));
    const unitInclCents = shopChargeInclCents(product);
    const lineInclCents = unitInclCents * quantity;
    const { exclCents, vatCents } = splitInclusiveVatCents(lineInclCents);
    lines.push({
      product,
      quantity,
      unitInclCents,
      lineInclCents,
      lineExclCents: exclCents,
      lineVatCents: vatCents,
    });
  }

  const totalInclCents = lines.reduce((s, l) => s + l.lineInclCents, 0);
  const { exclCents, vatCents } = splitInclusiveVatCents(totalInclCents);

  return {
    lines,
    subtotalExclCents: exclCents,
    vatCents,
    totalInclCents,
    vatRate: VAT_RATE,
  };
}

export function cartTotalsInEuros(totals: CartTotals) {
  return {
    subtotalExcl: centsToEuros(totals.subtotalExclCents),
    vat: centsToEuros(totals.vatCents),
    totalIncl: centsToEuros(totals.totalInclCents),
  };
}
