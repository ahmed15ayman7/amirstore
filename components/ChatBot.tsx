"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { WA, fmt, goToPrices, useStore } from "./store";
import type { Platform } from "@/lib/types";

type Act =
  | { t: "tab"; tab: string; label: string }
  | { t: "go"; id: string; label: string }
  | { t: "auth"; label: string }
  | { t: "link"; href: string; label: string; wa?: boolean };
type Entry = { k: string[]; a: string; w?: number; acts?: Act[] };
type Msg = { id: number; who: "b" | "u"; text: string; acts?: Act[] };

/* الأسئلة والإجابات دي مبدئية، عدّلها من مصفوفة BOT_KB */
const goPrices = (tab: string): Act[] => [{ t: "tab", tab, label: "شوف الأسعار" }];
const waBtn = (txt: string, label = "كلم الأدمن"): Act => ({ t: "link", wa: true, href: `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`, label: label + " 💬" });

/* price answers are generated from the live DB prices so they never go stale */
function priceEntries(platforms: Platform[]): Entry[] {
  const P = (k: string) => platforms.find((p) => p.key === k);
  const block = (k: string, title: string) => {
    const p = P(k);
    if (!p) return "";
    const offers = p.items.filter((i) => i.kind === "offer");
    const base = p.items.filter((i) => i.kind === "base");
    const lines = [title];
    if (offers.length)
      lines.push("🔥 العروض الحالية:", ...offers.map((o) => `${fmt(o.c)} كوين ← ${fmt(o.p)}ج${o.s ? " (" + o.s + ")" : ""}`));
    if (base.length)
      lines.push(`💰 الأسعار الأساسية: من ${fmt(base[0].c)} كوين بـ ${fmt(base[0].p)}ج لحد ${fmt(base[base.length - 1].c)} كوين بـ ${fmt(base[base.length - 1].p)}ج`);
    return lines.join("\n");
  };
  const bundles = platforms.flatMap((p) => p.items.filter((i) => i.kind === "bundle"));
  return [
    {
      w: 0.4,
      k: ["اسعار", "سعر", "بكام", "كام", "الاسعار", "price"],
      a: "أسعارنا مقسمة حسب المنصة 👇\nفيه عروض حالية بخصم كبير، وأسعار أساسية لحد 30,000 كوين، ولو محتار جرّب «حاسبة الكوينز» في صفحة الأسعار 🧮\nاختار منصتك:",
      acts: [
        { t: "tab", tab: "android", label: "أندرويد" }, { t: "tab", tab: "ios", label: "آيفون" }, { t: "tab", tab: "jp", label: "موقع اليابان" },
        { t: "tab", tab: "world", label: "موقع مصر" }, { t: "tab", tab: "steam", label: "ستيم" },
      ],
    },
    { k: ["اندرويد", "android", "جوجل"], a: block("android", "أسعار شحن أندرويد 🤖"), acts: goPrices("android") },
    { k: ["ايفون", "iphone", "ios", "ابل", "اي فون"], a: block("ios", "أسعار شحن آيفون 🍎"), acts: goPrices("ios") },
    { k: ["كود", "خصم", "كوبون", "promo", "discount"], a: "لو معاك كود خصم اكتبه في السلة قبل ما تبعت الطلب، والخصم بيتطبق على الأسعار الأساسية وباقات اللاعبين (مش على العروض لأنها مخصومة أصلاً) 🎟️" },
    { k: ["حاسبه", "احسب", "ارخص", "تشكيله"], a: "جرّب «حاسبة الكوينز الذكية» 🧮 قولها محتاج كام كوين وهي تطلعلك أرخص تشكيلة من العروض والأسعار الأساسية، وتضيفها للسلة بدوسة واحدة.", acts: goPrices("android") },
    {
      k: ["سواريز", "كاسياس", "لاعب", "باقات", "باقه"],
      a: bundles.length ? "باقات اللاعبين ⭐\n" + bundles.map((b) => `${b.name} + ${b.c} كوين ← ${b.p}ج`).join("\n") : "اسأل الأدمن عن باقات اللاعبين.",
      acts: goPrices("android"),
    },
  ];
}

