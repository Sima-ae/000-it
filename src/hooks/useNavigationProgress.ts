"use client";

import { create } from "zustand";

type NavigationProgressState = {
  pending: boolean;
  start: () => void;
  done: () => void;
};

export const useNavigationProgress = create<NavigationProgressState>((set) => ({
  pending: false,
  start: () => set({ pending: true }),
  done: () => set({ pending: false }),
}));
