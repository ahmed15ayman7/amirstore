import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "amir_session";
const SECRET = process.env.AUTH_SECRET || "dev-secret";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const sign = (v: string) => crypto.createHmac("sha256", SECRET).update(v).digest("base64url");

export async function setSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, exp, sig] = raw.split(".");
  if (!id || !exp || !sig) return null;
  const expected = sign(`${id}.${exp}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (+exp < Date.now() / 1000) return null;
  return prisma.user.findUnique({ where: { id } });
}

export const publicUser = (u: { name: string; phone: string; email: string | null; platform: string | null }) => ({
  name: u.name, phone: u.phone, email: u.email, platform: u.platform,
});

export const normPhone = (p: string) =>
  String(p || "")
    .replace(/[^\d٠-٩]/g, "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/^(\+?20)/, "0")
    .replace(/^20(?=1)/, "0");
