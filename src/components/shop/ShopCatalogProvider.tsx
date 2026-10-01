"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  localizeShopProduct,
  setRuntimeShopCatalog,
  type ShopProduct,
} from "@/lib/shop/catalog";
import { catalogServiceTitle } from "@/content/fixweb/catalog-title";

const CATALOG_CHANNEL = "shop-catalog-sync";

type ShopCatalogContextValue = {
  products: ShopProduct[];
  productBySlug: (slug: string) => ShopProduct | undefined;
  titleFor: (slug: string, locale: string, fallback: string) => string;
  refresh: () => Promise<void>;
};

const ShopCatalogContext = createContext<ShopCatalogContextValue>({
  products: [],
  productBySlug: () => undefined,
  titleFor: (slug, locale, fallback) =>
    catalogServiceTitle(slug, locale, fallback),
  refresh: async () => undefined,
});

function titleFromProduct(
  product: ShopProduct | undefined,
  slug: string,
  locale: string,
  fallback: string,
) {
  if (product && product.published !== false) {
    const live = localizeShopProduct(product, locale).localizedName?.trim();
    if (live) return live;
  }
  return catalogServiceTitle(slug, locale, fallback);
}

function notifyCatalogChanged() {
  try {
    const channel = new BroadcastChannel(CATALOG_CHANNEL);
    channel.postMessage({ type: "refresh" });
    channel.close();
  } catch {
    // BroadcastChannel unavailable
  }
  try {
    window.dispatchEvent(new Event("shop-catalog-changed"));
  } catch {
    // ignore
  }
}

/** Call after hosting/shop admin saves so open public tabs refresh. */
export function broadcastShopCatalogChanged() {
  notifyCatalogChanged();
}

export function ShopCatalogProvider({
  initialProducts = [],
  children,
}: {
  initialProducts?: ShopProduct[];
  children: ReactNode;
}) {
  const [products, setProducts] = useState<ShopProduct[]>(initialProducts);

  const apply = useCallback((next: ShopProduct[]) => {
    setProducts(next);
    if (next.length) setRuntimeShopCatalog(next);
  }, []);

  useEffect(() => {
    if (initialProducts.length) {
      apply(initialProducts);
    }
  }, [initialProducts, apply]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/shop/products", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ShopProduct[];
      if (Array.isArray(data) && data.length) apply(data);
    } catch {
      // Keep last known catalog.
    }
  }, [apply]);

  useEffect(() => {
    void refresh();

    const onFocus = () => {
      void refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onCustom = () => {
      void refresh();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("shop-catalog-changed", onCustom);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CATALOG_CHANNEL);
      channel.onmessage = () => {
        void refresh();
      };
    } catch {
      channel = null;
    }

    const interval = window.setInterval(() => {
      void refresh();
    }, 30_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("shop-catalog-changed", onCustom);
      window.clearInterval(interval);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
  }, [refresh]);

  const bySlug = useMemo(() => {
    const map = new Map<string, ShopProduct>();
    for (const product of products) map.set(product.slug, product);
    return map;
  }, [products]);

  const productBySlug = useCallback(
    (slug: string) => bySlug.get(slug),
    [bySlug],
  );

  const value = useMemo<ShopCatalogContextValue>(
    () => ({
      products,
      productBySlug,
      titleFor: (slug, locale, fallback) =>
        titleFromProduct(bySlug.get(slug), slug, locale, fallback),
      refresh,
    }),
    [products, bySlug, productBySlug, refresh],
  );

  return (
    <ShopCatalogContext.Provider value={value}>
      {children}
    </ShopCatalogContext.Provider>
  );
}

export function useShopCatalogTitle(
  slug: string,
  locale: string,
  fallback: string,
) {
  return useContext(ShopCatalogContext).titleFor(slug, locale, fallback);
}

export function useShopCatalog() {
  return useContext(ShopCatalogContext);
}

/** Prefer live provider product over a possibly-stale server prop. */
export function useLiveShopProduct(fallback: ShopProduct | null | undefined) {
  const { productBySlug } = useShopCatalog();
  if (!fallback) return undefined;
  return productBySlug(fallback.slug) ?? fallback;
}

export function useLiveShopProducts(fallbacks: ShopProduct[]) {
  const { productBySlug, products } = useShopCatalog();
  const fallbackKey = fallbacks.map((p) => p.slug).join("|");
  return useMemo(() => {
    if (!fallbacks.length) return fallbacks;
    return fallbacks.map((product) => productBySlug(product.slug) ?? product);
    // fallbackKey tracks prop identity without depending on array reference churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackKey, productBySlug, products]);
}
