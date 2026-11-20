"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Platform, Product, StoreData, User } from "@/lib/types";

export { WA_NUMBER as WA } from "@/lib/contact";
export const fmt = (n: number) => n.toLocaleString("en-US");

export type AuthMode = "reg" | "login" | "acc";
type CartMap = Record<string, number>;
type Ctx = {
  data: StoreData;
  user: User | null;
  setUser: (u: User | null) => void;
  cart: CartMap;
  setQty: (id: string, delta: number) => void;
  addToCart: (id: string, x: number, y: number) => void;
  clearCart: () => void;
  getItem: (id: string) => (Product & { label: string }) | null;
  cartOpen: boolean;
  openCart: (v: boolean) => void;
  auth: { open: boolean; mode: AuthMode; hint?: string; n: number };
  openAuth: (mode: AuthMode, hint?: string) => void;
  closeAuth: () => void;
  pendingCheckout: React.MutableRefObject<boolean>;
  tab: string;
  setTab: (k: string) => void;
  toast: (t: string) => void;
  toastState: { text: string; on: boolean };
  badgePop: number;
  addMany: (lines: { id: string; qty: number }[], x: number, y: number) => void;
  promo: { code: string; percent: number } | null;
  setPromo: (p: { code: string; percent: number } | null) => void;
};

const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreCtx missing");
  return c;
};

/* gold coins flying from the click point into the cart button */
export function coinBurst(x: number, y: number) {
  const cartBtn = document.getElementById("cartBtn");
  if (!cartBtn) return;
  const target = cartBtn.getBoundingClientRect();
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("div");
    c.className = "burst";
    c.style.left = x + "px";
    c.style.top = y + "px";
    document.body.appendChild(c);
    const dx = (Math.random() - 0.5) * 160,
      dy = -60 - Math.random() * 120;
    c.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(1.1)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${target.left + 23 - x}px,${target.top + 23 - y}px) scale(.3)`, opacity: 0.2 },
      ],
      { duration: 900 + i * 40, easing: "cubic-bezier(.3,.7,.4,1)" }
    ).onfinish = () => c.remove();
  }
}

export function goToPrices(setTab: (k: string) => void, k: string) {
  setTab(k);
  document.getElementById("prices")?.scrollIntoView({ behavior: "smooth" });
}

export function StoreProvider({ data, initialUser, children }: { data: StoreData; initialUser: User | null; children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [cart, setCart] = useState<CartMap>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [auth, setAuth] = useState<Ctx["auth"]>({ open: false, mode: "reg", n: 0 });
  const [tab, setTab] = useState(data.platforms[0]?.key ?? "android");
  const [toastState, setToast] = useState({ text: "اتضاف للسلة", on: false });
  const [badgePop, setBadgePop] = useState(0);
  const [promo, setPromo] = useState<{ code: string; percent: number } | null>(null);
  const pendingCheckout = useRef(false);
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined);

  const byId = useMemo(() => {
    const m = new Map<string, Product & { label: string }>();
    data.platforms.forEach((p: Platform) => p.items.forEach((it) => !it.ask && m.set(it.id, { ...it, label: p.label })));
    return m;
  }, [data]);
  const getItem = useCallback((id: string) => byId.get(id) ?? null, [byId]);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("amir_cart") || "{}"));
    } catch {}
  }, []);
  // persist inside the updater so a not-yet-loaded empty cart never overwrites storage
  const updateCart = useCallback((fn: (c: CartMap) => CartMap) => {
    setCart((c) => {
      const n = fn(c);
      try {
        localStorage.setItem("amir_cart", JSON.stringify(n));
      } catch {}
      return n;
    });
  }, []);

  const toast = useCallback((text: string) => {
    setToast({ text, on: true });
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToast((s) => ({ ...s, on: false })), 1800);
  }, []);

  const addToCart = useCallback(
    (id: string, x: number, y: number) => {
      updateCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
      setBadgePop((n) => n + 1);
      coinBurst(x, y);
      const it = byId.get(id);
      if (it) toast(it.kind === "bundle" ? `باقة ${it.name} اتضافت للسلة` : `${fmt(it.c)} كوين اتضافوا للسلة`);
    },
    [byId, toast, updateCart]
  );

  const addMany = useCallback(
    (lines: { id: string; qty: number }[], x: number, y: number) => {
      updateCart((c) => {
        const n = { ...c };
        lines.forEach((l) => (n[l.id] = (n[l.id] || 0) + l.qty));
        return n;
      });
      setBadgePop((n) => n + 1);
      coinBurst(x, y);
      toast("التشكيلة اتضافت للسلة 🎯");
    },
    [toast, updateCart]
  );

  const setQty = useCallback(
    (id: string, d: number) => {
      updateCart((c) => {
        const n = { ...c, [id]: Math.max(0, (c[id] || 0) + d) };
        if (!n[id]) delete n[id];
        return n;
      });
    },
    [updateCart]
  );

  const value: Ctx = {
    data,
    user,
    setUser,
    cart,
    setQty,
    addToCart,
    getItem,
    clearCart: () => updateCart(() => ({})),
    cartOpen,
    openCart: setCartOpen,
    auth,
    openAuth: (mode, hint) => setAuth((a) => ({ open: true, mode, hint, n: a.n + 1 })),
    closeAuth: () => setAuth((a) => ({ ...a, open: false })),
    pendingCheckout,
    tab,
    setTab,
    toast,
    toastState,
    badgePop,
    addMany,
    promo,
    setPromo,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
