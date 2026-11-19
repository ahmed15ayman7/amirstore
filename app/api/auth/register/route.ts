import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normPhone, publicUser, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  const phone = normPhone(b.phone);
  const email = String(b.email || "").trim();
  const pass = String(b.pass || "");
  const platform = String(b.platform || "").slice(0, 40);
  if (name.length < 3) return Response.json({ error: "اكتب اسمك بالكامل", field: "fName" }, { status: 400 });
  if (!/^01[0125]\d{8}$/.test(phone)) return Response.json({ error: "اكتب رقم موبايل مصري صحيح (11 رقم)", field: "fPhone" }, { status: 400 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "الإيميل مش مظبوط", field: "fEmail" }, { status: 400 });
  if (pass.length < 6) return Response.json({ error: "كلمة السر لازم تكون 6 حروف أو أرقام على الأقل", field: "fPass" }, { status: 400 });
  if (await prisma.user.findUnique({ where: { phone } }))
    return Response.json({ error: "الرقم ده متسجل قبل كده، اعمل تسجيل دخول" }, { status: 409 });
  const user = await prisma.user.create({
    data: { name: name.slice(0, 80), phone, email: email || null, platform: platform || null, password: await bcrypt.hash(pass, 10) },
  });
  await setSession(user.id);
  return Response.json({ user: publicUser(user) });
}
