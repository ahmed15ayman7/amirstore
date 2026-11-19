import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { directUrl } from "../lib/db-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: directUrl() }) });

/* ⚠️ بعد أي تعديل في الأسعار هنا زوّد CATALOG_VERSION علشان التعديل يتطبق على قاعدة البيانات في الـ deploy الجاي */
const CATALOG_VERSION = "2026-11-19.2";

type Kind = "offer" | "base" | "bundle";
type It = { c?: number; p?: number; s?: string; hot?: 1; tag?: string; name?: string; unit?: string; ask?: 1; kind?: Kind };
const SITE_NOTES = ["آيفون وأندرويد", "سيرفر اللعبة لازم يكون نفس سيرفر موقع My Konami", "السن لازم يكون فوق 21 سنة", "الشحن بدون محاولات دخول على الحساب"];
const base = (rows: [number, number][]): It[] => rows.map(([c, p]) => ({ c, p, kind: "base" }));
const offer = (it: It): It => ({ ...it, kind: "offer" });

const PLATFORMS: Record<string, { label: string; notes: string[]; items: It[] }> = {
  android: { label: "🤖 أندرويد", notes: ["شحن شرعي ومضمون", "متاح شحن بدون محاولات دخول على الحساب", "ضمان بالإيصال"], items: [
    // العروض الحالية (خصم)
    offer({ c: 500, p: 180 }), offer({ c: 1500, p: 480 }), offer({ c: 4500, p: 1350 }),
    offer({ c: 2000, p: 640, s: "أول عرضين مع بعض", hot: 1 }), offer({ c: 6500, p: 1950, s: "التلت عروض مع بعض", hot: 1, tag: "الأوفر" }),
    // الأسعار الأساسية
    ...base([[500, 270], [800, 420], [1000, 470], [1500, 720], [2000, 920], [3000, 1350], [4000, 1800], [5000, 2000],
      [6000, 2450], [7000, 2900], [8000, 3300], [10000, 3600], [15000, 5200], [20000, 7200], [30000, 10200]]),
    // باقات اللاعبين
    { name: "سواريز", c: 50, p: 80, s: "لاعب + 50 كوين", kind: "bundle", unit: "⚽" },
    { name: "إيكر كاسياس", c: 100, p: 160, s: "لاعب + 100 كوين", kind: "bundle", unit: "🧤" },
  ] },
  ios: { label: "🍎 آيفون", notes: ["شحن شرعي ومضمون", "متاح شحن بدون محاولات دخول على الحساب", "ضمان بالإيصال"], items: [
    offer({ c: 500, p: 180 }), offer({ c: 1500, p: 470 }), offer({ c: 4500, p: 1300 }),
    offer({ c: 2000, p: 620, s: "أول عرضين مع بعض", hot: 1 }), offer({ c: 6500, p: 1900, s: "التلت عروض مع بعض", hot: 1, tag: "الأوفر" }),
    ...base([[500, 265], [1000, 465], [2000, 880], [3000, 1300], [4000, 1750], [5000, 2000],
      [10000, 3600], [15000, 5200], [20000, 7200], [30000, 10200]]),
  ] },
  jp: { label: "🇯🇵 موقع - اليابان", notes: SITE_NOTES, items: [
    offer({ c: 190, p: 85 }), offer({ c: 7000, p: 2150 }), offer({ c: 7190, p: 2230, s: "العرضين مع بعض", hot: 1, tag: "الأوفر" })] },
  world: { label: "🌍 موقع - مصر وباقي الدول", notes: SITE_NOTES, items: [
    offer({ c: 190, p: 85 }), offer({ c: 7000, p: 2350 }), offer({ c: 7190, p: 2430, s: "العرضين مع بعض", hot: 1, tag: "الأوفر" })] },
  steam: { label: "💙 ستيم", notes: ["لمنصة Steam", "الشحن بدون محاولات دخول على الحساب"], items: [
    offer({ c: 190, p: 85 }), offer({ c: 500, p: 175 }), offer({ c: 1500, p: 520 }), offer({ c: 4500, p: 1450, hot: 1, tag: "الأكثر طلباً" })] },
  other: { label: "🎮 ألعاب تانية", notes: ["الأسعار بتتغير، اسألنا على السعر الحالي"], items: [
    { name: "شدات ببجي", unit: "UC", ask: 1 }, { name: "جواهر فري فاير", unit: "💎", ask: 1 }, { name: "أي لعبة تانية", unit: "🎮", ask: 1 }] },
};
const SERVICES = [
  { e: "🤖", t: "كوينز eFootball أندرويد", d: "عروض الكوينز لأجهزة الأندرويد بأقل سعر.", tab: "android" },
  { e: "🍎", t: "كوينز eFootball آيفون", d: "عروض الآيفون بأسعار خاصة.", tab: "ios" },
  { e: "🇯🇵", t: "عروض موقع My Konami - اليابان", d: "عرض 7000 و190 كوين لسيرفر اليابان.", tab: "jp" },
  { e: "🌍", t: "عروض موقع My Konami - مصر وباقي الدول", d: "عروض الموقع لسيرفر مصر وباقي الدول.", tab: "world" },
  { e: "💙", t: "كوينز ستيم", d: "شحن كوينز eFootball على منصة Steam.", tab: "steam" },
  { e: "🔫", t: "شدات ببجي", d: "شحن UC لببجي موبايل بسرعة وأمان.", tab: "other" },
  { e: "🎮", t: "شحن باقي الألعاب", d: "أي لعبة تانية؟ كلمنا وهنشحنهالك.", tab: "other" },
];
const FAQ = [
  ["إيه الفرق بين العروض والأسعار الأساسية؟", "العروض هي خصومات بتنزل لفترة على باقات معينة وبتكون أرخص بكتير. الأسعار الأساسية متاحة طول الوقت وبكميات لحد 30,000 كوين، ولو معاك كود خصم بيتطبق عليها."],
  ["هل الشحن محتاج أدخل على حسابي؟", "لأ. متاح شحن من غير أي تسجيل دخول أو محاولات دخول على حسابك."],
  ["إيه الفرق بين عروض اللعبة وعروض الموقع؟", "عروض موقع My Konami بتديك كوينز مجانية أكتر من اللي جوه اللعبة. لازم سيرفر اللعبة يكون نفس سيرفر الموقع، وسنك يكون فوق 21 سنة."],
  ["بتبيعوا أو بتشتروا حسابات؟", "لأ، الاستور للشحن فقط ومالناش أي علاقة بالحسابات."],
  ["إزاي أتأكد إني بتعامل مع Amir Store الحقيقي؟", "التيليجرام الوحيد هو t.me/amirovic7، والواتساب الرسمي هو ‎+201030802437 و wa.me/amirovic7. وتقدر تشوف بوست الضمان على فيسبوك."],
  ["عندي شكوى، أكلم مين؟", "رقم أمير الشخصي للشكاوي فقط: ‎+201118822681 (واتساب)."],
];

