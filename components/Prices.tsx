"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, tilt } from "./fx";
import { WA, fmt, useStore } from "./store";
import { per1000 } from "@/lib/pricing";
import type { Platform, Product } from "@/lib/types";

type Kind = Product["kind"];
const KIND_LABEL: Record<Kind, string> = { offer: "🔥 العروض الحالية", base: "💰 الأسعار الأساسية", bundle: "⭐ باقات اللاعبين" };

function Coin({ label }: { label: string }) {
  return (
    <div className="coin3d"><div className="e"></div><div className="f">{label}</div><div className="f b">{label}</div></div>
  );
}

/* ---------------- product card ---------------- */
function ProductCard({ it, i, compare, best }: { it: Product; i: number; compare?: number; best?: boolean }) {
  const { addToCart } = useStore();
  const [done, setDone] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  if (it.ask)
    return (
      <div className="prod" style={{ animationDelay: `${i * 0.06}s` }} {...tilt(14)}>
        <Coin label={it.unit || "🎮"} />
        <div className="amt" style={{ fontSize: 30 }}>{it.name}</div>
        <div className="sub">السعر حسب الكمية</div>
        <div className="price"><small>اسأل عن السعر</small></div>
        <a className="add" style={{ display: "block" }} target="_blank" rel="noopener" href={`https://wa.me/${WA}?text=${encodeURIComponent("عايز أعرف سعر " + it.name)}`}>اسأل على واتساب</a>
      </div>
    );

  const save = compare && compare > it.p ? Math.round((1 - it.p / compare) * 100) : 0;
  const tag = it.tag || (best ? "أفضل قيمة 💎" : "");
  return (
    <div className={`prod${it.hot || best ? " hot" : ""}${it.kind === "bundle" ? " bundle" : ""}`} style={{ animationDelay: `${i * 0.06}s` }} {...tilt(14)}>
      {tag && <span className="tag">{tag}</span>}
      {save > 0 && <span className="save">وفّر {save}%</span>}
      <Coin label={it.kind === "bundle" ? it.unit || "⭐" : "A"} />
      {it.kind === "bundle" ? (
        <div className="amt" style={{ fontSize: 34 }}>{it.name}</div>
      ) : (
        <div className="amt">{fmt(it.c)}<small>كوين</small></div>
      )}
      <div className="sub">{it.s || " "}</div>
      <div className="price">
        {save > 0 && <s className="was">{fmt(compare!)}</s>}
        {fmt(it.p)}<small>جنيه</small>
      </div>
      {it.kind !== "bundle" && it.c >= 500 && <div className="p1k">≈ {fmt(per1000(it.c, it.p))}ج لكل 1000 كوين</div>}
      <button
        className={`add${done ? " done" : ""}`}
        onClick={(e) => {
          addToCart(it.id, e.clientX, e.clientY);
          setDone(true);
          clearTimeout(t.current);
          t.current = setTimeout(() => setDone(false), 1300);
        }}
      >
        {done ? "✓ اتضاف" : "أضف للسلة +"}
      </button>
    </div>
  );
}

/* ---------------- countdown (only when OFFER_ENDS_AT is set) ---------------- */
function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return null;
  const left = Date.parse(to) - now;
  if (left <= 0) return null;
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
  const cell = (v: number, l: string) => (
    <div className="cd-cell"><b>{String(v).padStart(2, "0")}</b><small>{l}</small></div>
  );
  return (
    <div className="countdown">
      <span>⏳ العروض دي لفترة محدودة — فاضل:</span>
      <div className="cd-cells">{cell(d, "يوم")}{cell(h, "ساعة")}{cell(m, "دقيقة")}{cell(s, "ثانية")}</div>
    </div>
  );
}

