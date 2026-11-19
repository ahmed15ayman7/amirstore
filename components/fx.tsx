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

/* Intro: 3D coin with thickness + rings, letter-by-letter wordmark, real load progress, curtain split exit */
const MIN_SHOW = 1600; // ms — long enough for the wordmark animation to finish
export function Loader() {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState<"load" | "done" | "out" | "gone">("load");

  useEffect(() => {
    const t0 = performance.now();
    let loaded = document.readyState === "complete";
    let shown = 0,
      raf = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onLoad = () => (loaded = true);
    if (!loaded) addEventListener("load", onLoad, { once: true });
    document.documentElement.classList.add("ld-lock");

    const tick = () => {
      const el = performance.now() - t0;
      // eases toward 90% while loading, then runs to 100% (min show time; 4.5s safety cap)
      const ready = (loaded && el > MIN_SHOW) || el > 4500;
      const target = ready ? 100 : 90 * (1 - Math.exp(-el / 900));
      shown += (target - shown) * (ready ? 0.18 : 0.08);
      if (ready && shown > 99.5) shown = 100;
      setPct(Math.round(shown));
      if (shown < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }
      timers.push(setTimeout(() => setPhase("done"), 120));
      timers.push(setTimeout(() => {
        setPhase("out");
        document.documentElement.classList.remove("ld-lock");
      }, 420));
      timers.push(setTimeout(() => setPhase("gone"), 1500));
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      removeEventListener("load", onLoad);
      document.documentElement.classList.remove("ld-lock");
    };
  }, []);

  const word = "AMIR STORE".split("");
  return (
    <div id="loader" className={phase === "load" ? "" : phase === "out" ? "done out" : phase} aria-hidden={phase !== "load"}>
      <div className="ld-cur t"></div>
      <div className="ld-cur b"></div>
      <div className="ld-bg"></div>
      <div className="ld-in">
        <div className="ld-stage">
          <div className="ld-glow"></div>
          <div className="ld-ring r1"></div>
          <div className="ld-ring r2"></div>
          <div className="ld-coin">
            {Array.from({ length: 11 }, (_, i) => (
              <i key={i} style={{ transform: `translateZ(${i - 5}px)` }}></i>
            ))}
            <div className="face f">A</div>
            <div className="face k">A</div>
          </div>
          <div className="ld-shadow"></div>
        </div>
        <div className="ld-word">
          {word.map((ch, i) => (
            <span key={i} className={ch === " " ? "sp" : undefined} style={{ animationDelay: `${0.35 + i * 0.06}s` }}>
              {ch === " " ? "" : ch}
            </span>
          ))}
        </div>
        <div className="ld-sub">eFootball™ COINS · SINCE 2021</div>
        <div className="ld-bar"><b style={{ transform: `scaleX(${pct / 100})` }}></b></div>
        <div className="ld-pct">{String(pct).padStart(2, "0")}%</div>
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
