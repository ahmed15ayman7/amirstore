import "server-only";

/** Promo code from env: PROMO_CODE="AMIR10"  PROMO_PERCENT="10" — applies to base prices + player bundles only, never to offers */
export function checkPromo(code: unknown): number {
  const real = (process.env.PROMO_CODE || "").trim().toUpperCase();
  const given = String(code || "").trim().toUpperCase();
  if (!real || !given || given !== real) return 0;
  const pct = Number(process.env.PROMO_PERCENT || 10);
  return Number.isFinite(pct) && pct > 0 && pct < 100 ? pct : 0;
}

