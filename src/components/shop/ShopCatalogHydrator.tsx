"use client";

import { useEffect } from "react";
import {
  setRuntimeShopCatalog,
  type ShopProduct,
} from "@/lib/shop/catalog";

/**
 * Hydrate the client-side shop catalog from the DB-backed public API
 * so cart resolve / add-to-cart keep working after admin edits.
 */
export function ShopCatalogHydrator() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/shop/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ShopProduct[];
        if (!cancelled && Array.isArray(data) && data.length) {
          setRuntimeShopCatalog(data);
        }
      } catch {
        // Keep static fallback already in the module.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
