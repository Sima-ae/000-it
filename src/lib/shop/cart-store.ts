"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
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
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: qty }] };
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
            i.productId === productId ? { ...i, quantity: qty } : i,
          ),
        }));
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "000it-shop-cart" },
  ),
);
