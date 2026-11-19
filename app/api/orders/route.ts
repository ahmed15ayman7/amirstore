import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ orders: [] }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return Response.json({
    orders: orders.map((o) => ({
      id: o.id, date: o.createdAt.toISOString(), total: o.total, status: o.status,
      items: o.items.map((i) => ({ id: i.productId, coins: i.coins, qty: i.qty, price: i.price, platform: i.platform, offer: i.offer ?? "" })),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "لازم تسجل الأول" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = String(b.id || "");
  if (!/^AS-[A-Z0-9]{3,10}$/.test(id)) return Response.json({ error: "bad id" }, { status: 400 });
  const cart = (b.cart || {}) as Record<string, number>;
  const ids = Object.keys(cart).filter((k) => Number.isInteger(cart[k]) && cart[k] > 0 && cart[k] < 1000);
  // prices are re-read from the database — never trusted from the client
  const products = await prisma.product.findMany({ where: { id: { in: ids }, ask: false, active: true }, include: { platform: true } });
  if (!products.length) return Response.json({ error: "السلة فاضية" }, { status: 400 });
  const items = products.map((p) => ({
    productId: p.id, coins: p.coins ?? 0, qty: cart[p.id], price: p.price ?? 0,
    platform: p.platform.label.replace(/^[^ ]+ /, ""), offer: p.sub ?? null,
  }));
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const existing = await prisma.order.findUnique({ where: { id } });
  if (existing) {
    if (existing.userId !== user.id) return Response.json({ error: "duplicate id" }, { status: 409 });
    return Response.json({ ok: true, id: existing.id, total: existing.total });
  }
  const order = await prisma.order.create({
    data: {
      id, userId: user.id, total, pay: String(b.pay || "").slice(0, 80), note: String(b.note || "").slice(0, 500) || null,
      items: { create: items },
    },
  });
  return Response.json({ ok: true, id: order.id, total });
}
