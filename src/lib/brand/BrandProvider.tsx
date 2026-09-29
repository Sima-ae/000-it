"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  BRANDS,
  type BrandPublicConfig,
  type SiteBrandId,
} from "@/lib/brand/config";

const BrandContext = createContext<BrandPublicConfig>(BRANDS.triplezero);

export function BrandProvider({
  brand,
  children,
}: {
  brand: SiteBrandId | BrandPublicConfig;
  children: ReactNode;
}) {
  const value = typeof brand === "string" ? BRANDS[brand] : brand;
  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
}

export function useBrand(): BrandPublicConfig {
  return useContext(BrandContext);
}

export function useBrandId(): SiteBrandId {
  return useContext(BrandContext).id;
}