/* ---------------- coin calculator ---------------- */
type Pick = { it: Product; qty: number };
const UNIT = 50;
function bestCombo(target: number, base: Product[], offers: Product[]) {
  if (!base.length) return null;
  const maxC = Math.max(...base.map((b) => b.c));
  const N = Math.ceil((target + maxC) / UNIT);
  // unbounded knapsack: cheapest way to get EXACTLY u units from base tiers
  const cost = new Array(N + 1).fill(Infinity), from = new Array(N + 1).fill(-1);
  cost[0] = 0;
  for (let u = 1; u <= N; u++)
    base.forEach((b, bi) => {
      const w = b.c / UNIT;
      if (Number.isInteger(w) && w <= u && cost[u - w] + b.p < cost[u]) {
        cost[u] = cost[u - w] + b.p;
        from[u] = bi;
      }
    });
  // suffix min => cheapest way to get AT LEAST u units
  const atLeast = new Array(N + 2).fill(Infinity), atLeastU = new Array(N + 2).fill(-1);
  for (let u = N; u >= 0; u--) {
    if (cost[u] < atLeast[u + 1] || (cost[u] === atLeast[u + 1] && cost[u] !== Infinity)) {
      atLeast[u] = cost[u];
      atLeastU[u] = u;
    } else {
      atLeast[u] = atLeast[u + 1];
      atLeastU[u] = atLeastU[u + 1];
    }
  }
  // each single offer pack can be bought once — try every subset
  let best: { total: number; picks: Pick[]; coins: number } | null = null;
  for (let mask = 0; mask < 1 << offers.length; mask++) {
    const chosen = offers.filter((_, i) => mask & (1 << i));
    const oc = chosen.reduce((a, o) => a + o.c, 0), op = chosen.reduce((a, o) => a + o.p, 0);
    const need = Math.max(0, Math.ceil((target - oc) / UNIT));
    if (need > N || atLeast[need] === Infinity) continue;
    const total = op + atLeast[need];
    const coins = oc + atLeastU[need] * UNIT;
    if (!best || total < best.total || (total === best.total && coins > best.coins)) {
      const counts = new Map<number, number>();
      for (let u = atLeastU[need]; u > 0; u -= base[from[u]].c / UNIT) counts.set(from[u], (counts.get(from[u]) || 0) + 1);
      const picks: Pick[] = [...chosen.map((it) => ({ it, qty: 1 })), ...[...counts].map(([bi, qty]) => ({ it: base[bi], qty }))];
      best = { total, picks: picks.sort((a, b) => b.it.c - a.it.c), coins };
    }
  }
  return best;
}

