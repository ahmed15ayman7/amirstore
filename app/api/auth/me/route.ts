import { getUser, publicUser } from "@/lib/auth";

export async function GET() {
  const u = await getUser();
  return Response.json({ user: u ? publicUser(u) : null });
}
