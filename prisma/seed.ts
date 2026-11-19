import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { directUrl } from "../lib/db-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: directUrl() }) });

type It = { c?: number; p?: number; s?: string; hot?: 1; tag?: string; name?: string; unit?: string; ask?: 1 };
const SITE_NOTES = ["آيفون وأندرويد", "سيرفر اللعبة لازم يكون نفس سيرفر موقع My Konami", "السن لازم يكون فوق 21 سنة", "الشحن بدون محاولات دخول على الحساب"];
const PLATFORMS: Record<string, { label: string; notes: string[]; items: It[] }> = {
  android: { label: "🤖 أندرويد", notes: ["شحن شرعي ومضمون", "متاح شحن بدون تسجيل دخول"], items: [
    { c: 500, p: 180 }, { c: 1500, p: 480 }, { c: 4500, p: 1350 },
    { c: 2000, p: 640, s: "أول عرضين مع بعض", hot: 1 }, { c: 6500, p: 1950, s: "التلت عروض مع بعض", hot: 1, tag: "الأوفر" }] },
  ios: { label: "🍎 آيفون", notes: ["شحن شرعي ومضمون", "متاح شحن بدون تسجيل دخول"], items: [
    { c: 500, p: 180 }, { c: 1500, p: 470 }, { c: 4500, p: 1300 },
    { c: 2000, p: 620, s: "أول عرضين مع بعض", hot: 1 }, { c: 6500, p: 1900, s: "التلت عروض مع بعض", hot: 1, tag: "الأوفر" }] },
  jp: { label: "🇯🇵 موقع - اليابان", notes: SITE_NOTES, items: [
    { c: 190, p: 85 }, { c: 7000, p: 2150 }, { c: 7190, p: 2230, s: "العرضين مع بعض", hot: 1, tag: "الأوفر" }] },
  world: { label: "🌍 موقع - مصر وباقي الدول", notes: SITE_NOTES, items: [
    { c: 190, p: 85 }, { c: 7000, p: 2350 }, { c: 7190, p: 2430, s: "العرضين مع بعض", hot: 1, tag: "الأوفر" }] },
  steam: { label: "💙 ستيم", notes: ["لمنصة Steam", "الشحن بدون محاولات دخول على الحساب"], items: [
    { c: 190, p: 85 }, { c: 500, p: 175 }, { c: 1500, p: 520 }, { c: 4500, p: 1450, hot: 1, tag: "الأكثر طلباً" }] },
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
  ["هل الشحن محتاج أدخل على حسابي؟", "لأ. متاح شحن من غير أي تسجيل دخول أو محاولات دخول على حسابك."],
  ["إيه الفرق بين عروض اللعبة وعروض الموقع؟", "عروض موقع My Konami بتديك كوينز مجانية أكتر من اللي جوه اللعبة. لازم سيرفر اللعبة يكون نفس سيرفر الموقع، وسنك يكون فوق 21 سنة."],
  ["بتبيعوا أو بتشتروا حسابات؟", "لأ، الاستور للشحن فقط ومالناش أي علاقة بالحسابات."],
  ["إزاي أتأكد إني بتعامل مع Amir Store الحقيقي؟", "التيليجرام الوحيد هو t.me/amirovic7، والواتساب الرسمي هو ‎+201030802437 و wa.me/amirovic7. وتقدر تشوف بوست الضمان على فيسبوك."],
  ["عندي شكوى، أكلم مين؟", "رقم أمير الشخصي للشكاوي فقط: ‎+201118822681 (واتساب)."],
];

async function main() {
  // `--if-empty` (used in the Vercel build) seeds only a fresh DB, so price edits made later are never overwritten
  if (process.argv.includes("--if-empty") && (await prisma.platform.count()) > 0) {
    console.log("DB already has data — skipping seed");
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
          id: `${key}-${i}`, coins: it.c ?? null, price: it.p ?? null, sub: it.s ?? null,
          hot: !!it.hot, tag: it.tag ?? null, name: it.name ?? null, unit: it.unit ?? null, ask: !!it.ask, sort: i,
        })) },
      },
    });
  }
  await prisma.service.createMany({ data: SERVICES.map((s, i) => ({ emoji: s.e, title: s.t, desc: s.d, tab: s.tab, sort: i })) });
  await prisma.faq.createMany({ data: FAQ.map(([q, a], i) => ({ question: q, answer: a, sort: i })) });
  console.log("Seeded ✔");
}
main().finally(() => prisma.$disconnect());
