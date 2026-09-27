/** USD→EUR helpers for domain supplier pricing. */

let cachedRate: { rate: number; at: number } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function getUsdToEurRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && now - cachedRate.at < TTL_MS) return cachedRate.rate;
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=EUR",
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(`FX HTTP ${res.status}`);
    const data = (await res.json()) as { rates?: { EUR?: number } };
    if (data.rates?.EUR && data.rates.EUR > 0) {
      cachedRate = { rate: data.rates.EUR, at: now };
      return data.rates.EUR;
    }
  } catch (error) {
    console.warn("[domains/fx] fallback 0.92", error);
  }
  return cachedRate?.rate ?? 0.92;
}

/** Convert USD amount to EUR cents (minimum 1¢ when usd > 0). */
export function usdToEurCents(usd: number, rate: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.max(1, Math.round(usd * rate * 100));
}
