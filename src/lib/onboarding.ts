export type WarehouseAddress = {
  name?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  phone?: string;
};

export function isWarehouseComplete(addr: unknown): boolean {
  if (!addr || typeof addr !== "object") return false;
  const w = addr as WarehouseAddress;
  return !!(w.name && w.street && w.number && w.district && w.city && w.state && w.postal_code);
}

export type OnboardingBrand = {
  tiktok_shop_id: string | null;
  warehouse_address: unknown;
};

export function getOnboardingProgress(brand: OnboardingBrand | null | undefined) {
  const tiktokConnected = !!brand?.tiktok_shop_id;
  const warehouseSet = isWarehouseComplete(brand?.warehouse_address);
  const stepsComplete = (tiktokConnected ? 1 : 0) + (warehouseSet ? 1 : 0);
  const requiredComplete = tiktokConnected && warehouseSet;
  return {
    tiktokConnected,
    warehouseSet,
    stepsComplete,
    totalRequiredSteps: 2,
    requiredComplete,
  };
}

export const ONBOARDING_EXEMPT_PATHS = [
  "/app/onboarding",
  "/app/setup",
  "/app/settings",
] as const;

/** Paths under settings (e.g. account) */
export function isOnboardingExemptPath(pathname: string) {
  if (pathname.startsWith("/app/settings")) return true;
  return ONBOARDING_EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