const BOT_KB: Entry[] = [
  { k: ["ستيم", "steam", "كمبيوتر", "pc", "لاب"], a: "أسعار ستيم 💙\n190 كوين ← 85ج\n500 كوين ← 175ج\n1500 كوين ← 520ج\n4500 كوين ← 1450ج", acts: goPrices("steam") },
  { k: ["موقع", "كونامي", "konami", "7000", "يابان", "اليابان", "7190"], a: "عروض موقع My Konami (آيفون وأندرويد) 🌐\n🇯🇵 سيرفر اليابان: 7190 كوين بـ 2230ج\n🌍 مصر وباقي الدول: 7190 كوين بـ 2430ج\n\n⚡ شرطين مهمين: سيرفر اللعبة لازم يكون نفس سيرفر الموقع، وسنك لازم يكون فوق 21 سنة.",
    acts: [{ t: "tab", tab: "jp", label: "اليابان" }, { t: "tab", tab: "world", label: "مصر وباقي الدول" }] },
  { k: ["فرق", "الفرق", "ايه الفرق", "عروض اللعبه"], a: "عروض اللعبة بتتشحن على الكوينز اللي جوه اللعبة نفسها. أما عروض موقع My Konami فبتديك كوينز مجانية زيادة عن اللي في اللعبة، بس لازم سيرفرك يكون نفس سيرفر الموقع وسنك فوق 21 سنة." },
  { k: ["سيرفر", "server", "اعرف السيرفر"], a: "سيرفر اللعبة هو البلد اللي حسابك متسجل عليها. لو مش متأكد ابعتلنا سكرين من إعدادات اللعبة وإحنا نقولك العرض المناسب ليك 👌", acts: [waBtn("مش عارف سيرفر حسابي إيه")] },
  { k: ["اطلب", "طلب", "ازاي", "اشحن", "خطوات", "اوردر"], a: "الطلب سهل جداً 👇\n1. اختار العرض من الأسعار ودوس «أضف للسلة»\n2. افتح السلة واختار طريقة الدفع\n3. سجّل بياناتك (أول مرة بس)\n4. دوس «إرسال الطلب على واتساب» والأدمن هيكمل معاك", acts: goPrices("android") },
  { k: ["دخول", "باسورد", "كلمه السر", "حسابي", "اكونت", "الحساب"], a: "متقلقش 🔒 متاح شحن من غير أي تسجيل دخول أو محاولات دخول على حسابك. حسابك أمانة معانا." },
  { k: ["دفع", "فودافون", "كاش", "انستاباي", "instapay", "ادفع"], a: "تقدر تدفع بفودافون كاش أو إنستاباي أو اتصالات/أورانج كاش. الأدمن هيبعتلك بيانات التحويل على الواتساب بعد ما طلبك يوصله." },
  { k: ["وقت", "امتى", "قد ايه", "مده", "سرعه", "بياخد"], a: "الشحن بيتم في أسرع وقت بعد تأكيد التحويل ⚡ ولو حصل أي تأخير الأدمن هيبلغك على الواتساب." },
  { k: ["ضمان", "مضمون", "نصب", "ثقه", "اثق", "حقيقي", "شرعي"], a: "شحننا شرعي ومضمون، وشغالين في المجال من 2021 بفضل الله 🛡️\nأدمن شحن مع صناع محتوى زي Salah Nafea و KHATAR PES و 3BHADY و Dr Efootball.\nوتقدر تشوف بوست الضمان بنفسك:",
    acts: [{ t: "link", href: "https://www.facebook.com/share/p/1BFrnnuxXy/?mibextid=wwXIfr", label: "بوست الضمان 📌" }] },
  { k: ["تليجرام", "telegram", "قناه", "القناه", "موثق", "رسمي"], a: "القناة والتيليجرام الوحيد والرسمي: t.me/amirovic7\nوالواتساب الرسمي: 01030802437\nأي حد تاني بيستخدم اسمنا مش تبعنا ⚠️", acts: [{ t: "link", href: "https://t.me/amirovic7", label: "تيليجرام ✈️" }] },
  { k: ["ببجي", "pubg", "شدات", "شده", "uc"], a: "أيوه بنشحن شدات ببجي 🔫 الأسعار بتتغير، ابعت الكمية اللي عايزها للأدمن ويقولك السعر الحالي.", acts: [waBtn("عايز أعرف أسعار شدات ببجي")] },
  { k: ["فري فاير", "free fire", "جواهر", "العاب", "لعبه تانيه", "فورت", "روبلوكس"], a: "موجود شحن كل الألعاب 🎮 قولّنا اسم اللعبة والكمية والأدمن هيرد عليك بالسعر.", acts: [waBtn("عايز أشحن لعبة تانية")] },
  { k: ["بطوله", "البطوله", "تورنمنت", "كاس", "winter", "مسابقه"], a: "بطولة Amir Store الشتوية ❄️\nبنظام الكاس وأدوار إقصاء، وفيها 64 لاعب.\nالشروط:\n• تكون بتتعامل معانا أو متفاعل في القناة أو الاستوري\n• سنك فوق 18 سنة\n• تحترم غيرك وتلتزم بالمواعيد",
    acts: [{ t: "go", id: "tournament", label: "تفاصيل البطولة" }, waBtn("عايز أشترك في البطولة الشتوية", "سجّلني")] },
  { k: ["بيع", "شراء", "اشتري حساب", "ابيع", "حسابات"], a: "الاستور للشحن فقط، ومالناش أي علاقة ببيع أو شراء الحسابات." },
  { k: ["شكوي", "شكوه", "مشكله", "موصلش", "موصلتش", "اتاخر", "زعلان"], a: "آسفين لو حصلت أي مشكلة 🙏 ابعت رقم طلبك للأدمن الأول، ولو مفيش حل فيه رقم أمير الشخصي للشكاوي بس: 01118822681",
    acts: [{ t: "link", wa: true, href: "https://wa.me/201118822681", label: "رقم الشكاوي 📞" }] },
  { k: ["سن", "عمري", "21", "18", "صغير"], a: "عروض موقع My Konami لازم يكون سنك فوق 21 سنة، والبطولة لازم فوق 18 سنة. عروض اللعبة العادية متاحة للكل." },
  { k: ["تسجيل", "اسجل", "حساب جديد", "register"], a: "التسجيل بيكون مرة واحدة بس عند أول طلب: اسمك ورقم الواتساب وكلمة سر. بعد كده كل طلباتك بتتحفظ في «حسابي».", acts: [{ t: "auth", label: "سجّل دلوقتي" }] },
  { k: ["سلام", "اهلا", "هاي", "مرحبا", "hi", "hello", "ازيك"], a: "أهلاً بيك في Amir Store 👋 أقدر أساعدك في الأسعار، وطريقة الطلب، والبطولة. اسأل اللي انت عايزه." },
  { k: ["شكرا", "تسلم", "thanks", "متشكر"], a: "العفو يا غالي 💛 إحنا هنا عيلة مش ستور." },
  { k: ["ادمن", "حد", "انسان", "اكلم", "تواصل", "رقم", "واتس"], a: "تقدر تكلم الأدمن مباشرة على الواتساب: 01030802437", acts: [waBtn("أهلاً، عندي استفسار")] },
];
const CHIPS = ["الأسعار", "إزاي أطلب؟", "عروض الموقع", "محتاج تسجيل دخول؟", "الدفع", "البطولة", "ببجي", "مضمون؟", "كلم الأدمن"];
const norm = (t: string) =>
  t.toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[؟?!.,،]/g, " ");

