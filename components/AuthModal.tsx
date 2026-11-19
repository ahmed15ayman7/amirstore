"use client";
import { useEffect, useState } from "react";
import { coinBurst, fmt, useStore } from "./store";
import type { Order } from "@/lib/types";

const DEFAULT_HINT = "سجّل مرة واحدة وكل طلباتك هتتحفظ في حسابك";
const EMPTY = { fName: "", fPhone: "", fPlat: "أندرويد", fEmail: "", fPass: "" };
type F = typeof EMPTY;

const normPhone = (p: string) =>
  p.replace(/[^\d٠-٩]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/^(\+?20)/, "0").replace(/^20(?=1)/, "0");

export default function AuthModal() {
  const { auth, closeAuth, user, setUser, toast, pendingCheckout, openCart } = useStore();
  const [mode, setMode] = useState<"reg" | "login">("reg");
  const [f, setF] = useState<F>(EMPTY);
  const [err, setErr] = useState("");
  const [bad, setBad] = useState<keyof F | null>(null);
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  const showAcc = auth.mode === "acc" && !!user;

  useEffect(() => {
    if (!auth.open) return;
    if (auth.mode === "acc" && user) {
      setOrders(null);
      fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? [])).catch(() => setOrders([]));
    } else {
      setMode(auth.mode === "login" ? "login" : "reg");
      setErr("");
      setBad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.n]);

  const switchMode = (m: "reg" | "login") => {
    setMode(m);
    setErr("");
    setBad(null);
  };

  const flag = (k: keyof F, msg: string) => {
    setBad(null);
    requestAnimationFrame(() => {
      setBad(k);
      (document.getElementById(k) as HTMLInputElement | null)?.focus();
    });
    setErr(msg);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBad(null);
    const phone = normPhone(f.fPhone), name = f.fName.trim(), email = f.fEmail.trim(), pass = f.fPass;
    if (mode === "reg" && name.length < 3) return flag("fName", "اكتب اسمك بالكامل");
    if (!/^01[0125]\d{8}$/.test(phone)) return flag("fPhone", "اكتب رقم موبايل مصري صحيح (11 رقم)");
    if (mode === "reg" && email && !/^\S+@\S+\.\S+$/.test(email)) return flag("fEmail", "الإيميل مش مظبوط");
    if (pass.length < 6) return flag("fPass", "كلمة السر لازم تكون 6 حروف أو أرقام على الأقل");
    setBusy(true);
    try {
      const r = await fetch(`/api/auth/${mode === "reg" ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, pass, platform: f.fPlat }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (d.field) flag(d.field, d.error);
        else setErr(d.error || "حصلت مشكلة، جرب تاني");
        return;
      }
      setUser(d.user);
      setF(EMPTY);
      closeAuth();
      coinBurst(innerWidth / 2, innerHeight / 2);
      const first = d.user.name.split(" ")[0];
      toast(mode === "reg" ? `أهلاً ${first}، حسابك اتعمل 🎉` : `أهلاً بيك تاني ${first} 👋`);
      if (pendingCheckout.current) {
        pendingCheckout.current = false;
        setTimeout(() => openCart(true), 350);
      }
    } catch {
      setErr("حصلت مشكلة، جرب تاني");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    closeAuth();
    toast("اتسجل خروجك");
  };

  const field = (k: keyof F) => ({
    id: k,
    value: f[k],
    className: bad === k ? "bad" : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value })),
  });

  return (
    <div
      className={`modal-wrap${auth.open ? " on" : ""}`}
      id="authWrap"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuth();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="x" onClick={closeAuth}>✕</button>
        <img src="/coins.png" className="modal-ic" alt="" />
        {!showAcc ? (
          <div id="authView">
            <h3>أهلاً بيك في <span className="gold-text">Amir Store</span></h3>
            <p className="hint" id="authHint">{auth.hint || DEFAULT_HINT}</p>
            <div className={`seg${mode === "login" ? " login" : ""}`} id="seg">
              <span className="pillbg"></span>
              <button className={mode === "reg" ? "on" : ""} onClick={() => switchMode("reg")}>حساب جديد</button>
              <button className={mode === "login" ? "on" : ""} onClick={() => switchMode("login")}>تسجيل دخول</button>
            </div>
            <form id="authForm" noValidate onSubmit={submit}>
              {mode === "reg" && (
                <div className="field"><label>الاسم بالكامل</label><input {...field("fName")} autoComplete="name" placeholder="مثلاً: أحمد محمد" /></div>
              )}
              <div className="field">
                <label>رقم الموبايل (واتساب)</label>
                <input {...field("fPhone")} inputMode="tel" autoComplete="tel" placeholder="01xxxxxxxxx" dir="ltr" style={{ textAlign: "right" }} />
              </div>
              {mode === "reg" && (
                <div className="row2">
                  <div className="field">
                    <label>المنصة</label>
                    <select {...field("fPlat")}>
                      <option>أندرويد</option><option>آيفون</option><option>ستيم</option><option>أكتر من منصة</option>
                    </select>
                  </div>
                  <div className="field"><label>الإيميل (اختياري)</label><input {...field("fEmail")} type="email" autoComplete="email" placeholder="name@mail.com" dir="ltr" /></div>
                </div>
              )}
              <div className="field">
                <label>كلمة السر</label>
                <input {...field("fPass")} type="password" autoComplete={mode === "reg" ? "new-password" : "current-password"} placeholder="6 حروف أو أرقام على الأقل" />
              </div>
              <div className="err" id="authErr">{err}</div>
              <button className="btn btn-gold" type="submit" id="authSubmit" disabled={busy}>
                {busy ? "لحظة..." : mode === "reg" ? "إنشاء الحساب" : "دخول"}
              </button>
              <p className="privacy">🔒 بياناتك بنستخدمها لتأكيد طلباتك والتواصل معاك بس.</p>
            </form>
          </div>
        ) : (
          <div id="accView">
            <h3>حسابي</h3>
            <div className="acc-info" id="accInfo">
              {[["الاسم", user!.name], ["الموبايل", user!.phone], ["المنصة", user!.platform || "-"], ["الإيميل", user!.email || "-"]].map(([a, b]) => (
                <div key={a}><span>{a}</span><span>{b}</span></div>
              ))}
            </div>
            <b style={{ display: "block", marginBottom: 8 }}>طلباتي</b>
            <div className="orders" id="ordersList">
              {orders === null ? (
                <div className="order" style={{ textAlign: "center", color: "var(--muted)" }}>لحظة...</div>
              ) : orders.length ? (
                orders.map((o) => (
                  <div className="order" key={o.id}>
                    <b>#{o.id}</b> · {new Date(o.date).toLocaleDateString("ar-EG")}
                    <br />
                    {o.items.map((i) => fmt(i.coins) + " كوين ×" + i.qty).join(" + ")}
                    <br />
                    الإجمالي: <b>{fmt(o.total)} ج</b> · {o.status}
                  </div>
                ))
              ) : (
                <div className="order" style={{ textAlign: "center", color: "var(--muted)" }}>لسه مفيش طلبات</div>
              )}
            </div>
            <button className="btn btn-ghost" id="logout" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>تسجيل خروج</button>
          </div>
        )}
      </div>
    </div>
  );
}
