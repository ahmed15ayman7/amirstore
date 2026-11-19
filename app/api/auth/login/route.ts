import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normPhone, publicUser, setSession } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const phone = normPhone(b.phone);
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(String(b.pass || ""), user.password)))
    return Response.json({ error: "الرقم أو كلمة السر غلط" }, { status: 401 });
  await setSession(user.id);
  return Response.json({ user: publicUser(user) });
}
