export type Product = { id: string; c: number; p: number; s?: string; hot: boolean; tag?: string; name?: string; unit?: string; ask: boolean; kind: "offer" | "base" | "bundle" };
export type Platform = { key: string; label: string; notes: string[]; items: Product[] };
export type Service = { e: string; t: string; d: string; tab: string };
export type StoreData = { platforms: Platform[]; services: Service[]; faq: [string, string][]; promoPercent: number; offerEndsAt: string | null };
export type User = { name: string; phone: string; email: string | null; platform: string | null };
export type OrderLine = { id: string; coins: number; qty: number; price: number; platform: string; offer: string };
export type Order = { id: string; date: string; items: OrderLine[]; total: number; status: string };