function botAnswer(q: string, kb: Entry[]): Entry {
  const n = " " + norm(q) + " ";
  let best: Entry | null = null,
    score = 0;
  kb.forEach((e) => {
    let s = 0;
    e.k.forEach((k) => {
      if (n.includes(norm(k))) s += norm(k).length * (e.w || 1);
    });
    if (s > score) {
      score = s;
      best = e;
    }
  });
  return best || { k: [], a: "معلش مش فاهم سؤالك كويس 🙈 جرّب تختار من الاختيارات تحت، أو كلم الأدمن مباشرة.", acts: [waBtn(q, "اسأل الأدمن")] };
}

export default function ChatBot() {
  const { user, setTab, openAuth, data } = useStore();
  const kb = useMemo(() => [...priceEntries(data.platforms), ...BOT_KB], [data]);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const started = useRef(false);
  const nid = useRef(0);
  const body = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (who: Msg["who"], text: string, acts?: Act[]) => setMsgs((m) => [...m, { id: ++nid.current, who, text, acts }]);

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [msgs, typing]);

  const toggle = (v: boolean) => {
    setOpen(v);
    if (v && !started.current) {
      started.current = true;
      setTimeout(() => add("b", `أهلاً${user ? " " + user.name.split(" ")[0] : ""} 👋 أنا مساعد Amir Store.\nاسألني عن الأسعار، أو طريقة الطلب، أو البطولة، أو اختار من تحت 👇`), 250);
    }
    if (v && innerWidth > 700) setTimeout(() => inputRef.current?.focus(), 400);
  };

  const ask = (q: string) => {
    if (!q.trim()) return;
    add("u", q);
    setTyping(true);
    const r = botAnswer(q, kb);
    setTimeout(() => {
      setTyping(false);
      add("b", r.a, r.acts);
    }, 500 + Math.min(900, r.a.length * 6));
  };

  const runAct = (a: Act) => {
    if (a.t === "tab") goToPrices(setTab, a.tab);
    if (a.t === "go") document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth" });
    if (a.t === "auth") {
      toggle(false);
      openAuth(user ? "acc" : "reg");
      return;
    }
    if (innerWidth < 700) toggle(false);
  };

  return (
    <>
      <button className={`bot-launch${open ? " open" : ""}`} id="botLaunch" aria-label="المساعد" onClick={() => toggle(!open)}>
        <span className="dot"></span>
        <span className="tip">عندك سؤال؟ اسألني 👋</span>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1a1100" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
      </button>
      <div className={`bot${open ? " on" : ""}`} id="bot">
        <div className="bot-head">
          <img src="/coins.png" alt="" />
          <div><b>مساعد Amir Store</b><small>متاح دلوقتي</small></div>
          <button id="botClose" aria-label="إغلاق" onClick={() => toggle(false)}>✕</button>
        </div>
        <div className="bot-body" id="botBody" ref={body}>
          {msgs.map((m) => (
            <div key={m.id} className={`msg ${m.who}`}>
              {m.text}
              {m.acts && (
                <div className="acts">
                  {m.acts.map((a, i) =>
                    a.t === "link" ? (
                      <a key={i} className={a.wa ? "wa" : undefined} href={a.href} target="_blank" rel="noopener">{a.label}</a>
                    ) : (
                      <button key={i} onClick={() => runAct(a)}>{a.label}</button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
          {typing && <div className="typing"><i></i><i></i><i></i></div>}
        </div>
        <div className="chips" id="chips">
          {CHIPS.map((c) => <button key={c} onClick={() => ask(c)}>{c}</button>)}
        </div>
        <form
          className="bot-in"
          id="botForm"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
            setInput("");
          }}
        >
          <input ref={inputRef} id="botInput" placeholder="اكتب سؤالك هنا..." autoComplete="off" value={input} onChange={(e) => setInput(e.target.value)} />
          <button aria-label="إرسال">➤</button>
        </form>
      </div>
    </>
  );
}