const QUICK = [1000, 3000, 5000, 10000, 20000, 30000];
function Calculator({ P }: { P: Platform }) {
  const { addMany } = useStore();
  const [target, setTarget] = useState(5000);
  const [useOffers, setUseOffers] = useState(true);
  const base = useMemo(() => P.items.filter((i) => i.kind === "base"), [P]);
  const singles = useMemo(() => P.items.filter((i) => i.kind === "offer" && !i.s), [P]);
  const res = useMemo(() => bestCombo(target, base, useOffers ? singles : []), [target, base, singles, useOffers]);
  const plain = useMemo(() => bestCombo(target, base, []), [target, base]);
  if (!res || !plain) return null;
  const saved = plain.total - res.total;
  const pct = ((target - 500) / (30000 - 500)) * 100;

  return (
    <Reveal className="calc">
      <div className="calc-head">
        <div>
          <span className="kicker" style={{ marginBottom: 4 }}>Smart Calculator</span>
          <h3 className="display">حاسبة الكوينز <span className="gold-text">الذكية</span> 🧮</h3>
          <p>قولنا محتاج كام كوين، وإحنا نطلعلك أرخص تشكيلة ممكنة من الأسعار {useOffers && singles.length ? "والعروض" : "الأساسية"}.</p>
        </div>
        <div className="calc-target">
          <small>محتاج</small>
          <b>{fmt(target)}</b>
          <small>كوين</small>
        </div>
      </div>
      <input
        type="range" min={500} max={30000} step={500} value={target}
        onChange={(e) => setTarget(+e.target.value)}
        className="calc-range" style={{ "--p": pct + "%" } as React.CSSProperties} aria-label="عدد الكوينز"
      />
      <div className="calc-quick">
        {QUICK.map((q) => (
          <button key={q} className={q === target ? "on" : ""} onClick={() => setTarget(q)}>{fmt(q)}</button>
        ))}
        {singles.length > 0 && (
          <label className="calc-toggle">
            <input type="checkbox" checked={useOffers} onChange={(e) => setUseOffers(e.target.checked)} />
            <span></span> استخدم العروض الحالية
          </label>
        )}
      </div>
      <div className="calc-res">
        <div className="calc-picks">
          {res.picks.map((p) => (
            <div key={p.it.id} className={`pick${p.it.kind === "offer" ? " offer" : ""}`}>
              <span className="mini"></span>
              <b>{fmt(p.it.c)}</b> كوين {p.qty > 1 && <em>×{p.qty}</em>}
              {p.it.kind === "offer" && <i>عرض</i>}
              <span className="pp">{fmt(p.it.p * p.qty)}ج</span>
            </div>
          ))}
        </div>
        <div className="calc-sum">
          <div><small>هتاخد</small><b>{fmt(res.coins)} كوين</b></div>
          <div><small>الإجمالي</small><b className="gold-text">{fmt(res.total)} ج</b></div>
          {saved > 0 && <div className="calc-saved">وفّرت {fmt(saved)}ج عن الأسعار الأساسية 🎉</div>}
          <button className="btn btn-gold" onClick={(e) => addMany(res.picks.map((p) => ({ id: p.it.id, qty: p.qty })), e.clientX, e.clientY)}>
            ضيف التشكيلة للسلة 🛒
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------- section ---------------- */
export function Prices() {
  const { data, tab, setTab } = useStore();
  const P = data.platforms.find((p) => p.key === tab) ?? data.platforms[0];
  const kinds = useMemo(() => (P ? (["offer", "base", "bundle"] as Kind[]).filter((k) => P.items.some((i) => !i.ask && i.kind === k)) : []), [P]);
  const [kind, setKind] = useState<Kind>("offer");
  useEffect(() => setKind(kinds[0] ?? "offer"), [P?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = P ? P.items.filter((i) => i.ask || kinds.length < 2 || i.kind === kind) : [];
  // what each offer would cost at base prices (cheapest combo for the same coins) → honest "save X%"
  const baseBy = useMemo(() => {
    const base = P?.items.filter((i) => i.kind === "base") ?? [];
    const m = new Map<number, number>();
    if (base.length)
      P!.items.filter((i) => i.kind === "offer").forEach((o) => {
        const r = bestCombo(o.c, base, []);
        if (r) m.set(o.c, r.total);
      });
    return m;
  }, [P]);
  const bestId = useMemo(() => {
    const b = items.filter((i) => i.kind === "base");
    if (b.length < 3) return null;
    return b.reduce((a, x) => (per1000(x.c, x.p) < per1000(a.c, a.p) ? x : a)).id;
  }, [items]);
  const kIndex = Math.max(0, kinds.indexOf(kind));

  return (
    <section id="prices">
      <div className="container">
        <Reveal className="sec-head">
          <span className="kicker">Price List</span>
          <h2 className="display">أسعار <span className="gold-text">الشحن</span></h2>
          <p>اختار المنصة، ضيف العرض للسلة، والطلب هيوصلنا على الواتساب على طول.</p>
        </Reveal>
        <Reveal className="tabs" id="tabs">
          {data.platforms.map((p) => (
            <button key={p.key} className={`tab${p.key === tab ? " active" : ""}`} onClick={() => setTab(p.key)}>{p.label}</button>
          ))}
        </Reveal>
        {P && (
          <>
            <div className="panel-note" id="note">
              {P.notes.map((n) => <span key={n}>⚡ {n}</span>)}
            </div>
            {kinds.length > 1 && (
              <div className="kinds" style={{ "--n": kinds.length, "--i": kIndex } as React.CSSProperties}>
                <span className="kpill"></span>
                {kinds.map((k) => (
                  <button key={k} className={k === kind ? "on" : ""} onClick={() => setKind(k)}>
                    {KIND_LABEL[k]} <em>{P.items.filter((i) => i.kind === k).length}</em>
                  </button>
                ))}
              </div>
            )}
            {kind === "offer" && kinds.length > 1 && data.offerEndsAt && <Countdown to={data.offerEndsAt} />}
            {kind === "base" && data.promoPercent > 0 && (
              <div className="promo-hint">🎟️ معاك كود خصم؟ اكتبه في السلة وخد <b>{data.promoPercent}%</b> خصم على الأسعار الأساسية وباقات اللاعبين</div>
            )}
            <div className="products" id="products" key={P.key + kind}>
              {items.map((it, i) => (
                <ProductCard key={it.id} it={it} i={i} best={it.id === bestId}
                  compare={it.kind === "offer" ? baseBy.get(it.c) : undefined} />
              ))}
            </div>
            {kinds.includes("base") && <Calculator P={P} />}
          </>
        )}
      </div>
    </section>
  );
}
