import { getStoreData } from "@/lib/data";
import { getUser, publicUser } from "@/lib/auth";
import { buildJsonLd } from "@/lib/seo";
import StoreApp from "@/components/StoreApp";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, u] = await Promise.all([getStoreData(), getUser()]);
  const jsonLd = JSON.stringify(buildJsonLd(data)).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <StoreApp data={data} initialUser={u ? publicUser(u) : null} />
    </>
  );
}
