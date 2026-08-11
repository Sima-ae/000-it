"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { planProductId, type ShopBillingPeriod } from "@/lib/shop/catalog";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
  /** Add a plan SKU and remove the other billing period for the same plan. */
  addPlan: (
    planKey: "starter" | "growth",
    period: ShopBillingPeriod,
    quantity?: number,
  ) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId, quantity = 1) => {
        const qty = Math.max(1, Math.floor(quantity));
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
        });
      },
      addPlan: (planKey, period, quantity = 1) => {
        const productId = planProductId(planKey, period);
        const otherPeriod: ShopBillingPeriod = period === "yearly" ? "monthly" : "yearly";
        const otherId = planProductId(planKey, otherPeriod);
        const qty = Math.max(1, Math.floor(quantity));

        set((state) => {
          const withoutOther = state.items.filter((i) => i.productId !== otherId);
          const existing = withoutOther.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: withoutOther.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                  : i,
              ),
            };
          }
          return { items: [...withoutOther, { productId, quantity: qty }] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },
      setQuantity: (productId, quantity) => {
        const qty = Math.floor(quantity);
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(99, qty) } : i,
          ),
        }));
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "000it-shop-cart" },
  ),
);
