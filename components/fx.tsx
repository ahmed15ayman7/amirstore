"use client";
import { createElement, useEffect, useRef, useState } from "react";

/* reveal-on-scroll with sibling stagger (same as the original IntersectionObserver) */
export function Reveal({
  as = "div",
  className = "",
  style,
  children,
  ...rest
}: { as?: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [delay, setDelay] = useState<null | number>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const sibs = [...(el.parentElement?.children ?? [])].filter((x) => x.classList.contains("reveal"));
          setDelay(sibs.indexOf(el) * 0.08);
          io.disconnect();
        }),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return createElement(
    as,
    {
      ref,
      ...rest,
      className: `${className} reveal${delay !== null ? " in" : ""}`.trim(),
      style: delay !== null ? { ...style, transitionDelay: delay + "s" } : style,
    },
    children
  );
}

/* 3D tilt + glare position */
export function tilt(max = 12) {
  return {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const el = e.currentTarget,
        r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width,
        y = (e.clientY - r.top) / r.height;
      el.style.transform = `rotateY(${(x - 0.5) * max}deg) rotateX(${(0.5 - y) * max}deg) translateZ(10px)`;
      el.style.setProperty("--mx", x * 100 + "%");
      el.style.setProperty("--my", y * 100 + "%");
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "";
    },
  };
}

export function Loader() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    const done = () => (t1 = setTimeout(() => setHide(true), 700));
    if (document.readyState === "complete") done();
    else addEventListener("load", done, { once: true });
    const t2 = setTimeout(() => setHide(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      removeEventListener("load", done);
    };
  }, []);
  return (
    <div id="loader" className={hide ? "hide" : ""}>
      <div>
        <div className="loader-coin">
          <span>A</span>
          <span>A</span>
        </div>
        <div className="loader-txt">AMIR STORE</div>
      </div>
    </div>
  );
}

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mv = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.style.left = e.clientX + "px";
        ref.current.style.top = e.clientY + "px";
      }
    };
    addEventListener("pointermove", mv, { passive: true });
    return () => removeEventListener("pointermove", mv);
  }, []);
  return <div className="glow" id="glow" ref={ref} />;
}

export function Counter({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t = setTimeout(() => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.max(0, Math.min(1, (now - t0) / 1600));
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 1200);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return <b>{v}</b>;
}

export function Snow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!,
      ctx = cv.getContext("2d")!;
    let W = 0,
      H = 0,
      raf = 0;
    let flakes: { x: number; y: number; r: number; s: number; w: number }[] = [];
    const size = () => {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      flakes = Array.from({ length: Math.min(140, W / 8) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.4 + 0.6,
        s: Math.random() * 0.8 + 0.3,
        w: Math.random() * Math.PI * 2,
      }));
    };
    size();
    addEventListener("resize", size);
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(220,240,255,.85)";
      flakes.forEach((f) => {
        f.y += f.s;
        f.w += 0.01;
        f.x += Math.sin(f.w) * 0.4;
        if (f.y > H) {
          f.y = -5;
          f.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 7);
        ctx.fill();
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, []);
  return <canvas id="snow" ref={ref} />;
}
