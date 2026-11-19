"use client";
import { useEffect, useMemo, useState } from "react";
import { WA, fmt, useStore } from "./store";
import { isPromoKind, promoDiscount } from "@/lib/pricing";

const PAY = ["طريقة الدفع: فودافون كاش", "طريقة الدفع: إنستاباي", "طريقة الدفع: اتصالات / أورانج كاش"];
const newOrderId = () => "AS-" + Date.now().toString(36).slice(-5).toUpperCase();

type Line = { id: string; coins: number; qty: number; price: number; platform: string; offer: string; kind: string; title: string; label: string };

function useCartLines() {
  const { cart, getItem, promo } = useStore();
  return useMemo(() => {
    const lines: Line[] = Object.keys(cart)
      .filter((id) => cart[id] > 0 && getItem(id))
      .map((id) => {
        const it = getItem(id)!;
        const title = it.kind === "bundle" ? `${it.name} + ${fmt(it.c)} كوين` : `${fmt(it.c)} كوين`;
        const offer = it.kind === "offer" ? (it.s ? "عرض - " + it.s : "عرض") : it.kind === "bundle" ? "باقة لاعب" : "سعر أساسي";
        return { id, coins: it.c, qty: cart[id], price: it.p, platform: it.label.replace(/^[^ ]+ /, ""), offer, kind: it.kind, title, label: it.label };
      });
    const subtotal = lines.reduce((a, i) => a + i.price * i.qty, 0);
    const discount = promoDiscount(lines, promo?.percent ?? 0);
    const count = lines.reduce((a, i) => a + i.qty, 0);
    return { lines, subtotal, discount, total: subtotal - discount, count };
  }, [cart, getItem, promo]);
}

