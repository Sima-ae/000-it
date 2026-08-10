/** Base count on the launch day; then +1..+3 each following day (deterministic). */
const BASE_COUNT = 56;
const START_UTC = Date.UTC(2026, 7, 10); // 10 Aug 2026
const DAY_MS = 86_400_000;

function dayIncrement(utcMidnight: number): number {
  // Stable 1–3 from the calendar day (same for every visitor that day)
  let n = Math.floor(utcMidnight / DAY_MS);
  n = ((n >>> 16) ^ n) * 0x45d9f3b;
  n = ((n >>> 16) ^ n) * 0x45d9f3b;
  n = (n >>> 16) ^ n;
  return (Math.abs(n) % 3) + 1;
}

export function getAiScanCount(now: Date = new Date()): number {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (end < START_UTC) return BASE_COUNT;

  let total = BASE_COUNT;
  for (let t = START_UTC + DAY_MS; t <= end; t += DAY_MS) {
    total += dayIncrement(t);
  }
  return total;
}
