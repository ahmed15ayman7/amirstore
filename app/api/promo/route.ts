import { checkPromo } from "@/lib/promo";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const percent = checkPromo(b.code);
  if (!percent) return Response.json({ ok: false, error: "الكود ده مش صحيح أو انتهى" }, { status: 400 });
  return Response.json({ ok: true, code: String(b.code).trim().toUpperCase(), percent });
}
