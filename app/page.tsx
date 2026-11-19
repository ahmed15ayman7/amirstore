import { getStoreData } from "@/lib/data";
import { getUser, publicUser } from "@/lib/auth";
import StoreApp from "@/components/StoreApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, u] = await Promise.all([getStoreData(), getUser()]);
  return <StoreApp data={data} initialUser={u ? publicUser(u) : null} />;
}