async function main() {
  // `--sync` (used in the Vercel build): reseed the catalog only when CATALOG_VERSION changed
  const current = await prisma.setting.findUnique({ where: { key: "catalogVersion" } });
  if (process.argv.includes("--sync") && current?.value === CATALOG_VERSION) {
    console.log(`Catalog already at ${CATALOG_VERSION} — skipping seed`);
    return;
  }
  await prisma.product.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.service.deleteMany();
  await prisma.faq.deleteMany();
  let ps = 0;
  for (const [key, v] of Object.entries(PLATFORMS)) {
    await prisma.platform.create({
      data: {
        key, label: v.label, notes: JSON.stringify(v.notes), sort: ps++,
        products: { create: v.items.map((it, i) => ({
          id: `${key}-${it.kind ?? "base"}-${it.c ?? i}-${i}`, coins: it.c ?? null, price: it.p ?? null, sub: it.s ?? null,
          hot: !!it.hot, tag: it.tag ?? null, name: it.name ?? null, unit: it.unit ?? null, ask: !!it.ask,
          kind: it.kind ?? "base", sort: i,
        })) },
      },
    });
  }
  await prisma.service.createMany({ data: SERVICES.map((s, i) => ({ emoji: s.e, title: s.t, desc: s.d, tab: s.tab, sort: i })) });
  await prisma.faq.createMany({ data: FAQ.map(([q, a], i) => ({ question: q, answer: a, sort: i })) });
  await prisma.setting.upsert({
    where: { key: "catalogVersion" },
    update: { value: CATALOG_VERSION },
    create: { key: "catalogVersion", value: CATALOG_VERSION },
  });
  console.log(`Seeded ✔ (catalog ${CATALOG_VERSION})`);
}
main().finally(() => prisma.$disconnect());
