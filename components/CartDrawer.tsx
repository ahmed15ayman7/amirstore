"use client";
import { useEffect, useMemo, useState } from "react";
import { WA, fmt, useStore } from "./store";
import type { OrderLine } from "@/lib/types";

const PAY = ["طريقة الدفع: فودافون كاش", "طريقة الدفع: إنستاباي", "طريقة الدفع: اتصالات / أورانج كاش"];
const newOrderId = () => "AS-" + Date.now().toString(36).slice(-5).toUpperCase();

export default function CartDrawer() {
  const { cart, getItem, setQty, clearCart, cartOpen, openCart, user, openAuth, pendingCheckout, toast } = useStore();
  const [note, setNote] = useState("");
  const [pay, setPay] = useState(PAY[0]);
  const [orderId, setOrderId] = useState<string | null>(null);

  const lines: OrderLine[] = useMemo(
    () =>
      Object.keys(cart)
        .filter((id) => cart[id] > 0 && getItem(id))
        .map((id) => {
          const it = getItem(id)!;
          return { id, coins: it.c, qty: cart[id], price: it.p, platform: it.label.replace(/^[^ ]+ /, ""), offer: it.s || "" };
        }),
    [cart, getItem]
  );
  const total = lines.reduce((a, i) => a + i.price * i.qty, 0);

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
      lines.map((i) => `• ${fmt(i.coins)} كوين (${i.platform}${i.offer ? " - " + i.offer : ""}) × ${i.qty} = ${fmt(i.price * i.qty)}ج`).join("\n") +
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
    // save the order in the database (prices are recalculated on the server)
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ id: orderId, cart, pay, note: note.trim() }),
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
                  <b>{fmt(l.coins)} كوين</b>
                  <small>{getItem(l.id)!.label}{l.offer ? " · " + l.offer : ""}</small>
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
          <input id="cNote" placeholder="ملاحظات (اختياري): السيرفر، نوع الجهاز..." value={note} onChange={(e) => setNote(e.target.value)} />
          <select id="cPay" value={pay} onChange={(e) => setPay(e.target.value)}>
            {PAY.map((p) => <option key={p}>{p}</option>)}
          </select>
          <div className="total"><span>الإجمالي</span><span id="total">{fmt(total)} ج</span></div>
          <a className={`btn btn-wa${disabled ? " disabled" : ""}`} id="checkout" href={href} target="_blank" rel="noopener" onClick={onCheckout}>{label}</a>
        </footer>
      </aside>
    </>
  );
}

export function Toast() {
  const { toastState } = useStore();
  return (
    <div className={`toast${toastState.on ? " on" : ""}`} id="toast">🟡 <span id="toastTxt">{toastState.text}</span></div>
  );
}
