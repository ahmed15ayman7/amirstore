/* Shared (client + server) pricing helpers so the cart and the stored order always agree */
export const isPromoKind = (kind: string) => kind === "base" || kind === "bundle";

export function promoDiscount(lines: { price: number; qty: number; kind: string }[], percent: number) {
  if (!percent) return 0;
  const eligible = lines.filter((l) => isPromoKind(l.kind)).reduce((a, l) => a + l.price * l.qty, 0);
  return Math.round((eligible * percent) / 100);
}

/** price per 1000 coins */
export const per1000 = (coins: number, price: number) => (coins ? Math.round((price / coins) * 1000) : 0);
