import { prisma } from "@/lib/db";
import type { StoreData } from "@/lib/types";

export async function getStoreData(): Promise<StoreData> {
  const [platforms, services, faqs] = await Promise.all([
    prisma.platform.findMany({
      orderBy: { sort: "asc" },
      include: { products: { where: { active: true }, orderBy: { sort: "asc" } } },
    }),
    prisma.service.findMany({ orderBy: { sort: "asc" } }),
    prisma.faq.findMany({ orderBy: { sort: "asc" } }),
  ]);
  return {
    platforms: platforms.map((p) => ({
      key: p.key,
      label: p.label,
      notes: JSON.parse(p.notes) as string[],
      items: p.products.map((it) => ({
        id: it.id, c: it.coins ?? 0, p: it.price ?? 0, s: it.sub ?? undefined, hot: it.hot,
        tag: it.tag ?? undefined, name: it.name ?? undefined, unit: it.unit ?? undefined, ask: it.ask,
      })),
    })),
    services: services.map((s) => ({ e: s.emoji, t: s.title, d: s.desc, tab: s.tab })),
    faq: faqs.map((f) => [f.question, f.answer] as [string, string]),
  };
}