function PromoBox() {
  const { promo, setPromo, data, toast } = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (!data.promoPercent) return null;
  if (promo)
    return (
      <div className="promo on">
        🎟️ <b dir="ltr">{promo.code}</b> متطبق · خصم {promo.percent}%
        <a onClick={() => setPromo(null)}>إلغاء</a>
      </div>
    );
  const apply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setErr("");
    const r = await fetch("/api/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r?.ok) return setErr(d.error || "الكود مش صحيح");
    setPromo({ code: d.code, percent: d.percent });
    setCode("");
    toast(`كود الخصم اتطبق 🎉 ${d.percent}%`);
  };
  return (
    <>
      <div className={`promo${err ? " bad" : ""}`}>
        <input placeholder="كود الخصم" value={code} dir="ltr" onChange={(e) => { setCode(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && apply()} />
        <button onClick={apply} disabled={busy}>{busy ? "..." : "تطبيق"}</button>
      </div>
      {err && <div className="promo-err">{err}</div>}
    </>
  );
}

export default function CartDrawer() {
  const { cart, setQty, clearCart, cartOpen, openCart, user, openAuth, pendingCheckout, toast, promo } = useStore();
  const { lines, subtotal, discount, total } = useCartLines();
  const [note, setNote] = useState("");
  const [pay, setPay] = useState(PAY[0]);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (lines.length && user && !orderId) setOrderId(newOrderId());
  }, [lines.length, user, orderId]);

  let label = "إرسال الطلب على واتساب",
    href = "#",
    disabled = false;
  if (!lines.length) {
    label = "السلة فاضية";
    disabled = true;
  } else if (!user) {
    label = "سجّل وكمّل الطلب";
  } else if (orderId) {
    const msg =
      `طلب جديد من موقع Amir Store 🟡\nرقم الطلب: #${orderId}\n\nالعميل: ${user.name}\nالموبايل: ${user.phone}\n\n` +
      lines.map((i) => `• ${i.title} (${i.platform} - ${i.offer}) × ${i.qty} = ${fmt(i.price * i.qty)}ج`).join("\n") +
      (discount ? `\n\nالمجموع: ${fmt(subtotal)}ج\nكود الخصم ${promo!.code} (-${promo!.percent}%): -${fmt(discount)}ج` : "") +
      `\n\nالإجمالي: ${fmt(total)} جنيه\n${pay}${note.trim() ? "\nملاحظات: " + note.trim() : ""}`;
    href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  }

  const onCheckout = (e: React.MouseEvent) => {
    if (!lines.length) {
      e.preventDefault();
      toast("السلة فاضية");
      return;
    }
    if (!user) {
      e.preventDefault();
      pendingCheckout.current = true;
      openCart(false);
      openAuth("reg", "سجّل بياناتك علشان نأكد طلبك 🟡");
      return;
    }
    // save the order (prices + discount are recalculated on the server)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ id: orderId, cart, pay, note: note.trim(), promo: promo?.code }),
    }).catch(() => {});
    const sent = orderId;
    setTimeout(() => {
      clearCart();
      setOrderId(null);
      setNote("");
      openCart(false);
      toast(`طلبك #${sent} اتبعت ✅`);
    }, 400);
  };

  return (
    <>
      <div className={`overlay${cartOpen ? " on" : ""}`} id="overlay" onClick={() => openCart(false)}></div>
      <aside className={`drawer${cartOpen ? " on" : ""}`} id="drawer">
        <header>
          <h3>سلة <span className="gold-text">الطلبات</span></h3>
          <button className="icon-btn" id="closeCart" aria-label="إغلاق" onClick={() => openCart(false)}>✕</button>
        </header>
        <div className="items" id="items">
          {lines.length ? (
            lines.map((l) => (
              <div className="item" key={l.id}>
                <div className="mini"></div>
                <div className="info">
                  <b>{l.title}</b>
                  <small>
                    {l.label} · {l.offer}
                    {promo && isPromoKind(l.kind) && <span className="ok-promo"> · -{promo.percent}%</span>}
                  </small>
                  <br />
                  <span style={{ color: "var(--gold)", fontWeight: 900 }}>{fmt(l.price * l.qty)} ج</span>
                </div>
                <div className="qty">
                  <button onClick={() => setQty(l.id, 1)}>+</button>
                  <b>{l.qty}</b>
                  <button onClick={() => setQty(l.id, -1)}>−</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              <div className="coin3d"><div className="e"></div><div className="f">A</div><div className="f b">A</div></div>
              السلة فاضية<br />اختار عرض من الأسعار وابدأ 🟡
            </div>
          )}
        </div>
        <footer>
          <div id="custLine">
            {user ? (
              <div className="cust-line">
                👤 <b>{user.name}</b> · <span dir="ltr">{user.phone}</span>
                <a onClick={() => { openCart(false); openAuth("acc"); }}>تغيير</a>
              </div>
            ) : (
              <div className="cust-line">
                🔒 هتسجّل بياناتك قبل إرسال الطلب
                <a onClick={() => { openCart(false); openAuth("reg"); }}>تسجيل</a>
              </div>
            )}
          </div>
          <PromoBox />
          <input id="cNote" placeholder="ملاحظات (اختياري): السيرفر، نوع الجهاز..." value={note} onChange={(e) => setNote(e.target.value)} />
          <select id="cPay" value={pay} onChange={(e) => setPay(e.target.value)}>
            {PAY.map((p) => <option key={p}>{p}</option>)}
          </select>
          {discount > 0 && (
            <div className="subrows">
              <div><span>المجموع</span><span>{fmt(subtotal)} ج</span></div>
              <div className="disc"><span>خصم الكود</span><span>-{fmt(discount)} ج</span></div>
            </div>
          )}
          <div className="total"><span>الإجمالي</span><span id="total">{fmt(total)} ج</span></div>
          <a className={`btn btn-wa${disabled ? " disabled" : ""}`} id="checkout" href={href} target="_blank" rel="noopener" onClick={onCheckout}>{label}</a>
        </footer>
      </aside>
    </>
  );
}

/* sticky bar on phones while the cart has items */
export function MobileCartBar() {
  const { cartOpen, openCart } = useStore();
  const { count, total } = useCartLines();
  return (
    <button className={`mcart${count > 0 && !cartOpen ? " on" : ""}`} onClick={() => openCart(true)} aria-hidden={!count}>
      <span className="mc-n">{count}</span>
      <span>كمّل طلبك</span>
      <b>{fmt(total)} ج</b>
    </button>
  );
}

export function Toast() {
  const { toastState } = useStore();
  return (
    <div className={`toast${toastState.on ? " on" : ""}`} id="toast">🟡 <span id="toastTxt">{toastState.text}</span></div>
  );
}
