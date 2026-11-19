"use client";
import { useEffect, useRef, useState } from "react";
import { Counter, Reveal, Snow, tilt } from "./fx";
import Hero3D from "./Hero3D";
import { WA, goToPrices, useStore } from "./store";

const TOUR_WA = `https://wa.me/${WA}?text=${encodeURIComponent("عايز أشترك في بطولة Amir Store الشتوية")}`;

function Brand() {
  return (
    <>
      <img src="/coins.png" alt="Amir Store" className="brand-ic" />
      <span className="brand-txt">
        <b className="gold-text">Amir Store</b>
        <small className="ef-chip">eFootball™ Coins</small>
      </span>
    </>
  );
}

/* ---------------- NAV ---------------- */
export function Nav() {
  const { user, cart, getItem, openCart, openAuth, badgePop } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const count = Object.keys(cart).reduce((a, id) => a + (getItem(id) ? cart[id] : 0), 0);

  useEffect(() => {
    const on = () => setScrolled(scrollY > 30);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    const b = badgeRef.current;
    if (!b || !badgePop) return;
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
  }, [badgePop]);

  const links: [string, string][] = [
    ["services", "خدماتنا"], ["prices", "الأسعار"], ["tournament", "البطولة"],
    ["about", "ليه إحنا"], ["faq", "أسئلة"], ["contact", "تواصل"],
  ];
  return (
    <nav id="nav" className={scrolled ? "scrolled" : ""}>
      <div className="container nav-in">
        <a href="#home" className="brand"><Brand /></a>
        <div className={`nav-links${open ? " open" : ""}`} id="navLinks">
          {links.map(([id, t]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{t}</a>
          ))}
        </div>
        <div className="nav-actions">
          <button className={`acc-btn${user ? " in" : ""}`} id="accBtn" onClick={() => openAuth(user ? "acc" : "reg")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
            <span id="accTxt">{user ? "أهلاً " + user.name.split(" ")[0] : "تسجيل"}</span>
          </button>
          <button className="icon-btn" id="cartBtn" aria-label="السلة" onClick={() => openCart(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
            <span ref={badgeRef} className={`badge${count > 0 ? " on" : ""}`} id="badge">{count}</span>
          </button>
          <button className="icon-btn burger" id="burger" aria-label="القائمة" onClick={() => setOpen((o) => !o)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- HERO ---------------- */
export function Hero() {
  const vid = useRef<HTMLVideoElement>(null);
  const [noVideo, setNoVideo] = useState(false);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const hide = () => setNoVideo(true);
    const src = v.querySelector("source");
    src?.addEventListener("error", hide);
    v.addEventListener("error", hide);
    if (v.networkState === 3) hide(); // NETWORK_NO_SOURCE (error fired before hydration)
    return () => {
      src?.removeEventListener("error", hide);
      v.removeEventListener("error", hide);
    };
  }, []);
  return (
    <header className="hero" id="home">
      {/* فيديو الخلفية: حط ملف hero.mp4 في فولدر public وهيشتغل تلقائي */}
      <video className="hero-video" ref={vid} autoPlay muted loop playsInline preload="auto" style={noVideo ? { display: "none" } : undefined}>
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <Hero3D />
      <div className="container">
        <div className="hero-content">
          <div className="pill"><i></i> القناة الوحيدة والموثقة لـ Amir Store</div>
          <h1 className="display">
            <span className="line"><span>كوينز eFootball</span></span>
            <span className="line"><span className="gold-text">بسعر لقطة</span></span>
            <span className="line"><span>وشحن لكل الألعاب</span></span>
          </h1>
          <p className="lead">شحن شرعي ومضمون، ومن غير ما ندخل على حسابك. بنشتغل في المجال من 2021، وعروض الكوينز بتنزل هنا وبس.</p>
          <div className="hero-cta">
            <a href="#prices" className="btn btn-gold">تصفح العروض 🟡</a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="btn btn-ghost">كلمنا واتساب</a>
          </div>
          <div className="hero-stats">
            <div><Counter to={5} /><small>سنين خبرة</small></div>
            <div><Counter to={7} /><small>خدمات شحن</small></div>
          </div>
        </div>
      </div>
      <div className="scroll-hint"></div>
    </header>
  );
}

/* ---------------- MARQUEE ---------------- */
const M_ITEMS = ["شحن شرعي ومضمون", "6500 كوين أندرويد بـ 1950ج", "7190 كوين موقع اليابان بـ 2230ج", "بطولة Amir Store الشتوية - 64 لاعب", "خبرة من 2021", "لحد 30,000 كوين في طلب واحد", "شحن بدون تسجيل دخول", "ضمان بالإيصال", "موجود شحن كل الألعاب"];
export function Marquee() {
  const all = [...M_ITEMS, ...M_ITEMS, ...M_ITEMS, ...M_ITEMS];
  return (
    <div className="marquee-wrap">
    <div className="marquee">
      <div className="marquee-track" id="marq">
        {all.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
    </div>
  );
}

/* ---------------- FEATURES ---------------- */
const FEATS = [
  ["🛡️", "شحن شرعي ومضمون", "كل الكوينز بتوصل بطريقة رسمية وآمنة على حسابك."],
  ["🔒", "من غير تسجيل دخول", "متاح شحن من غير أي محاولات دخول على حسابك."],
  ["⚡", "خبرة من 2021", "5 سنين في المجال بفضل الله، وإحنا هنا عيلة مش ستور."],
  ["🎮", "شحن كل الألعاب", "eFootball وببجي وألعاب تانية كتير في مكان واحد."],
];
export function Features() {
  return (
    <section>
      <div className="container">
        <div className="features">
          {FEATS.map(([ic, h, p]) => (
            <Reveal key={h} className="feat"><div className="ic">{ic}</div><h3>{h}</h3><p>{p}</p></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES ---------------- */
export function Services() {
  const { data, setTab } = useStore();
  return (
    <section id="services" style={{ paddingTop: 20 }}>
      <div className="container">
        <Reveal className="sec-head">
          <span className="kicker">Our Services</span>
          <h2 className="display">{data.services.length} خدمات <span className="gold-text">في مكان واحد</span></h2>
          <p>اختار الخدمة اللي تناسبك، ولو لعبتك مش موجودة كلمنا وهنشحنهالك.</p>
        </Reveal>
        <div className="services" id="services-grid">
          {data.services.map((s, i) => (
            <Reveal key={i} className="svc" {...tilt()} onClick={() => goToPrices(setTab, s.tab)}>
              <div className="glare"></div>
              <span className="num">0{i + 1}</span>
              <span className="emoji">{s.e}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <span className="go">شوف الأسعار</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW TO ORDER ---------------- */
const STEPS: [string, string, string][] = [
  ["🎯", "اختار عرضك", "من العروض أو الأسعار الأساسية، أو خلّي الحاسبة تختارلك أرخص تشكيلة."],
  ["🛒", "ضيفه للسلة", "تقدر تجمع أكتر من باقة وتطبق كود الخصم لو معاك."],
  ["👤", "سجّل مرة واحدة", "اسمك ورقم الواتساب بس، وكل طلباتك تتحفظ في حسابك."],
  ["💬", "ابعت على واتساب", "الطلب بيوصل للأدمن جاهز برقمه، وتدفع فودافون كاش أو إنستاباي."],
  ["⚡", "الكوينز توصلك", "شحن شرعي من غير دخول على حسابك، وضمان بالإيصال."],
];
export function HowTo() {
  return (
    <section id="how" style={{ paddingTop: 40 }}>
      <div className="container">
        <Reveal className="sec-head">
          <span className="kicker">How It Works</span>
          <h2 className="display">طلبك في <span className="gold-text">5 خطوات</span></h2>
          <p>من غير لف ولا تعقيد، من اختيار العرض لحد ما الكوينز توصل حسابك.</p>
        </Reveal>
        <Reveal className="steps">
          <div className="steps-line"><i></i></div>
          {STEPS.map(([ic, h, p], i) => (
            <div className="step" key={h} style={{ "--d": i * 0.18 + "s" } as React.CSSProperties}>
              <div className="step-ic"><span>{ic}</span><em>{i + 1}</em></div>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}


/* ---------------- TOURNAMENT ---------------- */
export function Tournament() {
  return (
    <section id="tournament">
      <Snow />
      <div className="container tour">
        <Reveal className="tour-img"><img src="/winter-cup.jpg" alt="Amir Store Winter Cup" /></Reveal>
        <Reveal>
          <span className="kicker" style={{ color: "var(--ice)", fontWeight: 900, letterSpacing: 4, fontSize: 13 }}>WINTER CUP 2027</span>
          <h2 className="display">انطلاق بطولة<br /><span className="ice-text">Amir Store الشتوية</span></h2>
          <p style={{ color: "#c7d6e2" }}>البطولة بنظام الكاس وأدوار إقصاء، وفيها 64 لاعب.</p>
          <div className="meta">
            <div><b>64</b><small>لاعب</small></div>
            <div><b>6</b><small>أدوار إقصاء</small></div>
            <div><b>🏆</b><small>بطل واحد</small></div>
          </div>
          <ul className="rules">
            <li>تكون بتتعامل معانا، أو متفاعل في القناة أو الاستوري على الأقل.</li>
            <li>سنك يكون أكبر من 18 سنة.</li>
            <li>تحترم غيرك وتلتزم بمواعيد التنظيم، لأن البطولة فيها ناس كبيرة ومحترمة.</li>
          </ul>
          <a href={TOUR_WA} target="_blank" rel="noopener" className="btn btn-gold">❄ سجّل في البطولة</a>
          <div className="bracket" id="bracket">
            {[16, 8, 4, 2, 1].map((n, ci) => (
              <div key={ci} className={`col${n === 1 ? " final" : ""}`}>
                {Array.from({ length: n }, (_, i) => <i key={i} style={{ animationDelay: `${ci * 0.35 + i * 0.03}s` }}></i>)}
              </div>
            ))}
          </div>
          <div className="bracket-cap">64 ← 32 ← 16 ← 8 ← 4 ← النهائي</div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- PARTNERS ---------------- */
const PARTNERS = [["S", "Salah Nafea", "Flamma"], ["K", "KHATAR PES", "Gaming"], ["3B", "3BHADY", "Gaming"], ["Dr", "Dr Efootball", "Creator"]];
export function Partners() {
  return (
    <section>
      <div className="container">
        <Reveal className="sec-head">
          <span className="kicker">Trusted By Creators</span>
          <h2 className="display">اشتغلنا مع <span className="gold-text">صناع محتوى كتير</span></h2>
          <p>أدمن الشحن حالياً مع:</p>
        </Reveal>
        <div className="partners">
          {PARTNERS.map(([a, n, s]) => (
            <Reveal key={n} className="partner"><div className="avatar">{a}</div><h4>{n}</h4><small>{s}</small></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
const CHECKS: [string, string, boolean?][] = [
  ["يوزر التيليجرام الوحيد", "t.me/amirovic7"],
  ["أرقام الواتساب الرسمية", "+20 103 080 2437 · wa.me/amirovic7", true],
  ["رقم أمير الشخصي للشكاوي فقط", "+20 111 882 2681", true],
  ["شحن بدون تسجيل دخول", "حسابك أمانة معانا"],
];
export function About() {
  return (
    <section id="about">
      <div className="container about">
        <Reveal className="about-card">
          <span className="kicker" style={{ color: "var(--gold)", fontWeight: 900, letterSpacing: 4, fontSize: 13 }}>WHY AMIR STORE</span>
          <h2 className="display">إحنا هنا <span className="gold-text">عيلة</span> مش ستور</h2>
          <p>من 2021 بنشحن لآلاف اللاعيبة بنفس الأمانة. عروض الكوينز بتنزل على قناتنا الرسمية وبس، وأي حد تاني بيستخدم اسمنا مش تبعنا.</p>
          <p>الاستور للشحن فقط، ومالناش علاقة ببيع أو شراء الحسابات.</p>
          <div className="links-row">
            <a className="btn btn-ghost" href="https://www.facebook.com/share/p/1BFrnnuxXy/?mibextid=wwXIfr" target="_blank" rel="noopener">📌 بوست الضمان</a>
            <a className="btn btn-ghost" href="https://t.me/amirovic7" target="_blank" rel="noopener">✈️ تيليجرام @amirovic7</a>
          </div>
        </Reveal>
        <div className="checks">
          {CHECKS.map(([b, s, ltr]) => (
            <Reveal key={b} className="check">
              <div className="ok">✓</div>
              <div><b>{b}</b><br /><small style={{ color: "var(--muted)" }} dir={ltr ? "ltr" : undefined}>{s}</small></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function QA({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const ans = useRef<HTMLDivElement>(null);
  return (
    <Reveal className={`qa${open ? " open" : ""}`}>
      <button onClick={() => setOpen((o) => !o)}>{q}</button>
      <div className="ans" ref={ans} style={{ maxHeight: open ? ans.current?.scrollHeight ?? 400 : 0 }}><p>{a}</p></div>
    </Reveal>
  );
}
export function Faq() {
  const { data } = useStore();
  return (
    <section id="faq" style={{ paddingTop: 40 }}>
      <div className="container">
        <Reveal className="sec-head">
          <span className="kicker">FAQ</span>
          <h2 className="display">أسئلة <span className="gold-text">بتتكرر</span></h2>
        </Reveal>
        <div className="faq" id="faqList">
          {data.faq.map(([q, a]) => <QA key={q} q={q} a={a} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT + FOOTER ---------------- */
export function Contact() {
  return (
    <section id="contact" style={{ paddingTop: 40 }}>
      <div className="container">
        <Reveal className="contact">
          <h2 className="display">جاهز <span className="gold-text">تشحن؟</span></h2>
          <p>ابعتلنا على الواتساب أو التيليجرام وهنرد عليك في أسرع وقت.</p>
          <div className="row">
            <a className="btn btn-wa" href={`https://wa.me/${WA}`} target="_blank" rel="noopener">واتساب 1</a>
            <a className="btn btn-wa" href="https://wa.me/amirovic7" target="_blank" rel="noopener">واتساب 2</a>
            <a className="btn btn-gold" href="https://t.me/amirovic7" target="_blank" rel="noopener">تيليجرام</a>
          </div>
          <div className="num-list">WhatsApp: +201030802437 · Telegram: @amirovic7</div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="container foot">
        <div className="brand"><Brand /></div>
        <div className="warn">⚠️ الاستور للشحن فقط ومالناش علاقة بالحسابات</div>
        <div suppressHydrationWarning>© {new Date().getFullYear()} Amir Store. كل الحقوق محفوظة.</div>
        <div className="tm">eFootball™ علامة تجارية مملوكة لشركة KONAMI. Amir Store متجر شحن مستقل ومش تابع لـ KONAMI.</div>
      </div>
    </footer>
  );
}

export function WaFloat() {
  return (
    <a className="wa-float" href={`https://wa.me/${WA}`} target="_blank" rel="noopener" aria-label="واتساب">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3M12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.4" /></svg>
    </a>
  );
}
